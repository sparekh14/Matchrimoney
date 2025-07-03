# Matchrimony - Wedding Cost-Sharing Platform

A platform that helps couples find other couples with similar wedding plans to share vendor costs and save money.

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database running locally
- Bun (optional, for faster backend development)

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Set Up Local Database**
   - Make sure PostgreSQL is running on your machine
   - Create a database named `matchrimoney`
   - Update the `DATABASE_URL` in `backend/.env` with your PostgreSQL credentials

3. **Generate Environment Variables**
   ```bash
   npm run generate-secrets
   ```
   Copy the generated secrets to your `backend/.env` file.

4. **Set Up Database Schema**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```
   This runs both frontend (http://localhost:5173) and backend (http://localhost:5000) concurrently.

### Database Management

- **View/Edit Data**: `npm run db:studio` - Opens Prisma Studio at http://localhost:5555
- **Apply Migrations**: `npm run db:migrate`
- **Generate Prisma Client**: `npm run db:generate`

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend for production
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run generate-secrets` - Generate secure secrets for environment variables

### Project Structure

```
matchrimony/
├── frontend/          # React + Vite frontend
├── backend/           # Express + Prisma backend
│   └── prisma/       # Database schema and migrations
├── shared/           # Shared utilities and types
└── package.json      # Root workspace configuration
```

### Environment Variables

See `.env.example` for required environment variables. The main ones are:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `CLIENT_URL` - Frontend URL (http://localhost:5173 for development)

### Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens

### Features

- User registration and authentication
- Email verification
- Wedding planning questionnaire
- Couple matching based on wedding preferences
- Real-time messaging between matched couples
- File upload for profile pictures (AWS S3)

## Development Notes

- The backend can be run with either Node.js or Bun
- Database changes should be made through Prisma migrations
- All API endpoints are under `/api` when running locally
- Frontend development server includes hot reloading
- Backend development server includes automatic restarts on file changes

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email matchrimonyhelp@gmail.com or create an issue in the GitHub repository.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core matching algorithm
- ✅ Profile management
- ✅ Couple marketplace

### Phase 2 (Planned)
- 💬 Messaging system
- 🏪 Vendor marketplace
- 📅 Calendar integration
- 📱 Mobile app

### Phase 3 (Future)
- 🤖 AI-powered recommendations
- 🎥 Video calling
- 📈 Cost tracking
- 🌍 International expansion

---

**Made with ❤️ for couples planning their perfect wedding** 
