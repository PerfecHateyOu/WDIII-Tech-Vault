# Architecture

Traced from the actual `import` statements, `index.html`, the `server.js` routes, `firebase.json` and the `Dockerfile` (v6.3.2, 2026-10-12). Every arrow maps to a line of code. Dashed arrows are optional at runtime.

When you add, remove or rewire a module, update this diagram in the same PR.

```mermaid
flowchart TB
  reader([Reader])
  ext([External tools / LLM summarizers])

  subgraph deploy["Deployment"]
    fh["Firebase Hosting<br/>firebase.json"]
    cr["Cloud Run<br/>Dockerfile · node:22"]
  end

  srv["Express server<br/>server.js"]

  subgraph shell["Site shell · public/js"]
    idx["index.html<br/>inline module + importmap"]
    main["main.js"]
    mgrs["theme · navigation · modals<br/>forms · utils"]
    cfg["config.js"]
  end

  subgraph views["Views · src/ui"]
    dv["devices-view.js"]
    edv["experiment-detail-view.js"]
    cv["compare-view.js"]
  end

  subgraph community["Community · src/components"]
    ah["auth-header.js"]
    cs["comments-section.js"]
  end

  subgraph services["Services · src/services"]
    db["database.js<br/>repository + cache"]
    cmp["comparison-service.js"]
    cst["comparison-stats.js"]
    csvc["comments-service.js"]
    fb["firebase.js"]
  end

  subgraph seed["Static seed · src/data"]
    od["official-devices.js"]
    oe["official-experiments.js"]
  end

  subgraph shared["Shared utils · src/utils"]
    san["sanitize.js"]
    lb["loading-bar.js"]
  end

  subgraph firebase["Firebase"]
    auth[("Auth")]
    fs[("Firestore")]
  end

  subgraph unused["Not imported by the app · tests only"]
    ds["device-stats.js"]
    aa["auth-audit.js"]
    sch["community-hub-schema.ts"]
  end

  reader -->|opens site| fh
  fh -->|"serves public/ from CDN"| main
  fh -->|"rewrites everything else"| cr
  cr -->|runs| srv
  srv -->|"serves index.html and /src"| idx

  idx -->|imports| main
  main -->|initializes| mgrs
  mgrs -->|import| cfg
  idx -->|routes to| dv
  idx -->|routes to| edv
  idx -->|routes to| cv
  idx -->|initAuthHeader| ah
  idx -->|initFirebase| fb

  dv -->|getDevices| db
  edv -->|getExperimentById| db
  edv -->|mounts| cs
  cv -->|reads devices| db
  cv -->|requests comparison| cmp
  cmp -->|reads records| db
  cmp -->|calculates| cst

  cs -->|posts / edits / likes| csvc
  cs -->|sign-in state| fb
  ah -->|sign in / out| fb
  csvc -->|"comments"| fs

  db -->|seeds cache instantly| od
  db -->|seeds cache instantly| oe
  db -.->|"lazy import, only if ready"| fb
  db -.->|"background sync: devices, experiments, submissions"| fs

  fb -->|"GET /api/firebase-config"| srv
  fb -->|authenticates| auth
  fb -->|"users"| fs

  srv -->|reads| od
  srv -->|reads| oe
  ext -->|"/api/summary · /api/experiments · /api/devices"| srv
```

## Notes

- **`database.js` works without Firebase.** It fills its cache from `src/data/official-*.js` on load. It then imports Firebase lazily and syncs `devices`, `experiments` and `submissions` in the background, but only if Firebase is ready.
- **The browser makes one call to the server: `/api/firebase-config`.** The `/api/summary`, `/api/experiments` and `/api/devices` routes are read-only APIs for external tools.
- **`index.html` is the bootstrap.** Its inline module loads the views, the auth header and Firebase. `main.js` only sets up the shell managers.
- **`sanitize.js` and `loading-bar.js` are client utilities.** They are imported by the views, the comments, `database.js` and the auth header. Their edges are left out of the diagram to keep it readable.
- **Not imported by the app:** `src/services/device-stats.js`, `src/services/auth-audit.js` and `src/types/community-hub-schema.ts`. Only the test scripts reference them.
- **`/api/submit` stores nothing.** It validates the input and, when `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are set, emails the submission through Resend (`200`, `delivered: true`; `502` if Resend fails). Without them it returns `202` with `delivered: false`, and the contact form opens a mailto: draft instead. See the README's "Contact form email" section.
