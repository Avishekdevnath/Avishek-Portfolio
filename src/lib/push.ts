import webpush from 'web-push';
import connectDB from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(payload: PushPayload): Promise<void> {
  if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('Push notifications not configured — VAPID env vars missing');
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  await connectDB();
  const subscriptions = await PushSubscription.find({});

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
      )
    )
  );

  // Remove expired subscriptions (410 Gone)
  const expiredEndpoints = results
    .map((result, i) => ({ result, sub: subscriptions[i] }))
    .filter(({ result }) =>
      result.status === 'rejected' &&
      (result.reason as { statusCode?: number }).statusCode === 410
    )
    .map(({ sub }) => sub.endpoint);

  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
  }
}
