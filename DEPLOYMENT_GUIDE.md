# 🚀 Deployment Checklist for Vercel

## ✅ Pre-Deployment Steps Completed

1. ✅ Database switched to PostgreSQL
2. ✅ Neon database connection configured
3. ✅ Code pushed to GitHub

---

## 🔧 Vercel Environment Variables Setup

Go to your **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these 3 required variables:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_vC2bIMQVOkD9@ep-old-rain-aiby5049-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**Note:** Use your actual Neon connection string (already in your local .env)

### 2. NEXTAUTH_SECRET
Generate a secure secret:
```bash
openssl rand -base64 32
```
Or use this one-time generated value:
```
VWxSUlZrMXNWbFJUVkZaamNIQjBjRmRzYkdkeWJIbzJkRzFaWm5KM1dYbDBOMkU=
```

### 3. NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
**Note:** Replace with your actual Vercel deployment URL

---

## 📝 After Adding Environment Variables

### Step 1: Redeploy
Vercel will automatically redeploy when you push to GitHub, or:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

### Step 2: Seed Production Database

**Option A: Via API Endpoint (Recommended)**
1. After deployment completes, visit:
   ```
   https://your-app-name.vercel.app/api/seed
   ```
2. You should see a success message with credentials

**Option B: From Local Machine**
```bash
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

---

## 🔑 Default Login Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | admin123 |
| Teacher | teacher1@school.edu | teacher123 |
| Student | student1@school.edu | student123 |

---

## ⚠️ Common Issues & Solutions

### Issue: "Can't login after deployment"
**Solution:** You need to seed the production database
- Visit: `https://your-app.vercel.app/api/seed`

### Issue: "Environment variable not found"
**Solution:** Check Vercel environment variables
- Make sure all 3 variables are added
- Redeploy after adding them

### Issue: "Database connection error"
**Solution:** Verify DATABASE_URL
- Copy the exact string from Neon dashboard
- Must include `?sslmode=require`

### Issue: "NextAuth error"
**Solution:** Check NEXTAUTH_URL and NEXTAUTH_SECRET
- NEXTAUTH_URL must match your deployment URL
- NEXTAUTH_SECRET must be set

---

## 🎯 Quick Verification Checklist

Before going live, verify:
- [ ] All 3 environment variables added in Vercel
- [ ] Latest code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Database seeded (visit /api/seed)
- [ ] Can login with admin@school.edu

---

## 📚 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **GitHub Repo:** https://github.com/kamrul135/Student-Management-System
