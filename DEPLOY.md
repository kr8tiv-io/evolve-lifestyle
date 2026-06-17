# Bringing EVOLVE online

## Status
- **GitHub:** https://github.com/kr8tiv-ai/evolve-lifestyle (private, pushed)
- **Live now (interim):** https://yards-raises-feof-upload.trycloudflare.com
  — production build via a Cloudflare tunnel off this PC. Stays up while the PC
  + the `:3000` server run; the URL changes if the tunnel restarts.

---

## Permanent host — Vercel (recommended, free, auto-deploy from GitHub)

Next.js is Vercel's own framework: zero-config, global CDN, auto HTTPS, and a
deploy on every `git push`. **One owner step (only Todd can do the login):**

1. Go to **vercel.com** → sign in **with GitHub** (the `kr8tiv-ai` account/org).
2. **Add New… → Project → Import** `kr8tiv-ai/evolve-lifestyle`.
3. Framework auto-detects **Next.js** → **Deploy**. Done — every push to `main`
   now auto-deploys, and you get a permanent `*.vercel.app` URL.

(Private repo: during sign-in, grant Vercel access to the `kr8tiv-ai` org so it
can read the repo.)

CLI alternative (same login requirement): from this folder run `npx vercel login`
then `npx vercel --prod`, or double-click `DEPLOY-TO-VERCEL.bat`.

### Custom domain (later)
Vercel → Project → Settings → Domains → add e.g. `shop.evolveecoblasting.com` or
a new `evolveoutdoors.ca`, then set the DNS records it shows.

---

## Hostinger — do we need it? (flagged per request)
**No — Vercel free tier is the cleaner path for this app, and it's free.** Reasons:
- This is a Next.js app (App Router, SSG + a few client/runtime bits). Vercel runs
  it natively with **zero config**; Hostinger would need a Node runtime + a
  reverse proxy (or a constrained static export) and manual redeploys.
- Auto-deploy-on-push is built in on Vercel; on Hostinger it's extra plumbing.

**When Hostinger *would* make sense:** if Todd wants everything under the existing
Hostinger account/billing, or to host it on the **same domain** already managed
there. In that case it can be deployed via Hostinger's JS-app hosting — say the
word and I'll wire that path instead. Otherwise: **Vercel.**

---

## Netlify (fallback)
`npx netlify-cli login` then `npx netlify-cli deploy --build --prod`.
