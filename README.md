# rikat-chat

اسکلت یک اپ چت روم با:
- React + Vite
- Supabase (Realtime + Postgres)
- WebRTC signaling ساده (mesh) از طریق کانال‌های Supabase

مراحل سریع:
1. `cp .env.example .env.local` و مقادیر Supabase را جایگزین کن.
2. `npm install`
3. `npm run dev`
4. برای production: Push to GitHub و Deploy on Vercel، اضافه‌کردن متغیرهای محیطی در Vercel (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY).

فایل setup.sql را در SQL editor Supabase اجرا کن.
