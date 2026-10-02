# Handoff: WDIII Tech Vault

*Reviewed 2026-10-01 (v6.2). Read this first if you are a new Claude chat, a new agent session, or a new contributor. It is a summary: the code, the tests and the commit messages hold the detail, and where this file and the code disagree, the code wins.*

## What this is

A personal archive of the owner's (Bill's) hands-on consumer tech experiments: repair channels, customer support, batteries, ecosystems, security audits, AI comparisons. Live at https://project-95f7ca57-6daa-40f6-90b.web.app (no custom domain yet).

It is **personal-only**: no submissions, uploads or moderation. Visitors can read; comments are allowed for verified, non-anonymous accounts.

## Commands

```bash
npm ci
npm start &            # http://localhost:3000
npm test               # all suites (19 scripts); the server must be running
npm run test:rules     # Firestore rules; needs the Firebase CLI and Java (emulator)
npm run deploy         # Cloud Run first, then Hosting
node scripts/check-rate-limit.mjs https://<hosting-url>    # after a deploy: confirms fake X-Forwarded-For values cannot dodge the rate limit
firebase deploy --only firestore:rules,storage    # rules deploy separately
```

Node 22 or later. **Bump versions with `npm version X.Y.Z --no-git-tag-version`**: version bumps have broken `package-lock.json` three times (deleted twice, then stripped of its integrity hashes), and the Docker build runs `npm ci`. `scripts/test-release-files.js` catches it.

## How changes flow

1. Claude (in chat) prepares a git patch built on the current `main`.
2. The owner applies it on a branch (`git am`), usually in Claude Code.
3. The `pr-reviewer` agent reviews the branch and runs the tests.
4. The owner merges the PR and deploys. Merging does not deploy.

Agents never push, merge or deploy without the owner saying so in that conversation. When told "merged" or "patched", check `origin/main` rather than assuming.

## Architecture

| Piece | Where | Notes |
|---|---|---|
| Single-page app | `index.html` | Hash routes (`#/`, `#/devices`, `#/compare`, `#/fodder`, `#/experiments/<id>`) |
| Server | `server.js` (Express) | Read-only JSON APIs, serves only allowlisted paths; source, config, rules, scripts, tests and data are refused |
| Data | `src/data/official-experiments.js`, `official-devices.js` | Experiments and the device registry |
| UI and services | `src/ui`, `src/services`, `src/components`, `src/utils` | Detail view, comparison, comments, Firebase client |
| Static files | `public/` | CSS, JS, icons, `llms.txt`, sitemap, `experiment-12.html`, `fa01/` |
| Hosting | `firebase.json` | Hosting serves `public/` from the CDN and rewrites everything else to the Cloud Run service `wdiii-tech-vault` |
| Image | `Dockerfile`, `.dockerignore` | `node:22-slim`, `npm ci --omit=dev`; tests, scripts, archive, data and docs stay out |
| Rules | `firestore.rules`, `storage.rules` | Default deny. Comments need a verified, non-anonymous account. Storage has no client writes. The Firestore database is a named one (see `firebase.json`), not `(default)` |
| Tests | `scripts/test-*.js` | Static checks plus server checks |
| Agents | `.claude/agents/` | `pr-reviewer`, `experiment-drafter`, `repo-tracker` (written in chat). `.github/agents/` holds two others added separately |

If you change `public/` or `firebase.json`, deploy both parts.

## Where content lives

- **Main experiments** (1–7, CS-01, 8, 9, 10, 12): the visible pages are hand-written builders in `index.html` (`buildExp1()` and so on), and each has a summary entry in the data file. **Nothing keeps the two in step**; that is how invented data sat in the data file unnoticed. Change both, and re-read them side by side.
- **Fodder Archive** (FA-01 to FA-03): rendered entirely from each entry's `sections` in the data file. One source. Block types are listed in `renderSections()` in `index.html` and `.claude/agents/experiment-drafter.md`; `scripts/test-fodder-single-source.js` checks the structure.
- **Full-page view** (`#/experiments/<id>`): summary from the data, body copied from the page article when there is one.
- **Experiment logs**: `data/exp-08/` and `data/exp-10/` (CSV plus a README with the protocol). Validated by `npm test`. The site entry summarises the log and never replaces it.
- **Device registry**: `scripts/test-registry-integrity.js` checks that every device an experiment lists exists and that links point both ways.

## Content rules

In September 2026 the owner found AI-written filler on the site (invented benchmarks, infrastructure and results) and had every entry checked with him, claim by claim.

