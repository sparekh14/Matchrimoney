#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for your deployment...\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');
const emailSecret = crypto.randomBytes(32).toString('hex');
const passwordSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these to your Netlify environment variables:\n');
console.log('Required Variables:');
console.log('------------------');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log(`NODE_ENV=production`);
console.log('DATABASE_URL=your-neon-connection-string-here');
console.log('CLIENT_URL=https://your-site-name.netlify.app');
console.log('\nOptional Variables:');
console.log('-------------------');
console.log(`EMAIL_VERIFICATION_SECRET=${emailSecret}`);
console.log(`PASSWORD_RESET_SECRET=${passwordSecret}`);
console.log('\nFrontend Variables:');
console.log('-------------------');
console.log('VITE_API_URL=/api');
console.log('VITE_GEOAPIFY_API_KEY=40a230ecfd9e4d15ad2b61afe78752da');
console.log('\n✅ Save these secrets safely! You\'ll need them for deployment.'); 