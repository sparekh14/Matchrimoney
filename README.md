# Matchrimoney 💍💰

**Cut Your Wedding Costs in Half by Connecting with Other Couples**

Matchrimoney is a comprehensive web platform that helps engaged couples save money on their wedding by connecting them with other couples getting married around the same time and location. Share vendor costs, split expenses, and make lifelong friendships while planning your dream wedding for less.

## 🏗️ Architecture

This is a full-stack monorepo containing:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Deployment**: Vercel (both frontend and backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- PostgreSQL database (can use Vercel Postgres)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd Matchrimony
npm run install:all
```

2. **Set up environment variables:**

Create `backend/.env`:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-super-secret-jwt-key"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
RESEND_API_KEY="your-resend-api-key"
FRONTEND_URL="http://localhost:5173"
```

Create `frontend/.env`:
```env
VITE_API_URL="http://localhost:5000"
VITE_GEOAPIFY_API_KEY="your-geoapify-api-key"
```

3. **Set up the database:**
```bash
npm run db:generate
npm run db:migrate
```

4. **Start development servers:**
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:5000).

## 🌐 Deploying to Vercel

### Step 1: Database Setup
1. Create a Vercel Postgres database in your Vercel dashboard
2. Note the connection string for environment variables

### Step 2: Environment Variables
In your Vercel project settings, add these environment variables:

```env
DATABASE_URL=your-vercel-postgres-url
JWT_SECRET=your-super-secret-jwt-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 3: Deploy Backend
1. Deploy the root directory to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. The backend will be available at `/api/*` routes

### Step 4: Deploy Frontend
1. Create a separate Vercel project for the frontend
2. Set the root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend-deployment.vercel.app`

### Step 5: Run Database Migrations
After deployment, run migrations using Vercel CLI:
```bash
vercel env pull .env.local
cd backend
npx prisma migrate deploy
```

## 📁 Project Structure

```
Matchrimony/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   └── types/          # TypeScript type definitions
│   └── vercel.json         # Frontend Vercel configuration
├── backend/                 # Express backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── validators/     # Request validation schemas
│   ├── prisma/            # Database schema and migrations
│   └── index.ts           # Main server file
├── vercel.json            # Backend Vercel configuration
└── package.json           # Root package.json with workspace scripts
```

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both projects
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean all node_modules and build files

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio

## 🔧 Features

- **Authentication**: JWT-based with email verification
- **User Profiles**: Complete profile management with image uploads
- **Marketplace**: Vendor listings and cost-sharing
- **Matching**: Algorithm-based couple matching
- **Messaging**: Real-time messaging between couples
- **File Uploads**: S3-based image storage

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- JWT token authentication
- Input validation with Zod
- SQL injection protection with Prisma

## 📚 Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for forms

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT for authentication
- AWS S3 for file storage
- Resend for email services

### Deployment
- Vercel for hosting both frontend and backend
- Vercel Postgres for database
- AWS S3 for file storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure builds pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Features

### Core Features
- **Smart Couple Matching**: Advanced algorithm matches couples based on wedding date proximity (40%), location (30%), budget similarity (20%), and shared vendor categories (10%)
- **Secure Authentication**: JWT-based authentication with email verification and password reset
- **Real-time Messaging**: Connect and communicate with matched couples
- **Advanced Search & Filtering**: Find couples by location, date range, theme, budget, and vendor interests
- **Profile Management**: Comprehensive profile editing with wedding details and preferences

### Wedding Services Supported
- Photography & Videography
- Venue & Catering
- Flowers & Decorations
- Music & Entertainment
- Transportation
- Wedding Planning
- Hair & Makeup
- Wedding Attire

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with your wedding details
3. **Complete Profile**: Add your bio and edit wedding preferences
4. **Browse Marketplace**: Discover compatible couples using custom filtering
5. **Start Messaging (Future)**: Connect with couples that match your criteria

### Key Features

#### Smart Matching Algorithm
The platform uses a sophisticated compatibility scoring system:
- **Date Proximity (40%)**: Couples with closer wedding dates score higher
- **Location Match (30%)**: Geographic proximity for vendor sharing
- **Budget Similarity (20%)**: Similar budget ranges for cost-sharing opportunities
- **Shared Interests (10%)**: Common vendor categories of interest

#### Marketplace Filtering
- Search by location (city, state)
- Filter by wedding date range
- Filter by wedding theme
- Filter by budget range
- Filter by vendor categories

## 🆘 Support

For support, email support@matchrimoney.com or create an issue in the GitHub repository.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core matching algorithm
- ✅ Profile management
- ✅ Marketplace filtering

### Phase 2 (Planned)
- 💬 Messaging system
- 📅 Calendar integration
- 📱 Mobile app

### Phase 3 (Future)
- 🤖 AI-powered recommendations
- 🎥 Video calling
- 📍 Vendor directory
- 📈 Cost tracking
- 🌍 International expansion

---

**Made with ❤️ for couples planning their perfect wedding** 