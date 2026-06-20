# Savannah Next.js App

Production: https://savannahbarandgrill.com

## Stack
- Next.js 16 (App Router)
- Supabase Auth + Postgres
- Tailwind CSS
- Deployed on Vercel

## Local development

```
npm install
npm run dev
```

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Auth
Unauthenticated users are redirected to /login. Public routes are allowlisted.

## Images
Landing page uses images from /images, inspired by vaha-ref.png and prioritizing -w (landscape) images.
