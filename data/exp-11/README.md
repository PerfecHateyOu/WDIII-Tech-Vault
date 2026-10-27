# Experiment 11: data log

How well the Lenovo Googlebook 15 integrates with a Google Pixel. The Lenovo Googlebook 15 is the only laptop in this study.

This folder is the raw record. The site entry in `src/data/official-experiments.js` summarises it; it never replaces it. `npm test` validates every file here (`scripts/test-exp11-data.js`). Rows come from the Experiment 11 session sheet ("Copy all rows").

## Setup

- Googlebook model / config: Lenovo Googlebook 15, magnesium alloy build, soft-touch finish, 2.8K OLED display.
- Googlebook OS version: Google Book OS (build number TBD).
- Android version: Android 17 (noted as the operating system required for cross-device functionality).
- Pixel model: Pixel 10 Pro (Android 17).

## Files

- **`trials.csv`:** weekly integration trials (phone unlock, hotspot connect, notification delay, message send, Quick Share, photo access, call audio switch), 3 timed trials each.
- **`reliability.csv`:** weekly disconnects, sync errors and failed features.
- **`monthly.csv`:** optional battery reading per device (`googlebook` or `pixel`).
- **`updates.csv`:** one row per OS update on either device.
- **`incidents.csv`:** one row per problem. `device` is `googlebook`, `pixel` or `both`.

## Session notes

AI integrations like the "wiggle to activate" Gemini shortcut and on-device file descriptions are neat but not competitive "killer apps." At a price point of $900 to $1,300, the platform feels like a first-generation product that is currently only suitable for dedicated early adopters, struggling to compete with established options like macOS.

## TBD (not yet provided)

- Session date (the `date` / `datetime` columns of the first session are blank).
- Googlebook OS build number.
- Disconnect and sync error counts.
- Incident resolutions and minutes lost.
- All timed trials (`trials.csv` has no rows yet).
- Battery readings (`monthly.csv` has no rows yet).
- OS updates (`updates.csv` has no rows yet).

## Status

- Status: in progress
- First session (setup, reliability, incidents, notes) logged; no timed trials yet.
