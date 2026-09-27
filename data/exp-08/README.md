# Experiment 8: data log

Cross-platform ecosystem reliability and hardware longevity. A 24-month study of 12 owned devices in a stationary setup.

This folder is the raw record. The site entry in `src/data/official-experiments.js` summarises it; it never replaces it. `npm test` validates every file here (`scripts/test-exp08-data.js`).

## Devices

Three ecosystems, four first-party devices each. The full list is in `devices.csv`.

| Category | Apple | Google | Samsung |
|---|---|---|---|
| Phone | iPhone 16e | Pixel 10 Pro | Galaxy S26 Ultra |
| Laptop | MacBook Pro M2 Pro | Galaxy Chromebook Plus 15.6" (ChromeOS) | Galaxy Book4 Edge 15.6" (Windows 11) |
| Watch | Apple Watch SE 3 | Pixel Watch 4 | Galaxy Watch8 |
| Earbuds | AirPods 5 | Pixel Buds Pro 2 | Galaxy Buds4 Pro |

The laptops are in different hardware tiers. The study measures whether each ecosystem performs its cross-device features smoothly, not raw performance.

## Day 0 (baseline), done once before any weekly data counts

For every device:
- [ ] Fill in `acquired_date` and `os_at_baseline` in `devices.csv`.
- [ ] Update to the current stable OS and firmware, then note the versions.
- [ ] Log a `health.csv` row with `checkpoint` = `m00`.
- [ ] Take condition photos (front, back, edges, screen on white). Name them `m00_<device_id>_<view>.jpg` and store them outside the repo; note where in the row's `notes`.

For each ecosystem:
- [ ] Unpair every accessory, then pair it again from scratch. Note any friction.
- [ ] Confirm the continuity features are switched on: clipboard sync, file sharing, phone-to-laptop notifications, and audio auto-switch.
- [ ] Put the standard 50MB test file on every phone and laptop (same file everywhere; record its name in the notes).
- [ ] Run one full weekly session. It counts as week 0.

## Weekly: about 15 minutes per ecosystem

One `weekly.csv` row per trial.

| `test` value | What to do | Trials |
|---|---|---|
| `clipboard_p2l` | Copy text on the phone and paste it on the laptop. Time from copy until it pastes | 5 |
| `clipboard_l2p` | Copy on the laptop and paste on the phone | 5 |
| `file_transfer` | Send the 50MB test file phone → laptop with AirDrop or Quick Share. Time from send until it arrives | 3 |
| `notif_watch` | Trigger a phone notification. Time until it shows on the watch; put `dismiss_sync=Y` or `N` in `notes` | 5 |
| `audio_switch` | Play audio on the phone, then start playback on the laptop. Time until the earbuds switch on their own | 3 |

- `success` is `1` or `0`. `seconds` is empty when `success` = `0`.
- Timing uses a stopwatch, so resolution is about ±1 s. Stick to that method for all 24 months.
- `phone_os`, `laptop_os` and `accessory_fw` record the versions on the day, so update effects can be traced.

## Monthly: about 10 minutes

One `health.csv` row per device, with `checkpoint` = `monthly`.

- **Battery health and cycle count:** fill them in where the OS shows them. For example: iPhone under Settings → Battery; macOS in System Information → Power; Windows via `powercfg /batteryreport`. Where a device doesn't expose them (common for watches and earbuds), write `not_exposed` rather than estimating.
- **`issues`:** anything noticed since last month; details go in `incidents.csv`.

## Checkpoints at months 6, 12, 18 and 24: about 1 hour

`health.csv` rows use `checkpoint` = `m06`, `m12`, `m18` or `m24`.

- A full battery rundown on each phone and laptop, recorded in the row's `notes`.
- Condition photos, same views as day 0.
- Unpair and re-pair every accessory; note friction.
- Run the monthly measurements plus one weekly session.

## Incidents: whenever they happen

One `incidents.csv` row per sync failure, dropout, crash or forced re-pair.

## Status

- Protocol approved: 2026-09-27
- Day 0: not started
