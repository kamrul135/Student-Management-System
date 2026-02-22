# Database Setup Guide

## Quick Setup with Neon (Free PostgreSQL)

### Step 1: Create Free Neon Account
1. Visit [https://neon.tech](https://neon.tech)
2. Sign up with GitHub (fastest) or email
3. Click "Create Project"

### Step 2: Get Connection String
1. After project creation, you'll see your connection string
2. Copy the **Pooled connection** string (recommended for serverless)
3. It looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Update Local Environment
1. Open `.env` in your project root
2. Replace `DATABASE_URL` with your Neon connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Step 4: Initialize Database
Run these commands in order:
```bash
npm run db:push      # Creates tables
npm run db:seed      # Adds test data
```

### Step 5: Verify
Start your dev server:
```bash
npm run dev
```

Login with:
- Email: `admin@school.edu`
- Password: `admin123`

## For Vercel Deployment

### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these variables:

| Name | Value | Example |
|------|-------|---------|
| `DATABASE_URL` | Your Neon connection string | `postgresql://user:pass@...` |
| `NEXTAUTH_SECRET` | Random 32+ char string | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |

3. Redeploy your app
4. After deployment, seed the production database:
   ```bash
   # Run this locally with production DATABASE_URL
   DATABASE_URL="your-production-neon-url" npm run db:seed
   ```

## Alternative: Supabase PostgreSQL

If you prefer Supabase:
1. Create account at [https://supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI mode)
5. Use it as your `DATABASE_URL`

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in project root
- Restart your dev server after changing `.env`

### "Can't reach database server"
- Check if connection string is correct
- Ensure your IP is whitelisted (Neon allows all by default)
- Verify SSL mode is included: `?sslmode=require`

### "Seed fails on Vercel"
- Seed must be run separately after deployment
- Use your local machine with production DATABASE_URL
- Or use a Vercel function/API endpoint to trigger seeding (one-time use)
