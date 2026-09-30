# Design system rebuild

One command rebuilds the files of the "WDIII Tech Vault" design system from this repo:

```sh
npm run design-system            # writes design-system/out/ (git-ignored)
npm run design-system -- --check # CI: exit 1 if public/css/style.css drifted from tokens.base.json
```

No dependencies; Node 22+, run from anywhere inside the repo.

## What it does

| Step | Source | Result |
|---|---|---|
| Colours | `:root` (dark) and `.light-theme` (light) in `public/css/style.css` | one flat `color.tokens` list, dark first, light second; `var(--x)` becomes `{x}` |
| Type, spacing, radius, shadow, usage notes, legacy tokens | `design-system/tokens.base.json` | same shapes as the published tokens.json |
| Assets | `public/logo.svg`, `logo.jpg`, `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` | `out/assets/Logos/`, `out/assets/Icons/` |
| Provenance | git | `meta.repo`, `meta.ref` (`branch@sha`), `meta.synced` (date) |

CSS wins when both files define a colour. A variable that is new in the CSS is added with an empty
`usage`; fill it in in `tokens.base.json`. `--write-base` accepts the rebuilt tokens as the new base.

## Publishing is a separate step

Uploading to the design system needs the Artifact tool, which a Node script cannot call. After the
build, in Claude Code, ask it to publish `design-system/out/` to the design system artifact
(`tokens.json` to `project/tokens.json`, `assets/*` to `project/assets/*`). CI that only runs
the build and `--check` needs nothing else.
