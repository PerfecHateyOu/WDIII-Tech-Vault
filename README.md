# Consumer Tech Documentation

A comprehensive, real-world archive of hands-on consumer tech research across device repairs, customer service response tests, battery degradation curves, ecosystem switching frictions, and AI software development.

## 📑 Archive Overview

- **Main Documentation (`index.html`)**: Interactive single-page application compiling core repair benchmarks, customer service tests, battery analytics, and queued hardware experiments.
- **Fodder Archive (`fodder-archive.html`)**: In-depth exploratory logs and standalone comparative studies:
  - **FA-01**: Which AI Builds Our Website Best? (Cold prompt blind evaluation of 5 LLMs)
  - **FA-02**: One Month Out of the Apple Ecosystem (Friction log moving from Apple to Pixel + Windows)
  - **FA-03**: Seven Years of Laptop Evolution (2017 MacBook Air vs. 2024 M3 MacBook Air vs. 2024 Acer Aspire 14)

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Startup
```bash
# Clone the repository
git clone <your-repo-url>
cd consumer-tech-documentation

# Install dependencies
npm install

# Start the server
npm start
```

Open `http://localhost:3000` in your web browser.

## 📁 Key Files & Structure

- `index.html` — Primary web application featuring responsive documentation viewer, theme switcher, search, and Google Drive export.
- `fodder-archive.html` — Full-length deep-dive archive logs and hardware teardown analyses.
- `server.js` — Express backend handling Firebase configuration, Google Drive dossier exports, and static serving.
- `package.json` — Project manifest and scripts.
- `metadata.json` — AI Studio applet configuration and capabilities.

## 📄 License

MIT License. See `LICENSE` for details.
