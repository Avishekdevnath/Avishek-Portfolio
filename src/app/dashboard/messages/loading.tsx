import LoadingScreen from '@/components/shared/LoadingScreen';

export default function MessagesLoading() {
  return (
    <LoadingScreen 
      type="messages"
      message="Loading your messages..."
      className="min-h-[80vh]"
    />
  );
}