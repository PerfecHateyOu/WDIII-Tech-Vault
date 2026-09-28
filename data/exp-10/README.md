# Experiment 10: data log

iOS 26 vs iOS 27, year-long survey on one iPhone 16e. A before/after comparison on the same phone: phase A on iOS 26, phase B on iOS 27.

This folder is the raw record. The site entry in `src/data/official-experiments.js` summarises it; it never replaces it. `npm test` validates every file here (`scripts/test-exp10-data.js`).

## Design and its limits

- **One device, two phases.** The iPhone 16e ran iOS 26 during phase A and was then updated to iOS 27. Apple stops signing older iOS versions shortly after a major release, so phase A cannot be repeated or run side by side.
- **The battery ages between phases.** Any battery or speed difference between phase A and phase B mixes the OS change with a year of wear. `monthly.csv` records maximum capacity and cycle count so that wear can be shown next to each result, but it cannot be removed from it.
- **Separate from Experiment 12.** Experiment 12 uses the same phone to check Apple's iOS 27 launch claims and chatbot integration. Experiment 10 is the long-run trend and keeps its own log. When a session for one experiment affects the other (for example, a heavy Experiment 12 battery test the day before a standby reading), note it in `notes`.

## Phase A: iOS 26 (collected, then paused)

- Data was collected while the phone was on iOS 26.
- TBD — dates, what was recorded, and where it is stored. Until those are known, phase A has no rows in this folder and is not used in any comparison.
- When the phase A data is available, add it to the matching CSV with the iOS 26 version in `os_version`. If a measurement was taken differently from the method below, say so in `notes`.

## Resume day (phase B baseline), done once before phase B data counts

- [ ] Add a row to `updates.csv` for the update to iOS 27 (use the approximate date if unsure, and say so in `notes`).
- [ ] Record the current version and build (Settings → General → About).
- [ ] Log a `monthly.csv` row.
- [ ] Choose the overnight standby conditions (Wi-Fi on, cellular on, Low Power Mode off, Background App Refresh on, and so on) and write them under **Standby conditions** below. Keep them the same for the rest of the study.
- [ ] Run one full weekly session. It counts as week 0 of phase B.

## Weekly: about 10 minutes

**Standby drain, one `weekly.csv` row:**
- At bedtime, charge to at least 80 %, unplug, and note `standby_start_pct`. In the morning, note `standby_end_pct` before touching anything else, and the hours between the two readings in `standby_hours`.
- Use the same conditions every week. If something was different (an alarm, a charging mistake, a heavy Experiment 12 session), say so in `notes`.

**Crash logs, same row:**
- Settings → Privacy & Security → Analytics & Improvements → Analytics Data. Count the entries dated since the last session and put the number in `new_crash_logs`. Entries only appear if "Share iPhone Analytics" is on; if it is off, leave the field empty and say so in `notes`.

**App launch times, 15 `launches.csv` rows:**
- Apps: Settings, Camera, Safari, Messages and Maps. These are Apple's built-in apps, so they change with iOS and not through App Store updates.
- For each app: close it from the app switcher, wait 5 seconds, then tap and time from the tap until the app is usable. Three trials per app.
- Timing uses a stopwatch, so resolution is about ±0.3 s. It can only catch large slowdowns. Keep the same method all year.

## Monthly: about 15 minutes

One `monthly.csv` row.
- `max_capacity_pct`: Settings → Battery → Battery Health.
- `cycle_count`: Settings → General → About.
- `storage_free_gb`: Settings → General → iPhone Storage.
- `geekbench_single` and `geekbench_multi`: optional. Geekbench 6 CPU test, phone at room temperature, plugged in, nothing else running. Leave empty if not run.

## Whenever they happen

- **`updates.csv`:** one row per iOS update (27.0.1, 27.1, and so on), with the build number.
- **`incidents.csv`:** one row per crash you noticed, hang, broken feature, or app that stopped working. `type` is one of `crash`, `hang`, `bug`, `compatibility` or `other`.

## Standby conditions

TBD — fill in on resume day.

## Status

- Status: paused
- Phase A (iOS 26): collected; details TBD
- Phase B (iOS 27): resume day not done yet
