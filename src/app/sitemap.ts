import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/url';
import connectDB from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  let resumeEntries: MetadataRoute.Sitemap = [];

  try {
    await connectDB();
    const publicResumes = await ResumeVariant.find(
      { publicViewEnabled: true, status: 'ready', fileUrl: { $ne: null } },
      { slug: 1, updatedAt: 1 }
    ).lean();

    resumeEntries = publicResumes.map((item: any) => ({
      url: `${siteUrl}/resume/${item.slug}`,
      lastModified: item.updatedAt || now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    resumeEntries = [];
  }

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/education`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...resumeEntries,
  ];
}
