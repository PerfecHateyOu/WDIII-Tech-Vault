# WDIII Tech Vault — Consumer Tech Documentation

A real-world archive of hands-on consumer tech research: device repairs, customer service tests, battery degradation, ecosystem switching, security audits, and AI software comparisons. Current version: **V5.7.4**.

## 📑 What's in the archive

The site is a single-page app (`index.html`). The Fodder Archive lives inside it at `#/fodder`.

**Main experiments**
- **Done:** EXP 1–7, the Samsung battery case study, and EXP 9 (Apple Ecosystem Security Audit)
- **In progress:** EXP 12, iOS 27 performance and AI chatbot integration on iPhone 16e (standalone page at `/experiment-12`)
- **Queued:** EXP 8 (cross-platform reliability and longevity) and EXP 10 (year-long iOS 26 vs iOS 27 survey)

**Fodder Archive**
- **FA-01:** Which AI builds our website best? (blind evaluation of 5 LLMs)
- **FA-02:** One month out of the Apple ecosystem
- **FA-03:** Seven years of laptop evolution (2017 MacBook Air vs 2024 M3 MacBook Air vs Acer Aspire 14)

## ✨ Platform features

- **Documentation viewer:** theme switcher, search, section navigation, and Google Drive dossier export
- **Community Hub:** Firebase auth, community experiment submissions with evidence uploads, a moderation dashboard, and per-experiment comments
- **Data tools:** a device comparison view and comparison engine, device stats, and a replication UI for reproducing experiments
- **Security:** hardened Firestore and Storage rules, server-side blocking of source and config files, and a CodeQL workflow

## 🚀 Running locally

Requires Node.js v18 or later.

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
