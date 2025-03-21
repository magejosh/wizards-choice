# Deployment Guide for Wizard's Choice Web Application

This document provides instructions for deploying the Wizard's Choice web application permanently.

## Prerequisites

- Node.js and npm installed
- Cloudflare account for deployment
- Git for version control

## Local Development

1. Clone the repository:
```
git clone https://github.com/yourusername/wizards-choice-web.git
```

2. Navigate to the project directory:
```
cd wizards-choice-web
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the project for production:

```
npm run build
```

The built files will be in the `.next` directory.

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

1. Push your code to a GitHub repository

2. Log in to your Cloudflare dashboard

3. Navigate to Pages > Create a project

4. Connect your GitHub repository

5. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/`

6. Deploy the site

7. Your site will be available at `https://wizards-choice.pages.dev` (or your custom domain)

### Option 2: Vercel

1. Install the Vercel CLI:
```
npm install -g vercel
```

2. Deploy the application:
```
vercel
```

3. Follow the prompts to complete the deployment

### Option 3: Netlify

1. Push your code to a GitHub repository

2. Log in to your Netlify dashboard

3. Click "New site from Git"

4. Connect your GitHub repository

5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

6. Deploy the site

## Custom Domain Setup

To use a custom domain with your deployment:

1. Purchase a domain from a domain registrar

2. Add the domain in your deployment platform (Cloudflare Pages, Vercel, or Netlify)

3. Configure DNS settings as instructed by the platform

4. Wait for DNS propagation (can take up to 48 hours)

## Maintenance and Updates

To update the deployed application:

1. Make changes to your local repository

2. Test changes locally

3. Commit and push changes to GitHub

4. The deployment platform will automatically rebuild and deploy the updated site

## Troubleshooting

If you encounter issues with the deployment:

1. Check the build logs in your deployment platform

2. Ensure all dependencies are correctly installed

3. Verify that the build command and output directory are correctly configured

4. Check for any environment variables that need to be set

## Support

For additional support, please contact the development team or refer to the documentation of your chosen deployment platform.
