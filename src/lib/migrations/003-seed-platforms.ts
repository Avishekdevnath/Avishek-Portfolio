import { PlatformList } from '@/models/PlatformList';

const PREDEFINED_PLATFORMS = [
  {
    name: 'linkedin',
    description: 'Professional networking platform',
    url: 'https://linkedin.com/jobs',
  },
  {
    name: 'indeed',
    description: 'Job search engine',
    url: 'https://indeed.com',
  },
  {
    name: 'glassdoor',
    description: 'Company reviews and job listings',
    url: 'https://glassdoor.com',
  },
  {
    name: 'github jobs',
    description: 'Tech and developer jobs',
    url: 'https://github.com/jobs',
  },
  {
    name: 'angellist',
    description: 'Startup jobs and funding',
    url: 'https://angel.co/jobs',
  },
  {
    name: 'buildin',
    description: 'Career growth and job matching',
    url: 'https://buildin.com',
  },
  {
    name: 'wellfound',
    description: 'Startup jobs (formerly AngelList Talent)',
    url: 'https://wellfound.com/jobs',
  },
  {
    name: 'stack overflow jobs',
    description: 'Developer and tech jobs',
    url: 'https://stackoverflow.com/jobs',
  },
  {
    name: 'remoteok',
    description: 'Remote job listings',
    url: 'https://remoteok.com',
  },
  {
    name: 'weworkremotely',
    description: 'Remote and flexible jobs',
    url: 'https://weworkremotely.com',
  },
  {
    name: 'others',
    description: 'Other job sources',
    url: undefined,
  },
];

export async function seedPlatforms() {
  try {
    for (const platform of PREDEFINED_PLATFORMS) {
      const exists = await PlatformList.findOne({
        name: platform.name.toLowerCase(),
      });

      if (!exists) {
        await PlatformList.create({
          name: platform.name.toLowerCase(),
          description: platform.description,
          url: platform.url,
          isActive: true,
        });
        console.log(`✓ Created platform: ${platform.name}`);
      } else {
        console.log(`✓ Platform already exists: ${platform.name}`);
      }
    }

    console.log('Platform seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Platform seeding failed:', error);
    return { success: false, error };
  }
}
