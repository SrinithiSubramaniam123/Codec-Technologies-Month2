Month-3
# Personal Portfolio with Blog & CMS (Topic 8)

React 18 + Vite + React Router. No backend or database: content is saved in the browser (`localStorage`), uploaded images/videos in IndexedDB.

## Features
- **Portfolio showcase** – hero, about, featured projects (with screenshot or demo video), projects page.
- **Blog** – posts with tags, search, tag filter, reading time, cover image, share links, draft/published status.
- **Contact form** – validation, honeypot spam trap, messages land in the admin inbox (plus a mailto fallback).
- **Admin CMS** (`/admin`) – create/edit/delete posts and projects, inbox, profile & site settings, change password.
- **Image/video uploads** – cover images, project media, avatar, and inline media inside blog posts (max 60 MB each).
- **SEO** – per-page title/description, Open Graph & Twitter tags, canonical URLs, JSON-LD (`Person`, `BlogPosting`), `robots.txt`, sitemap export (Admin → Settings), noindex for admin.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
Admin demo password: `admin123` (change it in Settings).

## Important limitations (read before deploying)
- Data is stored **per browser**: content you write on your laptop is not visible to visitors. To publish for the public you need to swap `src/store.jsx` and `src/media.js` for a real backend (e.g. Supabase, Firebase, Node + database + S3/Cloudinary).
- The admin login is client-side only and is **not real security**; it is a demo gate until a backend handles auth.
- Meta tags are set in the browser, so crawlers that do not run JavaScript will not see them. For production SEO use pre-rendering/SSR (e.g. Next.js) once content is on a server.
- Host must serve `index.html` for all routes (SPA fallback).



# Kiln & Co. — MERN E-Commerce Platform

Handmade-ceramics store with JWT auth, search + filters, cart drawer, Stripe checkout,
an admin dashboard and AI-powered product recommendations.

## Features
- **Auth**: register / login with JWT (first registered user becomes admin; seed also creates `admin@kiln.test` / `admin123`)
- **Catalogue**: full-text search, category, price range, in-stock filter, sorting, "show more" paging. Filters live in the URL so results are shareable
- **Cart & checkout**: persistent cart drawer, server-side price and stock validation, Stripe Checkout (demo mode when no key is set)
- **Admin** (`/admin`): revenue and low-stock overview, product add / edit / delete, quick stock +/-, order status updates
- **Recommendations** (`server/src/lib/recommend.js`): TF-IDF text vectors + cosine similarity, blended with "bought together" counts from paid orders. Product pages show similar pieces; the home page shows a personalised row built from the signed-in user's order history

## Run it
Requires Node 18+ and MongoDB (or `docker compose up -d` for a local one).

```bash
# 1. API
cd server
cp .env.example .env        # edit JWT_SECRET; add Stripe keys if you have them
npm install
npm run seed                # sample products + admin user
npm run dev                 # http://localhost:5000

# 2. Web app (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## Stripe
1. Put your test `STRIPE_SECRET_KEY` in `server/.env`. Pay with card `4242 4242 4242 4242`.
2. The success page verifies the session with Stripe, so it works locally without webhooks.
3. For production, add a webhook to `POST /api/orders/webhook` for `checkout.session.completed` and set `STRIPE_WEBHOOK_SECRET`.

## Structure
```
server/src  models/ routes/ middleware/ lib/recommend.js seed.js index.js
client/src  pages/ components/ context/ (Auth, Cart) styles.css
```
Product images are generated glaze art by default; paste an image URL in the admin form to override.
