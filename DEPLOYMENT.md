# Deployment Guide: VEYRA Studio & Generated Websites

## 1. Deploying the VEYRA Studio Platform
VEYRA Studio is optimized for Node.js server runtimes (Docker, VPS, Railway, Render, or Vercel).

### Standard Production Build
```bash
# 1. Install production dependencies
npm ci

# 2. Build Next.js application
npm run build

# 3. Start Next.js production server
npm run start
```

### Critical Production Environment Verification
- `NODE_ENV=production`
- `TEST=NO` (Ensures test simulation cannot be executed in production)
- Verify `OLLAMA_BASE_URL` is reachable from the production host.
- Ensure Supabase credentials and Razorpay production keys are populated.

## 2. Publishing Generated Websites (Cloudflare Pages)
VEYRA Studio features a direct deployment adapter to publish generated websites to Cloudflare Pages.
- Configure in `.env.local`:
  ```env
  CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
  CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxx
  ```
- When credentials are present:
  - VEYRA deploys the static website bundle directly to Cloudflare Pages edge network.
  - Generates live production URL: `https://<project-slug>.pages.dev`.
- When credentials are not present:
  - 1-click ZIP export is always available to download and host on any provider (Vercel, Netlify, GitHub Pages, Apache, Nginx).
