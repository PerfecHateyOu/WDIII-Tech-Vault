# WDIII Tech Vault — Consumer Tech Documentation

A real-world archive of hands-on consumer tech research: device repairs, customer service tests, battery degradation, ecosystem switching, security audits, and AI software comparisons. Current version: **V5.9**.

## 📑 What's in the archive

The site is a single-page app (`index.html`). The Fodder Archive lives inside it at `#/fodder`. Fodder Archive entries are rendered from their `sections` in `src/data/official-experiments.js`, so each entry has a single source.

**Main experiments**
- **Done:** EXP 1–7, the Samsung battery case study, and EXP 9 (Apple Ecosystem Security Audit)
- **In progress:** EXP 12, iOS 27 performance and AI chatbot integration on iPhone 16e (standalone page at `/experiment-12`)
- **Queued:** EXP 8 (cross-platform reliability and longevity) and EXP 10 (year-long iOS 26 vs iOS 27 survey)

**Fodder Archive**
- **FA-01:** Which AI builds our website best? (blind evaluation of 5 LLMs)
- **FA-02:** One month out of the Apple ecosystem
- **FA-03:** Two months, two laptops (MacBook Pro 16" M2 Pro vs Acer Aspire 14 AI)

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

## 📁 Structure

| Path | Purpose |
|---|---|
| `index.html` | SPA entry point: main docs and the Fodder Archive |
| `server.js` | Express server: static serving, Firebase public config, Drive export, access controls |
| `public/` | **All** static assets (CSS, JS, icons, manifest, `llms.txt`, `robots.txt`, sitemap, `experiment-12.html`) |
| `src/` | Frontend modules: `components/`, `data/`, `services/`, `ui/`, `utils/`, `types/` |
| `scripts/` | Security and integration test suites |
| `firestore.rules`, `storage.rules`, `firestore.indexes.json` | Firebase security and index config |
| `archive/legacy-html/` | Superseded standalone HTML builds and FA-01 raw submissions. Kept for reference, never served |

> Put new static assets in `public/` only. The server does not serve root-level asset files.

## 📄 License

MIT. See `LICENSE`.
