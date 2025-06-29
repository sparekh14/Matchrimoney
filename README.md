# Matchrimoney 💍💰

**Cut Your Wedding Costs in Half by Connecting with Other Couples**

Matchrimoney is a comprehensive web platform that helps engaged couples save money on their wedding by connecting them with other couples getting married around the same time and location. Share vendor costs, split expenses, and make lifelong friendships while planning your dream wedding for less.

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

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Zod** for request validation
- **Nodemailer** for email services
- **Helmet** for security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- SMTP email service (Gmail recommended)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/matchrimoney"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   
   # Email Configuration (Gmail Example)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   EMAIL_FROM="Matchrimoney <noreply@matchrimoney.com>"
   
   # App Configuration
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   bunx prisma generate
   
   # Run database migrations
   bunx prisma db push
   
   # (Optional) Seed the database
   bunx prisma db seed
   ```

5. **Start the backend server**
   ```bash
   bun run dev
   # or npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with your wedding details
2. **Verify Email**: Check your inbox and click the verification link
3. **Complete Profile**: Add your bio and wedding preferences
4. **Browse Marketplace**: Discover compatible couples in your area
5. **Start Messaging**: Connect with couples that match your criteria

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

#### Messaging System
- Real-time messaging between matched couples
- Message read status and timestamps
- Conversation search and organization
- Mobile-responsive chat interface

## 🗂️ Project Structure

```
matchrimoney/
├── backend/
│   ├── src/
│   │   ├── middleware/          # Authentication & error handling
│   │   ├── routes/             # API route handlers
│   │   ├── utils/              # Helper functions
│   │   └── validators/         # Request validation schemas
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── index.ts               # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper functions
│   ├── public/               # Static assets
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/marketplace` - Get marketplace listings
- `DELETE /api/users/account` - Delete user account

### Matches
- `GET /api/matches` - Get user matches
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id/status` - Update match status

### Messages
- `GET /api/messages/:matchId` - Get conversation messages
- `POST /api/messages/:matchId` - Send message
- `PUT /api/messages/:matchId/read` - Mark messages as read

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation with Zod
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CORS Configuration**: Properly configured cross-origin requests
- **Rate Limiting**: Protection against abuse
- **Helmet Security**: Security headers and middleware

## 🎨 Design System

### Color Palette
- **Primary**: Elegant rose/pink tones (#e11d48, #f43f5e)
- **Accent**: Complementary coral (#f97316, #fb923c)
- **Neutral**: Professional grays (#374151, #6b7280, #9ca3af)

### Typography
- **Headings**: Serif font for elegance
- **Body**: Sans-serif for readability
- **Responsive**: Mobile-first design approach

### Components
- Consistent button styles
- Form input standardization
- Card-based layouts
- Loading states and animations

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, Railway, DigitalOcean)

### Frontend Deployment
1. Build the production bundle: `bun run build`
2. Deploy to static hosting (Vercel, Netlify, Cloudflare Pages)
3. Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@matchrimoney.com or create an issue in the GitHub repository.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core matching algorithm
- ✅ User authentication
- ✅ Messaging system
- ✅ Profile management
- ✅ Marketplace filtering

### Phase 2 (Planned)
- 📅 Calendar integration
- 💳 Payment processing
- 📊 Analytics dashboard
- 🔔 Push notifications
- 📱 Mobile app

### Phase 3 (Future)
- 🤖 AI-powered recommendations
- 🎥 Video calling
- 📍 Vendor directory
- 📈 Cost tracking
- 🌍 International expansion

---

**Made with ❤️ for couples planning their perfect wedding** 