# IT Asset Management Tool

A full-stack IT asset management tool built with Next.js, Neon PostgreSQL, Supabase Storage, and deployed on Vercel.

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router)
- **Database**: Neon (PostgreSQL) + Prisma ORM
- **File Storage**: Supabase Storage
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (free tier)

## Features
- 🔐 User authentication (login/logout)
- 📊 Dashboard with asset stats and charts
- 📋 Full asset CRUD (create, view, edit, delete)
- 📎 Image upload for assets
- 🏷️ IT asset types: Laptop, Phone, Tablet, Monitor, etc.
- 📍 Track location, assignment, warranty, purchase info

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

Required variables:
- `DATABASE_URL` — from Neon dashboard
- `NEXTAUTH_SECRET` — generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` for local, your Vercel URL for production
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings

### 3. Set up database
```bash
npm run db:push
```

### 4. Create admin user
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Default login:
- Email: `admin@company.com`
- Password: `admin123`

> ⚠️ Change the password after first login!

### 5. Run locally
```bash
npm run dev
```

Open http://localhost:3000

## Deploying to Vercel

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXTAUTH_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`)
5. Deploy!

After deploy, run the seed script once with your production DATABASE_URL to create the admin user.
# assetly
