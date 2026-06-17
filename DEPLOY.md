# Bringing EVOLVE online

Two ways the site goes public. The tunnel is **live now**; Vercel is the
permanent home and needs one Matt login.

---

## A. Interim public link (LIVE NOW — no login)

A Cloudflare quick tunnel exposes the running site at a public HTTPS URL:

> **https://yards-raises-feof-upload.trycloudflare.com**

- Works on any phone/browser, anywhere — share it.
- It stays up while **this PC is on** and the `cloudflared` + dev/prod server
  are running. It's an *interim* link (the URL changes if the tunnel restarts).
- To restart it later: `C:\tmp\tools\cloudflared.exe tunnel --url http://localhost:3000`
  (after starting the site with `npm run dev` or `npm run start`).

---

## B. Vercel — the proper, permanent deploy (one Matt step)

Next.js is Vercel's own framework, so this is the cleanest permanent host
(free hobby tier, auto HTTPS, global CDN, a real `*.vercel.app` URL you can
later point a custom domain at).

**Matt does this once, from the project folder:**

```powershell
cd C:\Users\lucid\Desktop\evolve-lifestyle
npx vercel login        # 1) pick GitHub/Email, confirm in browser  ← only step that needs Matt
npx vercel --prod --yes # 2) builds + deploys, prints the live https URL
```

Or just double-click **`DEPLOY-TO-VERCEL.bat`** in this folder — it runs both
commands; you only interact with the login prompt.

- `--yes` accepts the defaults and auto-creates a project named `evolve-lifestyle`.
- The build runs `next build` on Vercel; the real logo, Neue Montreal fonts, and
  local images all ship from `/public`, so nothing external is needed.
- Re-deploy any time with `npx vercel --prod` (or connect the GitHub repo on
  vercel.com for auto-deploy on every push).

### Custom domain (later)
In the Vercel dashboard → Project → Settings → Domains, add e.g.
`shop.evolveecoblasting.com` (or a new `evolveoutdoors.ca`) and follow the DNS
records it shows.

---

## Netlify (fallback)
```powershell
cd C:\Users\lucid\Desktop\evolve-lifestyle
npx netlify-cli login
npx netlify-cli deploy --build --prod
```
