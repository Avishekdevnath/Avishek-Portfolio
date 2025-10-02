# Production Environment Setup

## Required Environment Variables

To fix the production errors, you need to set the following environment variables in your Vercel deployment:

### 1. Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://avishekdevnath.vercel.app
```

### 2. Database Configuration
```
MONGODB_URI=your-mongodb-connection-string
```

### 3. Email Configuration (if using contact forms)
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 4. Cloudinary Configuration (if using image uploads)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (avishekdevnath)
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Redeploy your application

## Critical Fix Applied

The main issue was in `src/app/projects/[id]/page.tsx` where:
- The code was trying to fetch from `localhost:3000` in production
- Changed to use relative URLs (`/api/projects/${id}`) which work in both dev and production
- Changed cache strategy from `no-store` to `force-cache` to enable static generation
- Improved `generateStaticParams` to properly generate static pages

After setting the environment variables and redeploying, the errors should be resolved.

