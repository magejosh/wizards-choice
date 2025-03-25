# Deployment Guide - Wizard's Choice

This guide provides detailed instructions for deploying the Wizard's Choice game to various platforms.

## Local Development Deployment

### Prerequisites
- Node.js 16.0 or higher
- npm or pnpm package manager
- Git

### Steps

1. Clone the repository
```bash
git clone https://github.com/magejosh/wizards-choice.git
cd wizard-choice
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
pnpm dev
```

4. Access the application at `http://localhost:3000`

## Production Deployment Options

### Netlify Deployment

Netlify offers a straightforward way to deploy Next.js applications with minimal configuration.

#### Prerequisites
- GitHub, GitLab, or Bitbucket repository with your Wizard's Choice code
- Netlify account

#### Steps

1. Push your code to a Git repository

2. Log in to Netlify and click "New site from Git"

3. Select your repository and configure the following settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables (if needed)

4. Click "Deploy site"

5. Once deployment is complete, your site will be available at the provided Netlify URL

#### Custom Domain Setup (Optional)

1. In the Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS settings

### Vercel Deployment

Vercel is optimized for Next.js applications and provides the simplest deployment experience.

#### Prerequisites
- GitHub, GitLab, or Bitbucket repository with your Wizard's Choice code
- Vercel account

#### Steps

1. Push your code to a Git repository

2. Log in to Vercel and click "New Project"

3. Import your repository

4. Vercel will automatically detect Next.js settings, but verify the following:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Environment variables (if needed)

5. Click "Deploy"

6. Once deployment is complete, your site will be available at the provided Vercel URL

#### Custom Domain Setup (Optional)

1. In the Vercel dashboard, go to "Domains"
2. Click "Add" and enter your domain
3. Follow the instructions to configure your DNS settings

### Hostinger VPS Deployment

For more control over your deployment, you can use a VPS provider like Hostinger.

#### Prerequisites
- Hostinger VPS or similar server
- SSH access to your server
- Node.js 16.0 or higher installed on the server
- Nginx installed on the server
- PM2 or similar process manager

#### Steps

1. SSH into your VPS
```bash
ssh username@your-server-ip
```

2. Install Node.js if not already installed
```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install PM2 globally
```bash
sudo npm install -g pm2
```

4. Clone the repository
```bash
git clone https://github.com/magejosh/wizards-choice.git
cd wizard-choice
```

5. Install dependencies
```bash
npm install
```

6. Build the application
```bash
npm run build
```

7. Start the application with PM2
```bash
pm2 start npm --name "wizard-choice" -- start
```

8. Configure PM2 to start on boot
```bash
pm2 startup
pm2 save
```

9. Configure Nginx as a reverse proxy

Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/wizard-choice
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

10. Enable the site and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/wizard-choice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

11. Set up SSL with Let's Encrypt (recommended)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

12. Your site should now be accessible at your domain with HTTPS

## Updating Your Deployment

### Netlify/Vercel

Both Netlify and Vercel support automatic deployments when you push changes to your repository. Simply push your changes, and the platforms will automatically rebuild and deploy your application.

### VPS

To update your application on a VPS:

1. SSH into your server
```bash
ssh username@your-server-ip
```

2. Navigate to your application directory
```bash
cd wizard-choice
```

3. Pull the latest changes
```bash
git pull
```

4. Install any new dependencies
```bash
npm install
```

5. Rebuild the application
```bash
npm run build
```

6. Restart the application with PM2
```bash
pm2 restart wizard-choice
```

## Troubleshooting

### Common Issues

#### Build Failures
- Check your Node.js version is compatible (16.0 or higher)
- Verify all dependencies are installed correctly
- Check for TypeScript errors in your code

#### Runtime Errors
- Check the server logs for error messages
- Verify environment variables are set correctly
- Ensure the server has sufficient resources (memory, CPU)

#### Deployment Timeouts
- Large applications may exceed default build timeouts
- Increase the build timeout in your deployment platform settings

### Getting Help

If you encounter issues not covered in this guide:
- Check the Next.js documentation: https://nextjs.org/docs
- Visit the deployment platform's support resources
- Consult the project's GitHub issues for similar problems

## Security Considerations

- Always use HTTPS in production
- Keep your Node.js and npm packages updated
- Implement proper authentication and authorization
- Set up proper CORS policies
- Consider implementing rate limiting for API endpoints

## Performance Optimization

- Enable caching for static assets
- Implement CDN for global distribution
- Optimize images and other media
- Consider server-side rendering for critical pages
- Implement code splitting to reduce initial load time
