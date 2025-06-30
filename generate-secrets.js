#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for your local development...\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');
const emailSecret = crypto.randomBytes(32).toString('hex');
const passwordSecret = crypto.randomBytes(32).toString('hex');

console.log('Add these to your backend/.env file:\n');
console.log('Required Variables:');
console.log('------------------');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`JWT_REFRESH_SECRET="${refreshSecret}"`);
console.log(`EMAIL_VERIFICATION_SECRET="${emailSecret}"`);
console.log(`PASSWORD_RESET_SECRET="${passwordSecret}"`);
console.log('\nDevelopment Configuration:');
console.log('-------------------------');
console.log('NODE_ENV="development"');
console.log('PORT=5000');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/matchrimoney"');
console.log('CLIENT_URL="http://localhost:5173"');
console.log('FRONTEND_URL="http://localhost:5173"');
console.log('\nFrontend Variables (add to frontend/.env):');
console.log('------------------------------------------');
console.log('VITE_API_URL="http://localhost:5000"');
console.log('VITE_GEOAPIFY_API_KEY="your-geoapify-api-key"');
console.log('\n✅ Save these secrets safely! Remember to update your DATABASE_URL with your actual PostgreSQL credentials.'); 