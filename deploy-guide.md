# Matchrimony Netlify Deployment Guide

This guide will help you deploy your Matchrimony application to Netlify with a Neon PostgreSQL database.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Neon Account**: Sign up at [neon.tech](https://neon.tech) for free PostgreSQL hosting

## Step 1: Set up Neon PostgreSQL Database

1. **Sign up for Neon**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up with your GitHub account or email
   - Create a new project

2. **Get your database connection string**:
   - In your Neon dashboard, click "Connect"
   - Copy the connection string (it looks like `postgresql://...`)
   - Save this for later - you'll need it for Netlify environment variables

3. **Run your migrations**:
   - Update your local `.env` file with the Neon DATABASE_URL
   - Run: `npm run db:migrate:prod`

## Step 2: Deploy to Netlify

1. **Connect your repository**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Configure build settings**:
   - Build command: `npm run build:netlify`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`

## Step 3: Configure Environment Variables

In your Netlify site dashboard, go to "Site settings" > "Environment variables" and add:

### Required Variables:
```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-random-jwt-secret
JWT_REFRESH_SECRET=your-random-refresh-secret
NODE_ENV=production
CLIENT_URL=https://your-site-name.netlify.app
```

### Optional Variables (for full functionality):
```
EMAIL_VERIFICATION_SECRET=your-email-secret
PASSWORD_RESET_SECRET=your-password-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Frontend Variables:
```
VITE_API_URL=/api
VITE_GEOAPIFY_API_KEY=40a230ecfd9e4d15ad2b61afe78752da
```

## Step 4: Deploy

1. Push your code to GitHub
2. Netlify will automatically build and deploy
3. Your site will be available at `https://your-site-name.netlify.app`

## Step 5: Test Your Deployment

1. Visit your site URL
2. Test the API health endpoint: `https://your-site-name.netlify.app/api/health`
3. Try creating an account and logging in

## Troubleshooting

### Common Issues:

1. **Database connection errors**:
   - Verify your DATABASE_URL is correct
   - Make sure you've run migrations: `npm run db:migrate:prod`

2. **CORS errors**:
   - The API function automatically includes your Netlify URL in CORS origins

3. **Function timeout**:
   - Netlify Functions have a 10-second timeout on free plans
   - If database queries are slow, consider optimizing them

4. **Build errors**:
   - Check the deploy log in Netlify dashboard
   - Ensure all dependencies are in package.json

### Environment Variable Debugging:

You can check if environment variables are set by visiting:
`https://your-site-name.netlify.app/api/health`

This endpoint shows the current environment and timestamp.

## Optional: Custom Domain

1. In Netlify dashboard, go to "Domain settings"
2. Add your custom domain
3. Follow Netlify's instructions to update DNS records

## Database Management

- **View data**: Use Neon's built-in SQL editor
- **Migrations**: Run `npm run db:migrate:prod` locally, then redeploy
- **Backups**: Neon automatically handles backups on their free tier

## Cost Optimization

- **Neon**: Free tier includes 0.5GB storage and 191.9 compute hours/month
- **Netlify**: Free tier includes 100GB bandwidth and 300 build minutes/month
- **S3**: Only charged for actual usage (uploads/downloads)

Your application should run completely free on this setup for small to medium traffic!

## Support

- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Issues**: Check the GitHub repository issues section 