- Do not publish a fact the owner has not confirmed. Unknown means `TBD` or `null`; do not look up specs or fill in plausible numbers.
- Keep "planned", "owned" and "measured" separate. Results stay `null` until there is data.
- AI comparisons run cold: a fresh chat with memory off, the identical prompt, no follow-ups, outputs saved unedited. Score blind (files shuffled to letters, key sealed until every assessment is recorded), and the Claude assessment also runs blind in a separate fresh chat.

## Status (2026-09-29)

| Entry | Status | Notes |
|---|---|---|
| Experiments 1–7, CS-01 | Done | Confirmed with the owner |
| Experiment 8 | In progress | 24-month study, 12 owned devices; protocol in `data/exp-08/README.md`; day 0 completed 2026-09-27; weekly sessions continue |
| Experiment 9 | Done | Owner's checklist answers applied 2026-09-30 (PR #57); devices are iPhone 16e (iOS 27.0 beta), iPhone 13 (iOS 26.5) and a MacBook Air host (macOS Tahoe 26.x); the MacBook Air model is still TBD, so no registry entry for it |
| Experiment 10 | Paused | iOS 26 phase collected; iOS 27 phase not started |
| Experiment 12 | In progress | iOS 27.0 on an iPhone 16e; no results yet; the AI-chatbots-via-Siri part waits for third-party Siri support; headline features TBD |
| FA-01 | Done | Round 1 (older models, records incomplete) and Round 2 (2026-09-28, blind) |
| FA-02, FA-03 | Done | Personal impressions, no benchmarks |

## FA-01 submissions

Raw HTML exactly as each model returned it: `public/fa01/round-<n>/<model>.html`.

- Never edit them. `.gitattributes` marks them `binary`, and `public/fa01/checksums.md` records each SHA-256; `scripts/test-fa01-submissions.js` fails if a file changes or is unrecorded.
- They are served with a sandbox Content-Security-Policy (no same-origin), `noindex`, `nosniff` and `no-referrer`, by both `server.js` and `firebase.json`. Only `/fa01/round-<n>/<lowercase-name>.html` is served.
- To add one: copy the exact bytes, add its checksum line, and set `link` on its ranking block.

## Known gotchas

- **Light theme.** `index.html` hard-codes white text (`color:#fff`) in about 100 places. Since v6.1.1 a site-wide rule in `public/css/style.css` switches it to the theme's text colour in light mode, except on elements filled with `background:var(--td-info)`, which must be written exactly that way (no space, not `background-color`) or their white text is darkened. The owner viewed light mode after the fix and it looks fine. The faint `rgba(255,255,255,…)` dividers and row tints are still white in light mode (cosmetic).
- **Asset version.** When `public/` CSS or JS changes, bump the version so the `?v=` links and the import map in `index.html` move with `package.json` (`scripts/test-cache-headers.js` requires them to match). The displayed "v6.1" label is separate and was left alone.
- **Rendered pages cannot be viewed from a chat sandbox.** Check structure and tests, say so plainly, and use previews.
- **Client IP and rate limits.** Behind Hosting and Cloud Run, only the rightmost entries of `X-Forwarded-For` can be trusted. `server.js` trusts `TRUST_PROXY_HOPS` hops (default 2: Hosting plus Cloud Run's front end); with `trust proxy: true`, a rotating header dodged every limit. After changing anything near it, deploy and run `scripts/check-rate-limit.mjs` against the Hosting URL. If it says FAIL, set the real hop count: `gcloud run services update wdiii-tech-vault --region us-central1 --set-env-vars TRUST_PROXY_HOPS=<n>`. The direct `run.app` address has one hop fewer, so it can still be spoofed. `scripts/test-rate-limit-client-ip.js` covers the local behaviour.
- **No archives in git.** Zip files are git-ignored and docker-ignored: the committed v6.1.1 zips stayed in history and made every clone about 11 MB heavier.
- **Dev-tool advisories.** `package.json` overrides `@grpc/grpc-js` (pulled in by the Firestore test tooling, which pins a vulnerable 1.9.x) to `~1.13.6`. Production dependencies are separate and audited with `npm audit --omit=dev`; run `npm run test:rules` after touching the override.
- **Line endings.** `* text=auto` normalises line endings for everything except the `binary` submissions.
- **Project uploads.** HTML files uploaded to the Claude project (V0.1 to V6) are old versions. The repo is the source of truth.
- **`archive/`.** Legacy HTML kept for reference; never served.
- **Experiment 12** also has a standalone page at `public/experiment-12.html`, separate from the entry in the data file.

## Working with the owner

Concise and direct; scannable markdown; tables for data. He pastes output from Claude Code and confirms facts when asked. Ask one clear question rather than assuming, and say what could not be verified.
