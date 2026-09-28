/**
 * Official Authoritative Experiment Protocols & Findings
 * Source of Truth: WDIII Laboratory Archive (official_wdiii)
 * Step 6 Phase 6A Foundation: Dynamic Measurement Schemas & Allowed Keys
 */

export const OFFICIAL_EXPERIMENTS = [
  {
    "id": "exp1",
    "experimentNumber": "1",
    "title": "Experiment 1: Apple vs Samsung Mail-In Repair",
    "category": "repair",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "When identical level 9 screen damage is submitted via mail-in to official repair centers for Apple and Samsung, how do cost, turnaround time, communication quality, and physical repair quality compare?",
    "objective": "Compare official manufacturer mail-in repair turnaround, total cost, customer communication, and physical repair quality between Apple and Samsung for identical cracked screen damage.",
    "methodology": "Same level 9 cracked screen damage sent via mail-in to official repair centers for both Apple (iPhone 17 Pro Max) and Samsung (Galaxy S26 Ultra). Testing cost, turnaround time, communication quality, and repair quality.",
    "conditions": "Identical level 9 screen damage, official manufacturer mail-in service channels only, 1-month observation period.",
    "protocol": "1. Document baseline level 9 display damage. 2. Initiate official mail-in repair request online. 3. Ship device using manufacturer-provided packaging. 4. Track notification intervals and payment portal responsiveness. 5. Inspect returned unit under 10x magnification for display seam tightness, adhesive residue, and touch digitizer calibration.",
    "measurements": {
      "apple": {
        "device": "iPhone 17 Pro Max",
        "cost": "$600",
        "turnaround": "2 days",
        "quality": "Pristine",
        "communication": "Proactive texts/calls",
        "issues": "None"
      },
      "samsung": {
        "device": "Galaxy S26 Ultra",
        "cost": "$289–$300",
        "turnaround": "~1 month",
        "quality": "Pristine",
        "communication": "Text updates only",
        "issues": "Critical admin failure"
      }
    },
    "results": "Apple completed repair in 2 days at $600 with pristine quality and proactive communication. Samsung took ~1 month ($289–$300) due to a 14-day administrative failure where an incorrect email address delayed the payment link, requiring a full re-dispatch, though physical repair quality was also pristine.",
    "observations": [
      "Critical Failure — Samsung Admin Error: Samsung wrote the email address incorrectly and sent no payment link. After 14 days, the phone was returned unrepaired. The process had to restart entirely, wasting an additional 14 days.",
      "Repair Quality Was Identical: Both phones returned pristine — screen tight, crystal clean, polished. Quality is not the differentiator. Process, speed, and communication are.",
      "Apple's Premium Delivers Velocity: Apple delivered in 48 hours with proactive customer alerts, whereas Samsung's logistical friction erased its 50% price advantage."
    ],
    "limitations": "📋 n=1 per brand — single case, not a statistical sample",
    "verdict": "Winner: Apple. Apple charges double ($600 vs $300) but delivers in 2 days with zero friction. Samsung's administrative failure erased every cost advantage. When repair quality is equal, execution determines the winner.",
    "devices": [
      "apple-iphone-17-pro-max",
      "samsung-galaxy-s26-ultra"
    ],
    "sources": [
      "WDIII Experiment 1 Empirical Testing Log",
      "Apple Support Official Repair Invoice",
      "Samsung Care+ Repair Ticket"
    ],
    "tags": [
      "1 month duration",
      "Level 9 screen damage",
      "Official channels only"
    ],
    "scope": "📋 n=1 per brand — single case, not a statistical sample",
    "search": "exp-1 apple samsung repair mail-in screen damage",
    "toc": [
      {
        "id": "exp1-comparison",
        "label": "Comparison"
      },
      {
        "id": "exp1-findings",
        "label": "Key Findings"
      },
      {
        "id": "exp1-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp2",
        "label": "⚙️ Also see: Experiment 2 — Repair Channel Tiers"
      },
      {
        "id": "exp6",
        "label": "🏪 Also see: Experiment 6 — AASP Repair Test"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "turnaroundDays",
        "label": "Turnaround Time",
        "type": "number",
        "unit": "Days",
        "required": true,
        "min": 0,
        "max": 120
      },
      {
        "key": "repairCost",
        "label": "Total Repair Cost",
        "type": "number",
        "unit": "USD",
        "required": true,
        "min": 0,
        "max": 2000
      },
      {
        "key": "qualityRating",
        "label": "Physical Repair Quality",
        "type": "number",
        "unit": "/ 10",
        "required": false,
        "min": 1,
        "max": 10
      },
      {
        "key": "repairQuality",
        "label": "Quality Assessment",
        "type": "string",
        "required": false
      },
      {
        "key": "communicationRating",
        "label": "Communication Quality Rating",
        "type": "number",
        "unit": "Score",
        "required": false,
        "min": 1,
        "max": 10
      },
      {
        "key": "adminIssueOccurred",
        "label": "Administrative / Logistical Failure",
        "type": "boolean",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "turnaroundDays",
      "repairCost",
      "qualityRating",
      "repairQuality",
      "communicationRating",
      "adminIssueOccurred"
    ]
  },
  {
    "id": "exp2",
    "experimentNumber": "2",
    "title": "Experiment 2: Repair Channel Comparison",
    "category": "repair",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "With identical damage, how do official Apple, a third-party shop using genuine parts, and a cheap unauthorized shop compare on cost, turnaround, quality, waterproofing and warranty?",
    "objective": "Compare three repair channels on three identical iPhone 15s with identical level 9 screen and back-glass damage.",
    "methodology": "Three identical iPhone 15 models with identical level 9 damage (screen + back glass) were taken to three different repair channels: Official Apple, a third-party shop using genuine parts, and a cheap unauthorized shop using generic parts.",
    "conditions": "Identical iPhone 15 hardware and identical damage across all three units; one unit per channel.",
    "protocol": "Take each unit to its channel, record quote, turnaround, parts used, quality, waterproofing and warranty terms.",
    "measurements": {
      "officialApple": {
        "cost": "$399",
        "turnaround": "3-day repair + 5-day scheduling wait (8 days total)",
        "parts": "Genuine, authenticated",
        "waterproofing": "Maintained",
        "qualityChecks": "Full",
        "result": "Pristine"
      },
      "thirdPartyGenuineParts": {
        "quote": "$450",
        "qualityChecks": "None (stated upfront)",
        "warranty": "None (stated upfront)",
        "result": "Could not source genuine parts; repair cancelled by owner before any work was done"
      },
      "cheapUnauthorized": {
        "cost": "$220",
        "turnaround": "1 day (same day if parts in stock)",
        "parts": "Generic",
        "waterproofing": "Lost (back glass super-glued)",
        "screen": "Noticeably thicker than Apple's",
        "warranty": "None"
      }
    },
    "results": "Official Apple: $399, 8 days total, pristine, genuine authenticated parts, waterproofing maintained. The genuine-parts third party quoted $450 with no quality checks or warranty, then could not source parts and the repair was cancelled. The cheap unauthorized shop charged $220 with a 1-day turnaround but used generic parts, super-glued the back glass (losing waterproofing), fitted a noticeably thicker screen and gave no warranty.",
    "observations": [
      "The genuine-parts third party was the worst deal: more expensive than Apple, fewer guarantees, and it could not deliver.",
      "Cheap repairs are fast but compromise waterproofing, build and warranty.",
      "Background, not tested here: only Apple and authorized providers can authenticate parts in software."
    ],
    "limitations": "One unit per channel — anecdotal, not a statistical sample. The genuine-parts third-party repair was never performed.",
    "verdict": "Winner: Official Apple ($399, 8 days total). The only option that preserved waterproofing, warranty and part authenticity.",
    "devices": [
      "apple-iphone-15"
    ],
    "sources": [
      "Owner's repair records"
    ],
    "tags": [
      "3 iPhone 15s",
      "Level 9 screen + back glass damage",
      "Identical damage across all devices"
    ],
    "scope": "📋 1 unit per channel — anecdotal, not a statistical sample",
    "search": "exp-2 repair channel tiers iphone 15 aasp",
    "toc": [
      {
        "id": "exp2-channels",
        "label": "Channel Comparison"
      },
      {
        "id": "exp2-findings",
        "label": "Key Findings"
      },
      {
        "id": "exp2-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp1",
        "label": "📦 Experiment 1 — Apple vs Samsung Mail-In"
      },
      {
        "id": "exp6",
        "label": "🏪 Experiment 6 — AASP Repair Test (iFix)"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "repairCostUsd",
        "label": "Repair cost",
        "type": "number",
        "required": true,
        "unit": "USD",
        "min": 0,
        "max": 5000
      },
      {
        "key": "turnaroundDays",
        "label": "Turnaround",
        "type": "number",
        "required": false,
        "unit": "days",
        "min": 0,
        "max": 120
      },
      {
        "key": "waterproofingPreserved",
        "label": "Waterproofing preserved",
        "type": "boolean",
        "required": false
      },
      {
        "key": "warrantyProvided",
        "label": "Warranty provided",
        "type": "boolean",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "repairCostUsd",
      "turnaroundDays",
      "waterproofingPreserved",
      "warrantyProvided"
    ]
  },
  {
    "id": "exp3",
    "experimentNumber": "3",
    "title": "Experiment 3: Customer Service Quality Test",
    "category": "support",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "How well do 8 major smartphone brands' phone support lines handle the same simple problem?",
    "objective": "Call each brand's customer support with the identical question and judge speed to the correct answer, troubleshooting quality, accuracy and helpfulness.",
    "methodology": "The same question was asked by phone to customer support at 8 brands: \"My phone screen is going black.\" The correct answer is that the battery is draining and needs charging.",
    "conditions": "Identical question for every brand; phone support only.",
    "protocol": "Call each brand, ask the question, score speed to the correct answer, troubleshooting quality, accuracy and helpfulness out of 5.",
    "measurements": {
      "Huawei": "4.5 / 5",
      "Xiaomi": "4.5 / 5",
      "OPPO": "3.5 / 5",
      "OnePlus": "3 / 5",
      "Apple": "2.5 / 5",
      "Vivo": "1 / 5",
      "Samsung": "0 / 5",
      "BlackBerry": "0 / 5"
    },
    "results": "Huawei and Xiaomi tied at 4.5/5 with fast, direct, friendly support. OPPO (3.5) was overcomplicated at first but correct; OnePlus (3) was correct but roundabout with background noise; Apple (2.5) had a long wait, a struggling automated system and required the device to be present; Vivo (1) answered quickly but would not help, offering email instead; Samsung (0) put the call into an automated loop and hung up; BlackBerry (0) required a fee to speak to a human.",
    "observations": [
      "Apple and Samsung, two of the biggest brands, gave some of the weakest experiences: Samsung failed outright and Apple placed 5th of 8.",
      "Speed is not helpfulness: Vivo answered fastest but would not help over the phone."
    ],
    "limitations": "One call per brand — anecdotal, not a statistical sample.",
    "verdict": "Winners: Huawei & Xiaomi (tied at 4.5/5). Avoid Samsung and BlackBerry support.",
    "devices": [],
    "sources": [
      "Owner's call records"
    ],
    "tags": [
      "8 companies tested",
      "Same-day testing",
      "7–15 minutes per call",
      "Calls recorded"
    ],
    "scope": "One call per brand — anecdotal, not a statistical sample.",
    "search": "exp-3 customer service support test call phone",
    "toc": [
      {
        "id": "exp3-performers",
        "label": "Top Performers"
      },
      {
        "id": "exp3-rankings",
        "label": "Full Rankings"
      },
      {
        "id": "exp3-findings",
        "label": "Key Findings"
      },
      {
        "id": "exp3-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp1",
        "label": "📦 Experiment 1 — Apple vs Samsung Mail-In"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "supportRating",
        "label": "Support rating",
        "type": "number",
        "required": true,
        "unit": "/ 5",
        "min": 0,
        "max": 5
      },
      {
        "key": "correctAnswerGiven",
        "label": "Correct answer given",
        "type": "boolean",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "supportRating",
      "correctAnswerGiven"
    ]
  },
  {
    "id": "exp4",
    "experimentNumber": "4",
    "title": "Experiment 4: iOS Performance Comparison (Historical)",
    "category": "software",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "On the same iPhone 15 Pro, how does iOS 26 compare with iOS 18.6 for performance, battery, stability and day-to-day experience?",
    "objective": "Compare iOS 18.6 and iOS 26.0.1 on identical hardware, following iOS 26 through to 26.4.2.",
    "methodology": "Long-term comparison on the same iPhone 15 Pro: boot speed, storage transfer, a 16-app loading test, browser benchmarks (Speedometer 3.1, JetStream 2.2), 3DMark thermal stability, battery on the same workload, and day-to-day stability.",
    "conditions": "Same iPhone 15 Pro hardware for all versions.",
    "protocol": "Run the same tests on iOS 18.6 and iOS 26.0.1, then re-check through later iOS 26 releases up to 26.4.2.",
    "measurements": {
      "bootSpeed": "iOS 26 faster by 1.7–2.7%",
      "storageTransfer": "iOS 26 faster; 26.4.2 faster still",
      "appLoading16App": "iOS 26 faster by 8–13%",
      "browserBenchmarks": "iOS 26 significantly better (Speedometer 3.1 / JetStream 2.2)",
      "thermalStability3DMark": {
        "iOS 18.6": "88.4%",
        "iOS 26": "70.9%"
      },
      "batteryRemainingSameWorkload": {
        "iOS 18.6": "74%",
        "iOS 26.0.1": "66%",
        "iOS 26.4.2": "71%"
      }
    },
    "results": "iOS 26 was faster across every performance test but launched with lower thermal stability (70.9% vs 88.4% in 3DMark) and worse battery (66% vs 74% remaining on the same workload; 71% by 26.4.2). Before 26.3 the home screen was choppy (~30 FPS) and launch builds had high background CPU use; both were resolved by 26.4.2. Power-button failures and Apple Watch notification bugs persisted.",
    "observations": [
      "Don't update at launch — wait for the .2 or .3 release before updating a daily driver.",
      "Performance gains came at a battery cost of roughly 9% versus iOS 18.6."
    ],
    "limitations": "Single device (iPhone 15 Pro).",
    "verdict": "iOS 26 is the better OS — but only after the dust settled several months post-launch.",
    "devices": [
      "apple-iphone-15-pro"
    ],
    "sources": [
      "Owner's own testing"
    ],
    "tags": [
      "iOS 18.6 vs iOS 26.0.1",
      "iPhone 15 Pro",
      "Comprehensive testing"
    ],
    "scope": "Single device (iPhone 15 Pro).",
    "search": "exp-4 ios 18 26 performance comparison historical",
    "toc": [
      {
        "id": "exp4-performance",
        "label": "Performance Metrics"
      },
      {
        "id": "exp4-battery",
        "label": "Battery Life"
      },
      {
        "id": "exp4-stability",
        "label": "Stability"
      },
      {
        "id": "exp4-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp5",
        "label": "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone"
      },
      {
        "id": "queued-exp10",
        "label": "⏸️ Paused Exp 10 — Year-Long iOS 26 vs iOS 27 Survey"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "bootSpeedDeltaPercent",
        "label": "Boot speed change",
        "type": "number",
        "required": false,
        "unit": "%",
        "min": -100,
        "max": 100
      },
      {
        "key": "appLoadDeltaPercent",
        "label": "App loading change",
        "type": "number",
        "required": false,
        "unit": "%",
        "min": -100,
        "max": 100
      },
      {
        "key": "thermalStabilityPercent",
        "label": "3DMark thermal stability",
        "type": "number",
        "required": false,
        "unit": "%",
        "min": 0,
        "max": 100
      },
      {
        "key": "batteryRemainingPercent",
        "label": "Battery remaining (same workload)",
        "type": "number",
        "required": true,
        "unit": "%",
        "min": 0,
        "max": 100
      }
    ],
    "allowedMeasurementKeys": [
      "bootSpeedDeltaPercent",
      "appLoadDeltaPercent",
      "thermalStabilityPercent",
      "batteryRemainingPercent"
    ]
  },
  {
    "id": "casestudy",
    "experimentNumber": "CS-01",
    "title": "Case Study: Samsung Battery Failures & Corporate Accountability",
    "category": "legal",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "What happened when multiple stored Samsung devices from 2016–2020 developed battery swelling, and how did Samsung respond?",
    "objective": "Document the battery swelling, Samsung's response, the escalation and the outcome.",
    "methodology": "Not a planned experiment — it developed through consistent documentation: photos and video of all affected devices, receipts, Samsung's own 5-year battery-life claims, a control group of non-Samsung and newer Samsung devices in the same storage, and the full email trail.",
    "conditions": "Affected and control devices kept in the same storage.",
    "protocol": "Discovery and public post (April 30); device collection (early May); 50 days without substantive response; CPSC and BBB complaints and a consumer rights attorney; settlement (June 18).",
    "measurements": {
      "devicesAffected": 7,
      "settlementUsd": 1020,
      "daysWithoutResponse": 50,
      "s20feAgeAtFailure": "18 months (battery label claims a 5-year lifespan)"
    },
    "results": "Seven Samsung devices from 2016–2020 (Galaxy S8, S10, S10e, Note 8 ×2, Z Fold 2, S20 FE) swelled; Galaxy S21–S26, non-Samsung devices and an iPhone 5c in the same storage did not. After 50 days without a substantive answer and escalation to CPSC, BBB and an attorney, Samsung settled on June 18 with $1,020 cash across 7 devices and no NDA.",
    "observations": [
      "The 18-month-old S20 FE, against Samsung's own 5-year battery claim, was the decisive evidence.",
      "Documentation and willingness to escalate gave an individual consumer real leverage."
    ],
    "limitations": "Single consumer case; not a controlled experiment.",
    "verdict": "Outcome: $1,020 cash settlement across 7 devices, no NDA.",
    "devices": [
      "samsung-galaxy-s20-fe",
      "samsung-galaxy-s8",
      "samsung-galaxy-s10",
      "samsung-galaxy-s10e",
      "samsung-galaxy-note-8",
      "samsung-galaxy-z-fold-2",
      "apple-iphone-5c",
      "samsung-galaxy-s21",
      "samsung-galaxy-s22",
      "samsung-galaxy-s23",
      "samsung-galaxy-s24",
      "samsung-galaxy-s25"
    ],
    "sources": [
      "Owner's photos, receipts and email trail",
      "CPSC complaint acknowledgment"
    ],
    "tags": [
      "April 30 – June 18, 2026",
      "7 Devices Affected",
      "Resolved: $1,020 Cash Settlement",
      "No NDA"
    ],
    "scope": "Single consumer case; not a controlled experiment.",
    "search": "case study samsung battery settlement swelling legal",
    "toc": [
      {
        "id": "casestudy-devices",
        "label": "Affected Devices"
      },
      {
        "id": "casestudy-timeline",
        "label": "Timeline"
      },
      {
        "id": "casestudy-evidence",
        "label": "Key Evidence"
      },
      {
        "id": "casestudy-advice",
        "label": "Consumer Advice"
      },
      {
        "id": "casestudy-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp1",
        "label": "📦 Experiment 1 — Apple vs Samsung Mail-In"
      },
      {
        "id": "exp5",
        "label": "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "devicesAffected",
        "label": "Devices affected",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 100
      },
      {
        "key": "settlementUsd",
        "label": "Settlement",
        "type": "number",
        "required": false,
        "unit": "USD",
        "min": 0,
        "max": 100000
      },
      {
        "key": "daysWithoutResponse",
        "label": "Days without response",
        "type": "number",
        "required": false,
        "unit": "days",
        "min": 0,
        "max": 3650
      }
    ],
    "allowedMeasurementKeys": [
      "devicesAffected",
      "settlementUsd",
      "daysWithoutResponse"
    ]
  },
  {
    "id": "exp5",
    "experimentNumber": "5",
    "title": "Experiment 5: Battery Life — Google Pixel Pro vs iPhone",
    "category": "hardware",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "How does real-world battery endurance compare across five Pixel Pro generations and three iPhones?",
    "objective": "Compare screen-on time and daily endurance of the Pixel 6 Pro–10 Pro against the iPhone 13, 15 Pro and 16e.",
    "methodology": "Real-world screen-on time and usage duration, not synthetic benchmarks. All devices ran on brand-new batteries and came from identical controlled storage conditions.",
    "conditions": "Brand-new batteries in all 8 devices; identical storage conditions.",
    "protocol": "Use each device in real-world conditions and record screen-on time and how long a charge lasts.",
    "measurements": {
      "Pixel 6 Pro": "5–6 hrs SoT, ~1 day",
      "Pixel 7 Pro": "5–7 hrs SoT, ~1 day",
      "Pixel 8 Pro": "6.5–8.5 hrs SoT, 1–1.5 days",
      "Pixel 9 Pro": "7–9 hrs SoT, 1–1.5 days",
      "Pixel 10 Pro": "7.5–9+ hrs SoT, ~1.5 days",
      "iPhone 13": "6–7 hrs SoT, 1 day",
      "iPhone 15 Pro": "6–7 hrs SoT, 1 day",
      "iPhone 16e": "8–10 hrs SoT, 1.5 days"
    },
    "results": "The Pixel 10 Pro and iPhone 16e tied at about 1.5 days. The Pixel 9 Pro (smallest battery at 4700 mAh) came 2nd among Pixels, beating the 5003 mAh Pixel 6 Pro by a wide margin. Head-to-head: iPhone 13 beat the Pixel 6 Pro; Pixel 7 Pro roughly tied the iPhone 13 and trailed the 15 Pro on cellular; Pixel 8 Pro beat the 15 Pro on mixed use and streaming but not gaming; Pixel 9 Pro and 16e were a near tie; Pixel 10 Pro vs 16e depends on usage.",
    "observations": [
      "Chip efficiency beats raw battery capacity.",
      "The iPhone 16e keeps up with the Pixel 10 Pro largely thanks to Apple's C1 modem."
    ],
    "limitations": "One unit per model; real-world usage rather than a fixed synthetic workload.",
    "verdict": "Winner: Pixel 10 Pro & iPhone 16e (tied, ~1.5 days).",
    "devices": [
      "google-pixel-6-pro",
      "google-pixel-7-pro",
      "google-pixel-8-pro",
      "google-pixel-9-pro",
      "google-pixel-10-pro",
      "apple-iphone-13",
      "apple-iphone-15-pro",
      "apple-iphone-16e"
    ],
    "sources": [
      "Owner's own testing"
    ],
    "tags": [
      "5 Pixel Pro models",
      "3 iPhone models",
      "All devices on brand-new batteries",
      "Controlled storage environment"
    ],
    "scope": "One unit per model; real-world usage rather than a fixed synthetic workload.",
    "search": "exp-5 pixel iphone battery life comparison",
    "toc": [
      {
        "id": "exp5-pixel",
        "label": "Pixel Pro Generation"
      },
      {
        "id": "exp5-cross",
        "label": "Cross-Platform"
      },
      {
        "id": "exp5-headtohead",
        "label": "Head-to-Head"
      },
      {
        "id": "exp5-ranking",
        "label": "Overall Ranking"
      },
      {
        "id": "exp5-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp7",
        "label": "📱 Experiment 7 — Pixel Generation Comparison"
      },
      {
        "id": "fa02",
        "label": "🔄 FA-02 — One Month Out of Apple"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "screenOnTimeHours",
        "label": "Screen-on time",
        "type": "number",
        "required": true,
        "unit": "hours",
        "min": 0,
        "max": 48
      },
      {
        "key": "enduranceDays",
        "label": "Endurance per charge",
        "type": "number",
        "required": false,
        "unit": "days",
        "min": 0,
        "max": 7
      }
    ],
    "allowedMeasurementKeys": [
      "screenOnTimeHours",
      "enduranceDays"
    ]
  },
  {
    "id": "exp6",
    "experimentNumber": "6",
    "title": "Experiment 6: AASP Repair Test — iFix",
    "category": "repair",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "Does an Apple Authorized Service Provider deliver Official Apple repair quality?",
    "objective": "Test the AASP repair channel — the missing fourth tier from Experiment 2 — using data contributed by MTA.",
    "methodology": "An iPhone 16 Pro Max with level 9 screen and back-glass damage was repaired at iFix, an Apple Authorized Service Provider. Data contributed by colleague MTA and used with permission.",
    "conditions": "Different device from Experiment 2 (iPhone 16 Pro Max vs iPhone 15), so costs are not directly comparable.",
    "protocol": "Record cost, quality, warranty, waterproofing and parts authentication after the AASP repair.",
    "measurements": {
      "device": "iPhone 16 Pro Max",
      "channel": "iFix (AASP)",
      "cost": "$599",
      "quality": "Identical to Official Apple",
      "defects": "None",
      "warrantyExtension": "Yes — same as Official Apple",
      "waterproofingAndPartsAuth": "Preserved"
    },
    "results": "The iFix repair cost $599 and matched Official Apple: same quality control, same warranty extension, no defects, waterproofing and parts authentication preserved.",
    "observations": [
      "MTA's view: 'authorized' often means outsourced to subcontractors, reducing accountability.",
      "MTA cited a Business Insider report on CSAT Solutions (an Apple contractor in Houston) describing poor working conditions.",
      "MTA's view: Apple's hard-to-open designs strain technicians; independent shops often do board-level repairs authorized centers call impossible."
    ],
    "limitations": "n=1, contributed data; different model from Experiment 2, so costs are not directly comparable.",
    "verdict": "An AASP is a legitimate alternative to Official Apple when an Apple Store isn't accessible.",
    "devices": [
      "apple-iphone-16-pro-max"
    ],
    "sources": [
      "Repair data contributed by MTA (with permission)"
    ],
    "tags": [
      "iPhone 16 Pro Max",
      "Level 9 screen + back glass",
      "Apple Authorized Service Provider",
      "Contributor: MTA"
    ],
    "scope": "n=1, contributed data; different model from Experiment 2, so costs are not directly comparable.",
    "search": "exp-6 aasp repair test ifix authorized",
    "toc": [
      {
        "id": "exp6-results",
        "label": "Repair Results"
      },
      {
        "id": "exp6-comparison",
        "label": "Channel Comparison"
      },
      {
        "id": "exp6-perspective",
        "label": "MTA's Perspective"
      },
      {
        "id": "exp6-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp1",
        "label": "📦 Experiment 1 — Apple vs Samsung Mail-In"
      },
      {
        "id": "exp2",
        "label": "⚙️ Experiment 2 — Repair Channel Tiers"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "repairCostUsd",
        "label": "Repair cost",
        "type": "number",
        "required": true,
        "unit": "USD",
        "min": 0,
        "max": 5000
      },
      {
        "key": "defectsFound",
        "label": "Defects found",
        "type": "number",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "warrantyExtended",
        "label": "Warranty extended",
        "type": "boolean",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "repairCostUsd",
      "defectsFound",
      "warrantyExtended"
    ]
  },
  {
    "id": "exp7",
    "experimentNumber": "7",
    "title": "Experiment 7: Google Pixel Pro Generation Comparison",
    "category": "hardware",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "How did the Pixel Pro line evolve from the 6 Pro to the 10 Pro in chips, cameras and real-world performance?",
    "objective": "Compare five Pixel Pro generations (Tensor G1–G5) side by side in real-world use.",
    "methodology": "One unit per generation (Pixel 6 Pro to 10 Pro), the same devices as Experiment 5, all on brand-new batteries from the same storage. Chip and camera specifications are Google's published specs; thermals, fluidity and performance are the owner's observations.",
    "conditions": "Same devices, brand-new batteries, same storage environment.",
    "protocol": "Use each generation for everyday tasks, photography, video recording and heavier workloads; compare thermals, UI fluidity and camera results.",
    "measurements": {
      "thermals": {
        "Pixel 6 Pro": "Poor",
        "Pixel 7 Pro": "Improved",
        "Pixel 8 Pro": "Moderate",
        "Pixel 9 Pro": "Good",
        "Pixel 10 Pro": "Excellent"
      },
      "uiFluidity": {
        "Pixel 6 Pro": "Inconsistent",
        "Pixel 7 Pro": "Better",
        "Pixel 8 Pro": "Fluid",
        "Pixel 9 Pro": "Very fluid",
        "Pixel 10 Pro": "Excellent"
      }
    },
    "results": "All generations handle social media, browsing and photos with ease. The 9 Pro and 10 Pro are noticeably more responsive. G1–G4 throttled under heavy use, with thermal and camera shutdowns on older generations; the TSMC-made G5 in the 10 Pro runs cooler, holds performance all day and did not throttle during long video recording. The 10 Pro's 100x Pro Res Zoom produces surprisingly usable distant shots.",
    "observations": [
      "The TSMC switch is the biggest Pixel upgrade in five years.",
      "Same camera megapixels since the 7 Pro; the biggest gains came from processing.",
      "Best value: Pixel 8 Pro. Upgrade advice: 6 → 10 night and day, 7 → 10 significant, 8 → 10 optional, 9 → 10 skip."
    ],
    "limitations": "One unit per generation — anecdotal, not a statistical sample.",
    "verdict": "Buy the 10 Pro, keep the 8 Pro, skip the rest.",
    "devices": [
      "google-pixel-6-pro",
      "google-pixel-7-pro",
      "google-pixel-8-pro",
      "google-pixel-9-pro",
      "google-pixel-10-pro"
    ],
    "sources": [
      "Owner's own testing",
      "Google published specifications (chips, cameras)"
    ],
    "tags": [
      "Pixel 6 Pro → 10 Pro",
      "5 Generations",
      "Chip · Camera · Performance",
      "All devices on brand-new batteries"
    ],
    "scope": "📋 1 unit per generation — anecdotal, not a statistical sample",
    "search": "exp-7 pixel pro generation comparison tensor chip camera",
    "toc": [
      {
        "id": "exp7-chipset",
        "label": "Chipset Evolution"
      },
      {
        "id": "exp7-eras",
        "label": "Generational Eras"
      },
      {
        "id": "exp7-camera",
        "label": "Camera Evolution"
      },
      {
        "id": "exp7-performance",
        "label": "Real-World Performance"
      },
      {
        "id": "exp7-upgrade",
        "label": "Upgrade Path"
      },
      {
        "id": "exp7-conclusion",
        "label": "Conclusion"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp5",
        "label": "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone"
      },
      {
        "id": "fa02",
        "label": "🔄 FA-02 — One Month Out of Apple"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "thermalRating",
        "label": "Thermal rating",
        "type": "string",
        "required": false
      },
      {
        "key": "uiFluidity",
        "label": "UI fluidity",
        "type": "string",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "thermalRating",
      "uiFluidity"
    ]
  },
  {
    "id": "exp9",
    "experimentNumber": "9",
    "title": "Experiment 9: Comprehensive Apple Ecosystem Security Audit",
    "category": "software",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "What attack vectors, telemetry leaks, and permission bypasses exist across macOS, iOS, iCloud, and AirDrop in default consumer configurations?",
    "objective": "Conduct an end-to-end security and privacy audit of default Apple ecosystem configurations, evaluating network telemetry, AirDrop vulnerability exposure, and iCloud Advanced Data Protection resilience.",
    "methodology": "Packet capture with Wireshark on isolated gateway router, Bluetooth low-energy packet sniffing during AirDrop discovery, and penetration testing on iCloud keychain synchronization with and without Advanced Data Protection.",
    "conditions": "Isolated VLAN network, default consumer Apple ID configurations, macOS Sonoma & iOS 18 test units.",
    "protocol": "1. Capture 72 hours of idle background telemetry packets. 2. Sniff BLE broadcast frames during AirDrop 'Everyone' and 'Contacts Only' states. 3. Test sandbox escape mitigations in Safari WebKit. 4. Verify end-to-end encryption keys under iCloud ADP.",
    "measurements": {
      "telemetryHostsContacted": "42 distinct Apple domains",
      "airDropHashLeak": "Partial phone/email SHA256 hashes broadcast in BLE advertise packets",
      "cloudADPEncryptionCoverage": "98% of data types encrypted (excluding metadata, mail, contacts, calendar)",
      "gatekeeperBypassResistance": "High (quarantine attributes enforced)"
    },
    "results": "Apple maintains industry-leading default endpoint security and sandbox isolation. However, AirDrop discovery broadcasts truncated cryptographic hashes of user phone numbers and emails, and default iCloud backups (without ADP enabled) allow Apple legal access to iMessage encryption keys.",
    "observations": [
      "AirDrop Hash Leakage: Passive BLE sniffers in public areas can harvest contact hashes to de-anonymize commuters.",
      "Advanced Data Protection (ADP) is essential: Default iCloud backup leaves message keys vulnerable to subpoena compliance.",
      "Background Telemetry: Apple devices ping analytics servers up to 600 times per hour even with analytics opt-outs checked."
    ],
    "limitations": "Tests conducted on consumer production firmware; internal diagnostic modes not evaluated.",
    "verdict": "Apple provides robust consumer security, but privacy requires manual user intervention: users must enable Advanced Data Protection and set AirDrop to 'Contacts Only' or 'Off'.",
    "devices": [],
    "sources": [
      "WDIII Security Lab Packet Captures",
      "Wireshark Trace Dumps",
      "Apple Security Whitepaper Verification"
    ],
    "tags": [
      "Apple Security",
      "AirDrop Vulnerability",
      "iCloud ADP",
      "Privacy Audit"
    ],
    "scope": "Cross-device ecosystem audit covering network, Bluetooth, and cloud layers",
    "search": "exp-9 apple ecosystem security audit airdrop privacy icloud",
    "toc": [
      {
        "id": "exp9-network",
        "label": "Network Telemetry"
      },
      {
        "id": "exp9-airdrop",
        "label": "AirDrop BLE Audit"
      },
      {
        "id": "exp9-cloud",
        "label": "iCloud ADP Analysis"
      },
      {
        "id": "exp9-recommendations",
        "label": "Security Hardening Guide"
      }
    ],
    "relatedExperiments": [
      {
        "id": "queued-exp8",
        "label": "🧪 Exp 8 — Ecosystem Reliability Protocol (In Progress)"
      },
      {
        "id": "fa02",
        "label": "🔄 FA-02 — One Month Out of Apple"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "telemetryHostsContacted",
        "label": "Telemetry Hosts Contacted",
        "type": "number",
        "unit": "Hosts",
        "required": true,
        "min": 0,
        "max": 500
      },
      {
        "key": "airDropHashLeak",
        "label": "AirDrop SHA256 Hash Leak Observed",
        "type": "boolean",
        "required": true
      },
      {
        "key": "cloudADPEncryptionCoverage",
        "label": "Advanced Data Protection Coverage",
        "type": "number",
        "unit": "%",
        "required": true,
        "min": 0,
        "max": 100
      },
      {
        "key": "gatekeeperBypassResistance",
        "label": "Gatekeeper Bypass Resistance",
        "type": "number",
        "unit": "Score",
        "required": false,
        "min": 1,
        "max": 10
      }
    ],
    "allowedMeasurementKeys": [
      "telemetryHostsContacted",
      "airDropHashLeak",
      "cloudADPEncryptionCoverage",
      "gatekeeperBypassResistance"
    ]
  },
  {
    "id": "queued-exp8",
    "experimentNumber": "8",
    "title": "Experiment 8: Cross-Platform Ecosystem Reliability & Hardware Longevity Protocol",
    "category": "ecosystem",
    "status": "progress",
    "statusLabel": "In Progress",
    "origin": "official_wdiii",
    "researchQuestion": "Over 24 months, how smoothly and reliably does each of three ecosystems (Apple, Google, Samsung) perform its cross-device features (clipboard sync, file transfer, phone-to-watch notifications and earbud audio switching), and how do battery health and physical condition of the 12 devices change over the same period?",
    "objective": "Track cross-device feature reliability and hardware longevity for three four-device ecosystems (phone, laptop, watch, earbuds each) over 24 months, using a fixed weekly, monthly and checkpoint protocol.",
    "methodology": "Stationary setup: all 12 devices are used under the same stationary conditions. The study measures whether each ecosystem performs its cross-device features smoothly, not raw performance. Weekly timed trials per ecosystem: clipboard phone to laptop (5 trials) and laptop to phone (5), a 50MB file transfer phone to laptop via AirDrop or Quick Share (3), phone-to-watch notification delivery (5) and automatic earbud audio switching from phone to laptop (3). Each trial is logged as success (1/0) and, when successful, seconds. Timing uses a stopwatch, so resolution is about ±1 s; the same method is kept for all 24 months. Monthly battery health, cycle count and issue logging per device; full checkpoints at months 6, 12, 18 and 24. Raw data lives in data/exp-08/*.csv (devices.csv, weekly.csv, health.csv, incidents.csv).",
    "conditions": "12 owned devices in a stationary setup, single owner, single location. 24-month observation window starting at day 0 (completed 2026-09-27). Each device is updated to the current stable OS and firmware at day 0, and OS and firmware versions are logged in every session. The same standard 50MB test file is used on every phone and laptop.",
    "protocol": "Protocol v1.0, approved 2026-09-27 (data/exp-08/README.md). DAY 0 (baseline, once, before any weekly data counts): for every device, record acquired_date and os_at_baseline in devices.csv, update to the current stable OS and firmware and note the versions, log a health.csv row with checkpoint m00, and take condition photos (front, back, edges, screen on white). For each ecosystem, unpair and re-pair every accessory from scratch and note friction, confirm clipboard sync, file sharing, phone-to-laptop notifications and audio auto-switch are on, place the standard 50MB test file on every phone and laptop, and run one full weekly session (week 0). WEEKLY (about 15 minutes per ecosystem): one weekly.csv row per trial for clipboard_p2l (5 trials), clipboard_l2p (5), file_transfer (3), notif_watch (5, with dismiss sync Y/N in notes) and audio_switch (3), recording phone OS, laptop OS and accessory firmware versions. MONTHLY (about 10 minutes): one health.csv row per device with battery health and cycle count where the OS exposes them (not_exposed otherwise, never estimated) and any issues noticed. CHECKPOINTS at months 6, 12, 18 and 24 (about 1 hour hands-on, plus several hours of battery rundowns running in the background): full battery rundown on each phone and laptop, condition photos in the day-0 views, unpair and re-pair every accessory, plus the monthly measurements and one weekly session. INCIDENTS (whenever they happen): one incidents.csv row per sync failure, dropout, crash or forced re-pair.",
    "measurements": null,
    "results": "Data collection is under way. Day 0 (device baseline) and the week-0 session were recorded on 2026-09-27; raw data is in data/exp-08/*.csv. No analysis yet.",
    "observations": [],
    "limitations": "The laptops are in different hardware tiers (MacBook Pro M2 Pro, Galaxy Chromebook Plus, Galaxy Book4 Edge); this is a disclosure only, since the study measures ecosystem smoothness, not power. The Google-ecosystem laptop is Samsung hardware running ChromeOS. Battery health and cycle count are not exposed on some watches and earbuds; those values are recorded as not_exposed rather than estimated. OS and firmware updates over 24 months are a confound; versions are logged in every session so update effects can be traced. Single owner, single location. Stopwatch timing limits resolution to about ±1 s.",
    "verdict": "TBD — requires analysis of the 24-month data; collection started 2026-09-27.",
    "devices": [
      "apple-iphone-16e",
      "apple-macbook-pro-m2-pro",
      "apple-watch-se-3",
      "apple-airpods-5",
      "google-pixel-10-pro",
      "samsung-galaxy-chromebook-plus-15",
      "google-pixel-watch-4",
      "google-pixel-buds-pro-2",
      "samsung-galaxy-s26-ultra",
      "samsung-galaxy-book4-edge-15",
      "samsung-galaxy-watch8",
      "samsung-galaxy-buds4-pro"
    ],
    "sources": [
      "data/exp-08/README.md (protocol v1.0, day-0 checklist)",
      "data/exp-08/devices.csv (device list)",
      "data/exp-08/weekly.csv, health.csv, incidents.csv (raw data log, empty until day 0)"
    ],
    "tags": [
      "Ecosystem Reliability",
      "Hardware Longevity",
      "Cross-Device Features",
      "Active Study"
    ],
    "scope": "24-month study of 12 owned devices (phone, laptop, watch and earbuds for Apple, Google and Samsung) in a stationary setup",
    "search": "exp-8 in-progress active cross-platform ecosystem reliability hardware longevity apple google samsung clipboard file transfer airdrop quick share notifications watch earbuds audio switch battery health",
    "toc": [
      {
        "id": "q8-setup",
        "label": "Devices & Setup"
      },
      {
        "id": "q8-protocol",
        "label": "Protocol Cadence"
      },
      {
        "id": "q8-limitations",
        "label": "Limitations"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp9",
        "label": "🔒 Experiment 9 — Apple Ecosystem Security Audit"
      },
      {
        "id": "fa02",
        "label": "🔄 FA-02 — One Month Out of Apple"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-27T00:00:00.000Z",
    "protocolVersion": "1.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "clipboardP2lSeconds",
        "label": "Clipboard Phone → Laptop",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0
      },
      {
        "key": "clipboardL2pSeconds",
        "label": "Clipboard Laptop → Phone",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0
      },
      {
        "key": "fileTransferSeconds",
        "label": "50MB File Transfer Phone → Laptop",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0
      },
      {
        "key": "notifWatchSeconds",
        "label": "Phone → Watch Notification Delivery",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0
      },
      {
        "key": "audioSwitchSeconds",
        "label": "Earbud Audio Auto-Switch Phone → Laptop",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0
      },
      {
        "key": "batteryHealthPct",
        "label": "Battery Health (where exposed)",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "cycleCount",
        "label": "Battery Cycle Count (where exposed)",
        "type": "number",
        "unit": "Cycles",
        "required": false,
        "min": 0
      }
    ],
    "allowedMeasurementKeys": [
      "clipboardP2lSeconds",
      "clipboardL2pSeconds",
      "fileTransferSeconds",
      "notifWatchSeconds",
      "audioSwitchSeconds",
      "batteryHealthPct",
      "cycleCount"
    ]
  },
  {
    "id": "queued-exp10",
    "experimentNumber": "10",
    "title": "Paused Experiment 10: Year-Long iOS 26 vs iOS 27 Survey on iPhone 16e",
    "category": "software",
    "status": "paused",
    "statusLabel": "Paused",
    "origin": "official_wdiii",
    "researchQuestion": "On the same iPhone 16e, how do standby battery drain, built-in app launch times and stability on iOS 27 compare with the same phone on iOS 26, and how do they change across iOS 27 point updates over a year?",
    "objective": "Compare one iPhone 16e before (phase A, iOS 26) and after (phase B, iOS 27) the major update, and track phase B for a year with a fixed weekly and monthly routine.",
    "methodology": "Single-device before/after design. Phase A was collected on iOS 26; the phone is now on iOS 27, and phase B continues from a resume-day baseline. Weekly: overnight standby drain (start %, end %, hours) under fixed conditions, a count of new crash logs from Settings → Privacy & Security → Analytics & Improvements → Analytics Data, and cold-launch times for five built-in apps (Settings, Camera, Safari, Messages, Maps; 3 stopwatch trials each, about ±0.3 s resolution). Monthly: battery maximum capacity, cycle count, free storage and optional Geekbench 6 scores. Every iOS update and every noticed crash, hang or broken feature is logged when it happens. Raw data lives in data/exp-10/*.csv (updates.csv, weekly.csv, launches.csv, monthly.csv, incidents.csv).",
    "conditions": "One owned iPhone 16e, single owner. Phase A on iOS 26 (dates TBD). Phase B on iOS 27 from resume day, which has not happened yet. The overnight standby conditions are fixed on resume day and kept for the rest of the study (TBD — to be written in data/exp-10/README.md). The same phone is used for Experiment 12, which keeps a separate log.",
    "protocol": "Protocol v1.0 (data/exp-10/README.md). RESUME DAY (phase B baseline, once): add the iOS 26 → 27 update to updates.csv, record the current version and build, log a monthly.csv row, write down the standby conditions, and run one full weekly session (phase B week 0). WEEKLY (about 10 minutes): one weekly.csv row with overnight standby start %, end % and hours, plus the number of new Analytics Data crash logs since the last session; 15 launches.csv rows (Settings, Camera, Safari, Messages and Maps, 3 trials each: close the app, wait 5 seconds, time from tap until usable). MONTHLY (about 15 minutes): one monthly.csv row with maximum capacity, cycle count, free storage, and optional Geekbench 6 single- and multi-core scores. WHENEVER THEY HAPPEN: one updates.csv row per iOS update with its build number; one incidents.csv row per crash, hang, bug or app compatibility problem.",
    "measurements": null,
    "results": "Phase A (iOS 26) data was collected before the experiment was paused, but it has not been added to the data log yet. No phase B (iOS 27) data has been collected. No comparison has been made.",
    "observations": [],
    "limitations": "One device, so results describe this iPhone 16e only. Phases A and B cannot run side by side: Apple stops signing older iOS versions shortly after a major release, so phase A cannot be repeated. The battery ages between phases, so battery and speed differences mix the OS change with wear; maximum capacity and cycle count are logged alongside so wear can be shown but not removed. Phase A methods may not match the phase B protocol exactly (TBD — depends on what was recorded in phase A). Stopwatch launch timing (about ±0.3 s) can only catch large slowdowns. Crash log counts depend on iPhone Analytics sharing being on. The phone is also used for Experiment 12, which can affect battery readings; such sessions are noted in the log.",
    "verdict": "TBD — requires phase A data in the log and phase B data; no comparison has been made.",
    "devices": [
      "apple-iphone-16e"
    ],
    "sources": [
      "data/exp-10/README.md (protocol v1.0, resume-day checklist)",
      "data/exp-10/updates.csv, weekly.csv, launches.csv, monthly.csv, incidents.csv (raw data log; phase A not yet added, phase B not started)"
    ],
    "tags": [
      "iOS Longitudinal",
      "Software Performance",
      "Battery",
      "Paused Study"
    ],
    "scope": "Year-long before/after survey of one iPhone 16e: iOS 26 (phase A) vs iOS 27 (phase B)",
    "search": "exp-10 paused year-long ios 26 ios 27 survey iphone 16e standby battery drain app launch crash logs before after",
    "toc": [
      {
        "id": "q10-design",
        "label": "Before/After Design"
      },
      {
        "id": "q10-protocol",
        "label": "Protocol Cadence"
      },
      {
        "id": "q10-limitations",
        "label": "Limitations"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp4",
        "label": "📈 Experiment 4 — Historical iOS Performance"
      },
      {
        "id": "exp12",
        "label": "📱 Experiment 12 — iOS 27 Performance & AI Chatbot Integration on iPhone 16e"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-27T00:00:00.000Z",
    "protocolVersion": "1.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "standbyDrainPctPerHour",
        "label": "Overnight Standby Drain",
        "type": "number",
        "unit": "%/hour",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "appLaunchSeconds",
        "label": "Built-in App Launch Time (mean of 15 trials)",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 60
      },
      {
        "key": "newCrashLogsPerWeek",
        "label": "New Crash Logs (Analytics Data)",
        "type": "number",
        "unit": "Logs/Wk",
        "required": false,
        "min": 0
      },
      {
        "key": "maxCapacityPct",
        "label": "Battery Maximum Capacity",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "cycleCount",
        "label": "Battery Cycle Count",
        "type": "number",
        "unit": "Cycles",
        "required": false,
        "min": 0
      },
      {
        "key": "geekbenchSingle",
        "label": "Geekbench 6 Single-Core (optional)",
        "type": "number",
        "unit": "Points",
        "required": false,
        "min": 0
      },
      {
        "key": "geekbenchMulti",
        "label": "Geekbench 6 Multi-Core (optional)",
        "type": "number",
        "unit": "Points",
        "required": false,
        "min": 0
      }
    ],
    "allowedMeasurementKeys": [
      "standbyDrainPctPerHour",
      "appLaunchSeconds",
      "newCrashLogsPerWeek",
      "maxCapacityPct",
      "cycleCount",
      "geekbenchSingle",
      "geekbenchMulti"
    ]
  },
  {
    "id": "fa01",
    "experimentNumber": "FA-01",
    "title": "FA-01 — Which AI Builds Our Website Best?",
    "category": "ai",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "Given the same bare prompt and no guidance, which AI assistant builds the best consumer tech documentation website?",
    "objective": "Compare five AI assistants on a single cold prompt to build a consumer tech documentation site, judged on design execution, code quality, structure and functionality.",
    "methodology": "DeepSeek, Gemini, Grok, ChatGPT and Claude each received the same blind prompt: \"Build me a consumer tech documentation website in HTML to showcase real-world experiments comparing smartphones, repair services, and software.\" No examples, no reference to this site, no follow-up guidance. The site owner ranked the outputs; Claude produced a separate independent assessment before seeing the owner's rankings.",
    "conditions": "One cold prompt per model, no iteration. Each model invented its own placeholder content.",
    "protocol": "1. Give each model the identical prompt. 2. Save the raw HTML output. 3. Owner scores design, code quality, structure and functionality. 4. Claude assesses independently. 5. Compare the two rankings.",
    "measurements": {
      "Owner ranking": {
        "Grok": "9.0 / 10",
        "ChatGPT": "7.0 / 10",
        "DeepSeek": "7.0 / 10",
        "Gemini": "6.5 / 10",
        "Claude": "4.5 / 10"
      },
      "Claude's independent ranking": {
        "1st": "Claude",
        "2nd": "Gemini",
        "3rd": "DeepSeek",
        "4th": "Grok",
        "5th": "ChatGPT"
      }
    },
    "results": "Owner ranking: Grok 9.0, ChatGPT 7.0, DeepSeek 7.0, Gemini 6.5, Claude 4.5. Grok was the only entry that built real site architecture (working SPA routing, persisted theme, detail pages). Claude's independent assessment ranked itself first and ChatGPT last; the two rankings disagree most on Grok and Claude.",
    "observations": [
      "Architecture beat aesthetics: working routing and structure separated the top entry, not colour or typography.",
      "The owner prioritised working functionality; Claude prioritised design systems and self-contained code.",
      "The owner's assessment has no conflict of interest; Claude's does, and both are shown for transparency."
    ],
    "limitations": "n=1 per model, single cold prompt, subjective scoring. An anecdotal comparison, not a statistical sample.",
    "verdict": "Owner's winner: Grok (9.0/10). Claude placed last in the owner's ranking (4.5/10).",
    "devices": [],
    "sources": [
      "Owner assessment",
      "Claude's independent assessment",
      "Raw model outputs (archived)"
    ],
    "tags": [
      "5 Models Tested",
      "Cold Prompt Only"
    ],
    "scope": "n=1 per model — anecdotal comparison, not a statistical sample",
    "search": "fa-01 which ai builds our website best ai comparison deepseek gemini grok chatgpt claude",
    "toc": [
      {
        "id": "fa01-setup",
        "label": "Experiment Setup"
      },
      {
        "id": "fa01-owner-rankings",
        "label": "Owner Rankings"
      },
      {
        "id": "fa01-claude-assessment",
        "label": "Claude's Assessment"
      },
      {
        "id": "fa01-divergence",
        "label": "Where They Diverge"
      },
      {
        "id": "fa01-findings",
        "label": "Key Findings"
      }
    ],
    "relatedExperiments": [],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "ownerScore",
        "label": "Owner score",
        "type": "number",
        "unit": "/ 10",
        "required": true,
        "min": 0,
        "max": 10
      }
    ],
    "allowedMeasurementKeys": [
      "ownerScore"
    ]
  },
  {
    "id": "fa02",
    "experimentNumber": "FA-02",
    "title": "FA-02 — One Month Out of the Apple Ecosystem",
    "category": "ecosystem",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "What happens when an Apple user moves phone, desktop, cloud, accessories and account authentication off Apple for 30 days?",
    "objective": "Log the real friction of a complete 30-day exit from the Apple ecosystem to a Pixel 10 Pro and a Windows laptop.",
    "methodology": "Personal 30-day friction log. Primary phone: Pixel 10 Pro. Desktop: HP Victus 15-fa2013dx (Windows). Watch: Pixel Watch. Earphones: Sony WF (Google's buds were tried and found okay). Baseline before the switch: iPhone 16e and an older MacBook Air.",
    "conditions": "30 consecutive days, everyday personal use, single user.",
    "protocol": "Week 1 setup and migration; weeks 2–3 daily use with friction logged as it happened; week 4 return to Apple and reflection.",
    "measurements": {
      "Duration": "30 days",
      "Accounts migrated": 14,
      "First Windows login": "about 30 minutes"
    },
    "results": "Every task needed a workaround, a subscription or a compromise that iOS and macOS handled transparently. Account migration lost older account history. Windows setup took about 30 minutes just to log in, and pairing the Pixel with Windows repeatedly failed. Pixel Watch health metrics were far off compared with Apple Watch. Two-factor authentication tied to the iPhone made a full exit impractical. Returning to iPhone and Mac was far easier than leaving.",
    "observations": [
      "Apple's lock-in is real, but it comes from design coherence rather than malice.",
      "The Pixel 10 Pro is a genuinely good phone; the rest of the non-Apple setup is where the friction was.",
      "Windows was the true deal-breaker: bloat, subscription gates and manual workarounds.",
      "Pixel has about 3 notable accessory brands versus about 100 for iPhone."
    ],
    "limitations": "n=1 personal experience over 30 days; not a controlled study.",
    "verdict": "The Pixel 10 Pro stays in daily rotation. Everything else was tolerable but constantly annoying. Never doing a full ecosystem exit again.",
    "devices": [
      "google-pixel-10-pro",
      "hp-victus-15-fa2013dx",
      "apple-iphone-16e"
    ],
    "sources": [
      "Owner's 30-day friction log"
    ],
    "tags": [
      "30 Days",
      "Friction Log",
      "Ecosystem Lock-In Study"
    ],
    "scope": "n=1 — personal experience, not a controlled study",
    "search": "fa-02 one month out of the apple ecosystem friction log pixel 10 pro windows hp victus lock-in",
    "toc": [
      {
        "id": "fa02-setup",
        "label": "Setup & Baseline"
      },
      {
        "id": "fa02-timeline",
        "label": "30-Day Journey"
      },
      {
        "id": "fa02-friction",
        "label": "Friction Log"
      },
      {
        "id": "fa02-implications",
        "label": "Ecosystem Lock-In"
      },
      {
        "id": "fa02-verdict",
        "label": "Final Verdict"
      }
    ],
    "relatedExperiments": [
      "queued-exp8"
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "durationDays",
        "label": "Duration",
        "type": "number",
        "unit": "days",
        "required": true,
        "min": 1,
        "max": 365
      },
      {
        "key": "accountsMigrated",
        "label": "Accounts migrated",
        "type": "number",
        "required": false,
        "min": 0,
        "max": 500
      },
      {
        "key": "firstWindowsLoginMinutes",
        "label": "First Windows login",
        "type": "number",
        "unit": "minutes",
        "required": false,
        "min": 0,
        "max": 600
      }
    ],
    "allowedMeasurementKeys": [
      "durationDays",
      "accountsMigrated",
      "firstWindowsLoginMinutes"
    ]
  },
  {
    "id": "fa03",
    "experimentNumber": "FA-03",
    "title": "FA-03 — Two Months, Two Laptops: MacBook Pro 16\" (M2 Pro) vs. Acer Aspire 14 AI",
    "category": "hardware",
    "status": "done",
    "statusLabel": "Done",
    "origin": "official_wdiii",
    "researchQuestion": "In everyday use, how does a MacBook Pro 16\" (M2 Pro) compare with an Acer Aspire 14 AI (Core Ultra 7 256V)?",
    "objective": "Record personal impressions from about two months of alternating daily use of both laptops for the same work.",
    "methodology": "Alternated daily for about two months: one day on the MacBook Pro 16\", the next on the Acer Aspire 14 AI. Workloads on both: Canvas, streaming, CSS/web work and Adobe apps. The Aspire was also used a lot for gaming. Impressions only; nothing was benchmarked or measured.",
    "conditions": "Single owner, everyday workloads, about two months.",
    "protocol": "Alternate laptops day by day with the same kinds of work, then compare impressions.",
    "measurements": null,
    "results": "Browsing felt about equal on both. For productive work the MacBook Pro worked very well and looked and felt smoother, with noticeably better build quality. The Aspire handled the same work, but not as fast or as smoothly, and was a strong gaming machine.",
    "observations": [
      "For someone already in Apple's ecosystem, the MacBook Pro works seamlessly with everything else.",
      "The Aspire's gaming ability plus its capable (if slower) productivity makes it a good laptop in its own right."
    ],
    "limitations": "n=1 personal impressions over about two months. No benchmarks, battery, thermal or repair measurements were taken.",
    "verdict": "MacBook Pro 16\": the smoother, better-built productivity machine for an Apple ecosystem user. Acer Aspire 14 AI: a good all-rounder that adds gaming.",
    "devices": [
      "apple-macbook-pro-16-m2-pro-16gb",
      "acer-aspire-14-ai-ultra7-256v"
    ],
    "sources": [
      "Owner's firsthand daily use"
    ],
    "tags": [
      "~2 Months",
      "Alternating Daily Use",
      "Personal Impressions"
    ],
    "scope": "n=1 — personal impressions from daily use, no benchmarks",
    "search": "fa-03 two laptops macbook pro 16 m2 pro acer aspire 14 ai core ultra 7 256v arc 140v daily use productivity gaming ecosystem",
    "toc": [
      {
        "id": "fa03-setup",
        "label": "Setup"
      },
      {
        "id": "fa03-impressions",
        "label": "Impressions"
      },
      {
        "id": "fa03-verdict",
        "label": "Verdict"
      }
    ],
    "relatedExperiments": [
      "fa02",
      "queued-exp8"
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "usageWeeks",
        "label": "Alternating use period",
        "type": "number",
        "unit": "weeks",
        "required": true,
        "min": 1,
        "max": 104
      }
    ],
    "allowedMeasurementKeys": [
      "usageWeeks"
    ]
  },
  {
    "id": "exp12",
    "experimentNumber": "12",
    "title": "Experiment 12: iOS 27 Performance & AI Chatbot Integration on iPhone 16e",
    "category": "software",
    "status": "progress",
    "statusLabel": "In Progress",
    "origin": "official_wdiii",
    "researchQuestion": "Does iOS 27 deliver Apple's claimed improvements — including \"up to 60%\" better app responsiveness — on iPhone 16e, and how do Gemini, Claude and ChatGPT compare through Siri once third-party support ships?",
    "objective": "Test Apple's iOS 27 claims on one iPhone 16e with stopwatch launch timing, overnight standby drain and crash counts; later, compare Gemini, Claude and ChatGPT through Siri with identical prompts.",
    "methodology": "Single iPhone 16e (iPhone17,5) on iOS 27.0, with later iOS 27 updates tracked as released. Cold and warm app launch times timed with a stopwatch. Battery: overnight standby drain (start %, end %, hours). Stability: count of new crash logs in Analytics Data. Battery and stability use the same methods as Experiment 10, in a separate log. AI chatbot comparison (identical prompts; latency, handoff reliability, multi-turn context) starts once third-party Siri support ships.",
    "conditions": "One owned iPhone 16e, temperature-controlled room (about 21°C). The same phone is used for Experiment 10.",
    "protocol": "A. Launch timing, standby drain and crash counts on iOS 27.0 and later updates. B. AI chatbots via Siri: not started, waiting for third-party support. C. Headline feature verification: TBD.",
    "measurements": null,
    "results": "Testing is underway on iOS 27.0; no results yet. The AI chatbot tests have not started.",
    "observations": [],
    "limitations": "One device (n=1). Stopwatch timing can only catch large differences. The AI chatbot part depends on when third-party Siri support ships. The same phone is shared with Experiment 10.",
    "verdict": "TBD — no results yet.",
    "devices": [
      "apple-iphone-16e"
    ],
    "sources": [
      "Owner's own testing"
    ],
    "tags": [
      "iOS 27",
      "iPhone 16e",
      "Siri AI",
      "Gemini",
      "Claude",
      "ChatGPT"
    ],
    "scope": "Single-device testing on iPhone 16e (n=1)",
    "search": "exp-12 experiment 12 ios 27 performance siri ai chatbot integration iphone 16e gemini claude chatgpt responsiveness battery",
    "toc": [
      {
        "id": "exp12-objective",
        "label": "Research Objective"
      },
      {
        "id": "exp12-scope",
        "label": "Scope & Methodology"
      },
      {
        "id": "exp12-procedures",
        "label": "Test Procedures"
      },
      {
        "id": "exp12-chatbot",
        "label": "AI Chatbot Integration"
      },
      {
        "id": "exp12-limitations",
        "label": "Limitations"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp4",
        "label": "📈 Experiment 4 — Historical iOS Performance"
      },
      {
        "id": "queued-exp10",
        "label": "⏸️ Paused Exp 10 — Year-Long iOS 26 vs iOS 27 Survey"
      },
      {
        "id": "fa01",
        "label": "🤖 FA-01 — Which AI Builds Our Website Best?"
      }
    ],
    "createdAt": "2026-09-25T00:00:00.000Z",
    "updatedAt": "2026-09-28T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "2.0.0",
    "measurementSchema": [
      {
        "key": "coldLaunchSeconds",
        "label": "Cold launch time",
        "type": "number",
        "unit": "seconds",
        "required": false,
        "min": 0,
        "max": 60
      },
      {
        "key": "warmLaunchSeconds",
        "label": "Warm launch time",
        "type": "number",
        "unit": "seconds",
        "required": false,
        "min": 0,
        "max": 60
      },
      {
        "key": "standbyDrainPercent",
        "label": "Overnight standby drain",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "newCrashLogs",
        "label": "New crash logs",
        "type": "number",
        "required": false,
        "min": 0,
        "max": 1000
      }
    ],
    "allowedMeasurementKeys": [
      "coldLaunchSeconds",
      "warmLaunchSeconds",
      "standbyDrainPercent",
      "newCrashLogs"
    ]
  }
];
