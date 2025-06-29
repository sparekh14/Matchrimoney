# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- AWS S3 bucket for file uploads
- Resend account for emails

## Quick Deployment Steps

### 1. Backend Deployment
```bash
# From root directory
vercel --prod
```

This deploys the backend to `/api/*` routes.

### 2. Frontend Deployment
```bash
# Create new Vercel project for frontend
cd frontend
vercel --prod
```

### 3. Environment Variables

#### Backend (Root Vercel Project)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-here
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
RESEND_API_KEY=re_...
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Frontend (Frontend Vercel Project)
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_GEOAPIFY_API_KEY=your-geoapify-key
```

### 4. Database Migrations
```bash
# After backend deployment
vercel env pull .env.local
cd backend
npx prisma migrate deploy
```

### 5. Test Deployment
- Backend health check: `https://your-backend.vercel.app/api/health`
- Frontend: `https://your-frontend.vercel.app`

## File Structure for Vercel

```
✅ Root vercel.json - Backend serverless config
✅ frontend/vercel.json - Frontend SPA config  
✅ .vercelignore - Exclude unnecessary files
✅ Backend exports Express app properly
✅ Frontend configured for SPA routing
```

## Troubleshooting

### Backend Issues
- Check `/api/health` endpoint
- Verify environment variables in Vercel dashboard
- Check function logs in Vercel dashboard

### Frontend Issues  
- Ensure `VITE_API_URL` points to backend deployment
- Check browser console for CORS errors
- Verify SPA routing with `rewrites` in vercel.json

### Database Issues
- Run `npx prisma migrate deploy` after changes
- Check DATABASE_URL format
- Ensure database is accessible from Vercel

## Development vs Production

### Development
```bash
npm run dev  # Runs both frontend and backend locally
```

### Production
- Backend: Serverless functions on Vercel
- Frontend: Static site on Vercel  
- Database: Vercel Postgres or external PostgreSQL
- Files: AWS S3 for user uploads 