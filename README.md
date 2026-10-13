# WDIII Tech Vault — Consumer Tech Documentation

A real-world archive of hands-on consumer tech research: device repairs, customer service tests, battery degradation, ecosystem switching, security audits, and AI software comparisons. Current version: **v6.3.3**.

> New here, or starting a new chat? Read [HANDOFF.md](HANDOFF.md) first: architecture, workflow, content rules and current status.

## 📑 What's in the archive

The site is a single-page app (`index.html`). The Fodder Archive lives inside it at `#/fodder`. Fodder Archive entries are rendered from their `sections` in `src/data/official-experiments.js`, so each entry has a single source.

**Main experiments**
- **Done:** EXP 1–7, the Samsung battery case study, and EXP 9 (Apple Ecosystem Security Audit)
- **In progress:** EXP 8 (24-month cross-platform reliability and longevity study, day 0 completed 2026-09-27) and EXP 12 (iOS 27 performance and AI chatbot integration on iPhone 16e, standalone page at `/experiment-12`)
- **Paused:** EXP 10 (year-long iOS 26 vs iOS 27 survey)

**Fodder Archive**
- **FA-01:** Which AI builds our website best? (Round 1, then a blind Round 2 with five current models)
- **FA-02:** One month out of the Apple ecosystem
- **FA-03:** Two months, two laptops (MacBook Pro 16" M2 Pro vs Acer Aspire 14 AI)
- **FA-04 (queued):** Mac Studio vs MacBook Pro M2 Pro (32GB): local AI, C++ builds and Final Cut exports
- **FA-05:** Soundcore P40i "already shipped" cancellation dispute (resolved, full refund)

## ✨ Platform features

- **Documentation viewer:** theme switcher, search, section navigation, and Google Drive dossier export
- **Community Hub:** Firebase auth and per-experiment comments from registered accounts
- **Data tools:** a device comparison view and comparison engine and device stats
- **Security:** hardened Firestore and Storage rules, server-side blocking of source and config files, and a CodeQL workflow

## 🚀 Running locally

Requires Node.js v22 or later.

```bash
git clone https://github.com/PerfecHateyOu/WDIII-Tech-Vault.git
cd WDIII-Tech-Vault
npm install
npm start          # http://localhost:3000
```

### Tests

The test scripts hit the running server, so start it first:

```bash
npm start &        # in one terminal
npm test           # in another
```

## ☁️ Deploying (Firebase Hosting + Cloud Run)

Production runs `server.js` on **Cloud Run**, with **Firebase Hosting** in front:

- **Hosting** serves `public/` (CSS, JS, icons, `llms.txt`, sitemap) straight from the CDN.
- **Everything else** (`/`, `/api/*`, `/download/*`, `/src/*`, `/experiment-12`) is rewritten to the `wdiii-tech-vault` Cloud Run service, so every server route and access control still applies.

```bash
npm run deploy:run       # build & deploy server.js to Cloud Run (us-central1)
npm run deploy:hosting   # deploy Hosting config + public/
npm run deploy           # both, in order
```

Requires the `gcloud` and `firebase` CLIs, logged in to the project in `.firebaserc`. The Cloud Run service name and region must match the `run` rewrite in `firebase.json`.

### 📬 Contact form email (Resend)

`POST /api/submit` emails each contact message or newsletter signup to you through [Resend](https://resend.com) when these environment variables are set on the Cloud Run service. Without `RESEND_API_KEY` and `CONTACT_TO_EMAIL` nothing is emailed: the server answers `delivered: false` and the contact form opens the visitor's mail app instead, as before.

| Variable | Required | Default | What it is |
|---|---|---|---|
| `RESEND_API_KEY` | yes, to turn email on | none | Your Resend API key (`re_...`). Keep it secret; never commit it. |
| `CONTACT_TO_EMAIL` | yes, with the key | none | Where submissions are sent, as a plain address (`you@example.com`). **Set it to the email address your Resend account is signed up with.** Without it nothing is emailed (the form falls back to the visitor's mail app). There's no default, so no private address is kept in this public repo. |
| `CONTACT_FROM_EMAIL` | no | `WDIII Tech Vault <onboarding@resend.dev>` | The sender. Resend's test sender `onboarding@resend.dev` only delivers to the email address your Resend account is signed up with, so `CONTACT_TO_EMAIL` must be that same address until you verify your own domain in Resend and use a sender on it (e.g. `WDIII Tech Vault <contact@yourdomain.com>`). |
| `CONTACT_MAX_PER_HOUR` | no | `30` | The most emails the whole site sends per hour, across all visitors (on top of the 5-per-10-minutes limit per visitor). Past it, `/api/submit` answers `429` and sends nothing. |
| `ALLOWED_ORIGINS` | no | none | Extra origins (comma-separated, e.g. `https://www.example.com`) allowed to post to `/api/submit` from a browser. The site's own address is always allowed; other sites get `403`. |

Replies go straight to the visitor: the email's Reply-To is the address they typed. If Resend fails or times out (8 s), the server answers `502` and the contact form falls back to the visitor's mail app, so a message is never silently lost.

**Setting them on Cloud Run (Console):** Cloud Run → service `wdiii-tech-vault` (region `us-central1`) → **Edit & deploy new revision** → **Variables & Secrets** tab → **Add variable** for each name above → **Deploy**. For the key, the safer option is **Reference a secret** (stored in Secret Manager) instead of a plain variable; the server reads it the same way.

**From the CLI** (use `--update-env-vars`, which adds or changes only the names you give; `--set-env-vars` replaces *every* variable on the service and would wipe the others):

```bash
gcloud run services update wdiii-tech-vault --region us-central1 \
  --update-env-vars RESEND_API_KEY=re_xxx,CONTACT_TO_EMAIL=your-resend-login@example.com
```

Variables set this way survive later `npm run deploy:run` deploys: `gcloud run deploy --source .` keeps the service's existing variables because it passes no env flags.

## 📁 Structure

| Path | Purpose |
|---|---|
| `index.html` | SPA entry point: main docs and the Fodder Archive |
| `server.js` | Express server: static serving, Firebase public config, Drive export, access controls |
| `public/` | **All** static assets (CSS, JS, icons, manifest, `llms.txt`, `robots.txt`, sitemap, `experiment-12.html`) |
| `src/` | Frontend modules: `components/`, `data/`, `services/`, `ui/`, `utils/`, `types/` |
| `scripts/` | Security and integration test suites |
| `docs/architecture.md` | Module and request-flow diagram (Mermaid), traced from the imports |
| `firestore.rules`, `storage.rules`, `firestore.indexes.json` | Firebase security and index config |
| `archive/legacy-html/` | Superseded standalone HTML builds and FA-01 raw submissions. Kept for reference, never served |

> Put new static assets in `public/` only. The server does not serve root-level asset files.

## 📄 License

MIT. See `LICENSE`.
