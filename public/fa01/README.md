# FA-01 raw submissions

Raw HTML exactly as each AI model returned it for FA-01, one folder per round:

    public/fa01/round-1/<model>.html
    public/fa01/round-2/<model>.html

- File names: lowercase letters, digits and hyphens only (e.g. `chatgpt.html`, `deepseek.html`).
  Anything else is not served.
- Never edit a submission. Store it exactly as the model returned it.
- Served with a sandbox Content-Security-Policy (no same-origin), `noindex`, `nosniff` and
  `no-referrer`, by both server.js and firebase.json.
- Link each one from its ranking in the FA-01 entry (`link` on a `ranking` block in
  src/data/official-experiments.js). `npm test` checks that every link points to a file here.
