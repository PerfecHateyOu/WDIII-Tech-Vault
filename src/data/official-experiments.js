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
    "researchQuestion": "How resilient is the Apple consumer ecosystem to account takeover, device tracking and exposure, and local proximity wireless attacks?",
    "objective": "Audit the Apple consumer ecosystem across 13 threat scenarios in three phases: authentication and recovery (5), location and tracking (4), and local wireless (4).",
    "methodology": "Hands-on testing on physical Apple hardware, with monitor-mode Wi-Fi capture stations (AWDL frames over 5 GHz channels 44 and 149), Nordic nRF52840 BLE packet sniffers and a dedicated RF Faraday chamber (over 80 dB). Radio tests were repeated 6 times.",
    "conditions": "34 calendar days (2026-08-07 to 2026-09-09), about 50 active testing hours. Devices: iPhone 16e, iPhone 13 and a MacBook Air host. OS versions: TBD.",
    "protocol": "Phase 1, authentication and recovery (5 scenarios): standard trusted-device recovery, single-contact recovery, orphaned-account recovery, Face ID lockout, Stolen Device Protection. Phase 2, Find My and tracking (4): BLE key rotation, unknown-AirTag alert, remote Lost Mode, Faraday enclosure. Phase 3, AirDrop and local wireless (4): AirDrop hash reversal, mDNS/Bonjour enumeration, BLE Continuity leakage, AWDL AP-isolation bypass.",
    "measurements": {
      "recoveryTimeSeconds": "94 s (1 min 34 sec), standard trusted-device recovery",
      "sdpDelayMinutes": "60 min (exactly)",
      "bleKeyRotationSeconds": "920 s (15 min 20 s)",
      "findMyLatencySeconds": "1125 s (18 min 45 s)",
      "airTagAlertMinutes": "252 min (4 h 12 min)",
      "lostModeSeconds": "1.4 s once the device regained connectivity",
      "airDropPhoneHashSeconds": "1.8 s (rainbow table)",
      "airDropEmailHashSeconds": "12.4 s (dictionary)",
      "awdlBypassMbps": "248.5 Mbps while the infrastructure path showed 0 Kbps"
    },
    "results": "All 13 scenarios were completed and passed. Account recovery, Stolen Device Protection, Face ID lockout and Find My key rotation held up. Local wireless exposed more: AirDrop broadcast truncated SHA-256 hashes of the phone number and email address (reversed in 1.8 s and 12.4 s), BLE Continuity leaked lock state, clipboard sync flags and battery status, and AWDL bypassed access-point client isolation at 248.5 Mbps.",
    "observations": [
      "Account recovery: trusted-device recovery took 1 min 34 sec with zero credential exposure; orphaned-account recovery entered an automated 24-72 hour evaluation delay.",
      "Stolen Device Protection enforced a 60-minute delay away from familiar locations.",
      "AirDrop in Contacts Only mode still broadcast truncated SHA-256 hashes of the phone number and email address in AWDL probe frames.",
      "AWDL bypassed AP client isolation at 248.5 Mbps while the infrastructure path showed 0 Kbps."
    ],
    "limitations": "OS versions are TBD. Radio tests were repeated 6 times. The packet dump shown on the page is a real capture with the phone number and email address replaced by example values. The raw captures and logs are not published.",
    "verdict": "Apple's cryptographic core held up in this audit; the exposure is in local wireless features (AirDrop, AWDL, BLE Continuity), which trade isolation for convenience. Setting AirDrop to Receiving Off when not in use and enabling Stolen Device Protection reduce it.",
    "devices": [
      "apple-iphone-16e",
      "apple-iphone-13"
    ],
    "sources": [
      "Direct hands-on testing (2026-08-07 to 2026-09-09)"
    ],
    "tags": [
      "Apple Security",
      "AirDrop",
      "Find My",
      "Account Recovery"
    ],
    "scope": "Hands-on audit of the Apple consumer ecosystem: 13 scenarios across authentication and recovery, Find My and tracking, and local wireless",
    "search": "exp-9 apple ecosystem security audit account recovery stolen device protection find my airdrop hash awdl ap isolation",
    "toc": [
      {
        "id": "exp9-scenarios",
        "label": "13-Scenario Matrix"
      },
      {
        "id": "exp9-phase1",
        "label": "Authentication & Recovery"
      },
      {
        "id": "exp9-phase2",
        "label": "Find My & Tracking"
      },
      {
        "id": "exp9-phase3",
        "label": "AirDrop & Local Wireless"
      },
      {
        "id": "exp9-recommendations",
        "label": "Mitigations"
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
    "updatedAt": "2026-09-30T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "recoveryTimeSeconds",
        "label": "Trusted-device recovery time",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 86400
      },
      {
        "key": "sdpDelayMinutes",
        "label": "Stolen Device Protection delay",
        "type": "number",
        "unit": "Minutes",
        "required": false,
        "min": 0,
        "max": 1440
      },
      {
        "key": "bleKeyRotationSeconds",
        "label": "BLE public key rotation interval",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 86400
      },
      {
        "key": "findMyLatencySeconds",
        "label": "Find My mesh latency",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 86400
      },
      {
        "key": "airTagAlertMinutes",
        "label": "Unknown-AirTag alert time",
        "type": "number",
        "unit": "Minutes",
        "required": false,
        "min": 0,
        "max": 1440
      },
      {
        "key": "lostModeSeconds",
        "label": "Remote Lost Mode execution time",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 3600
      },
      {
        "key": "airDropPhoneHashSeconds",
        "label": "AirDrop phone hash reversal time",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 3600
      },
      {
        "key": "airDropEmailHashSeconds",
        "label": "AirDrop email hash reversal time",
        "type": "number",
        "unit": "Seconds",
        "required": false,
        "min": 0,
        "max": 3600
      },
      {
        "key": "awdlBypassMbps",
        "label": "AWDL AP-isolation bypass throughput",
        "type": "number",
        "unit": "Mbps",
        "required": false,
        "min": 0,
        "max": 10000
      }
    ],
    "allowedMeasurementKeys": [
      "recoveryTimeSeconds",
      "sdpDelayMinutes",
      "bleKeyRotationSeconds",
      "findMyLatencySeconds",
      "airTagAlertMinutes",
      "lostModeSeconds",
      "airDropPhoneHashSeconds",
      "airDropEmailHashSeconds",
      "awdlBypassMbps"
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
    "methodology": "Round 2 (September 28, 2026): Gemini 3.1 Pro, DeepSeek V4, Claude Opus 5.5, Grok 4.6 and Luna 5.6 (ChatGPT) each received the identical prompt in a fresh chat with memory off, with no follow-ups; outputs were saved unedited, shuffled into files A–E and scored blind by the owner and by Claude in a separate fresh chat, with the key sealed until both assessments were recorded. Round 1: DeepSeek, Gemini, Grok, ChatGPT and Claude each received the same blind prompt: \"Build me a consumer tech documentation website in HTML to showcase real-world experiments comparing smartphones, repair services, and software.\" No examples, no reference to this site, no follow-up guidance. The site owner ranked the outputs; Claude produced a separate independent assessment before seeing the owner's rankings.",
    "conditions": "One cold prompt per model, no iteration. Each model invented its own placeholder content.",
    "protocol": "1. Give each model the identical prompt. 2. Save the raw HTML output. 3. Owner scores design, code quality, structure and functionality. 4. Claude assesses independently. 5. Compare the two rankings.",
    "measurements": {
      "Round 2 owner (overall)": {
        "Grok 4.6": "9.0 / 10",
        "Claude Opus 5.5": "8.5 / 10",
        "Luna 5.6": "7.5 / 10",
        "Gemini 3.1 Pro": "7.0 / 10",
        "DeepSeek V4": "6.5 / 10"
      },
      "Round 2 Claude, blind (overall)": {
        "Grok 4.6": "8.5 / 10",
        "Claude Opus 5.5": "8 / 10",
        "Luna 5.6": "6.5 / 10",
        "Gemini 3.1 Pro": "5.5 / 10",
        "DeepSeek V4": "5 / 10"
      },
      "Round 1 owner ranking": {
        "Grok": "9.0 / 10",
        "ChatGPT": "7.0 / 10",
        "DeepSeek": "7.0 / 10",
        "Gemini": "6.5 / 10",
        "Claude": "4.5 / 10"
      },
      "Round 1 claude's independent ranking": {
        "1st": "Claude",
        "2nd": "Gemini",
        "3rd": "DeepSeek",
        "4th": "Grok",
        "5th": "ChatGPT"
      }
    },
    "results": "Round 2 (September 28, 2026, scored blind; owner / Claude): Grok 4.6 9.0 / 8.5, Claude Opus 5.5 8.5 / 8.0, Luna 5.6 7.5 / 6.5, Gemini 3.1 Pro 7.0 / 5.5, DeepSeek V4 6.5 / 5.0 — the same order in both assessments. Round 1: Owner ranking: Grok 9.0, ChatGPT 7.0, DeepSeek 7.0, Gemini 6.5, Claude 4.5. Grok was the only entry that built real site architecture (working SPA view routing, category filters and per-experiment detail views). Claude's independent assessment ranked itself first and ChatGPT last; the two rankings disagree most on Grok and Claude. Round 1's attribution for Claude, DeepSeek and ChatGPT can't be verified from the surviving files.",
    "observations": [
      "Round 2: both assessments ranked the five models in the same order.",
      "Round 2: Claude's blind assessment placed its own model second, behind Grok.",
      "Round 2: only Luna 5.6 labelled its invented numbers as illustrative.",
      "Architecture beat aesthetics: working routing and structure separated the top entry, not colour or typography.",
      "The owner prioritised working functionality; Claude prioritised design systems and self-contained code.",
      "The owner's assessment has no conflict of interest; Claude's does, and both are shown for transparency."
    ],
    "limitations": "One run per model per round, subjective scoring. The Claude assessor shares a model family with one contestant and may recognise its style even blind. Round 1's records are incomplete (see the Round 1 note).",
    "verdict": "Round 2: Grok 4.6 won (owner 9.0, Claude 8.5); Claude Opus 5.5 second. Both assessments ranked all five in the same order.",
    "devices": [],
    "sources": [
      "Owner assessment (Round 1 and Round 2)",
      "Claude's assessments (Round 1 independent; Round 2 blind)",
      "Raw model outputs (Round 2 all five; Round 1 Gemini and Grok)"
    ],
    "tags": [
      "5 Models, 2 Rounds",
      "Cold Prompt Only",
      "Blind Scoring in Round 2"
    ],
    "scope": "📋 n=1 per model — anecdotal comparison, not a statistical sample",
    "search": "fa-01 which ai builds our website best ai comparison deepseek gemini grok chatgpt claude round 2 grok 4.6 claude opus 5.5 luna 5.6 gemini 3.1 pro deepseek v4 blind",
    "toc": [
      {
        "id": "fa01-r2-results",
        "label": "Round 2: Results"
      },
      {
        "id": "fa01-r2-owner",
        "label": "Round 2: Owner Rankings"
      },
      {
        "id": "fa01-r2-claude",
        "label": "Round 2: Claude (Blind)"
      },
      {
        "id": "fa01-r2-findings",
        "label": "Round 2: Key Findings"
      },
      {
        "id": "fa01-round-1",
        "label": "Round 1"
      },
      {
        "id": "fa01-setup",
        "label": "Round 1: Setup"
      },
      {
        "id": "fa01-owner-rankings",
        "label": "Round 1: Owner Rankings"
      },
      {
        "id": "fa01-claude-assessment",
        "label": "Round 1: Claude's Assessment"
      },
      {
        "id": "fa01-divergence",
        "label": "Round 1: Divergence"
      },
      {
        "id": "fa01-findings",
        "label": "Round 1: Key Findings"
      },
      {
        "id": "fa01-recommendation",
        "label": "Round 1: Recommendation"
      }
    ],
    "relatedExperiments": [],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-29T00:00:00.000Z",
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
    ],
    "sections": [
      {
        "type": "paragraph",
        "variant": "lead",
        "tight": true,
        "html": "Five AI assistants — DeepSeek, Gemini, Grok, ChatGPT, and Claude — were each given the same blind prompt: <em style=\"color:var(--td-text-primary);\">\"Build me a consumer tech documentation website in HTML to showcase real-world experiments comparing smartphones, repair services, and software.\"</em> No examples, no reference to this site, no guidance beyond the bare prompt. Rated on design execution, code quality, structure, and functionality. Inspired by ChatGPT's earlier attempt to rebuild this site and calling it \"Version 6.\""
      },
      {
        "type": "notice",
        "html": "⚠️ Disclaimer: each round has two assessments — one by the site owner, one by Claude. Claude's own model is one of the five contestants. Raw submissions are linked where the original file could be verified."
      },
      {
        "type": "heading",
        "id": "fa01-r2-results",
        "text": "Round 2: Results (September 28, 2026)"
      },
      {
        "type": "paragraph",
        "variant": "lead",
        "html": "Round 2 reran the test with the current version of each model: the same prompt, one reply each, every chat fresh with memory off. The five pages were shuffled at random into files A–E, and both assessments below were recorded before the key was opened."
      },
      {
        "type": "meta",
        "items": [
          {
            "label": "Date Run",
            "value": "September 28, 2026"
          },
          {
            "label": "Prompt",
            "value": "Identical to Round 1, word for word"
          },
          {
            "label": "Conditions",
            "value": "Fresh chat, memory off, no follow-ups"
          },
          {
            "label": "Scoring",
            "value": "Blind: files A–E, key sealed until both assessments were recorded"
          },
          {
            "label": "Assessors",
            "value": "Site owner, and Claude in a separate fresh chat that saw only files A–E"
          }
        ]
      },
      {
        "type": "table",
        "caption": "Round 2 — model versions and overall scores (out of 10)",
        "headers": [
          {
            "label": "Rank",
            "center": true
          },
          {
            "label": "Model"
          },
          {
            "label": "Version"
          },
          {
            "label": "Owner",
            "center": true
          },
          {
            "label": "Claude (blind)",
            "center": true
          }
        ],
        "rows": [
          [
            {
              "center": true,
              "text": "1"
            },
            {
              "primary": true,
              "text": "Grok"
            },
            {
              "text": "Grok 4.6"
            },
            {
              "center": true,
              "text": "9.0"
            },
            {
              "center": true,
              "text": "8.5"
            }
          ],
          [
            {
              "center": true,
              "text": "2"
            },
            {
              "primary": true,
              "text": "Claude"
            },
            {
              "text": "Claude Opus 5.5"
            },
            {
              "center": true,
              "text": "8.5"
            },
            {
              "center": true,
              "text": "8"
            }
          ],
          [
            {
              "center": true,
              "text": "3"
            },
            {
              "primary": true,
              "text": "ChatGPT"
            },
            {
              "text": "Luna 5.6"
            },
            {
              "center": true,
              "text": "7.5"
            },
            {
              "center": true,
              "text": "6.5"
            }
          ],
          [
            {
              "center": true,
              "text": "4"
            },
            {
              "primary": true,
              "text": "Gemini"
            },
            {
              "text": "Gemini 3.1 Pro"
            },
            {
              "center": true,
              "text": "7.0"
            },
            {
              "center": true,
              "text": "5.5"
            }
          ],
          [
            {
              "center": true,
              "text": "5"
            },
            {
              "primary": true,
              "text": "DeepSeek"
            },
            {
              "text": "DeepSeek V4"
            },
            {
              "center": true,
              "text": "6.5"
            },
            {
              "center": true,
              "text": "5"
            }
          ]
        ]
      },
      {
        "type": "keyFinding",
        "title": "Both Assessments Agree on the Order",
        "body": "The owner and Claude's blind assessment ranked the five identically: Grok 4.6, Claude Opus 5.5, Luna 5.6, Gemini 3.1 Pro, DeepSeek V4. Claude scored 0.5 to 1.5 points lower across the board, but not one position differs. In Round 1 the two assessments disagreed sharply."
      },
      {
        "type": "heading",
        "id": "fa01-r2-owner",
        "text": "Round 2: Owner Rankings"
      },
      {
        "type": "group",
        "layout": "stack",
        "children": [
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥇 Grok 4.6 — 9.0/10",
            "value": "9.0",
            "valueColor": "success",
            "body": "Design 9.0 · Code quality 9.0 · Structure &amp; functionality 9.5. Single-file lab volume: hash router (#/, #/notes, #/compare, #/methods, #/shelf), JSON payload of structured notes (question, setup, protocol, metrics, findings, caveats), metric-switchable bar charts and tables, desktop sticky nav + mobile menu, / search overlay, localStorage “shelf,” reading progress bar, skip link. Visual system (brass on ink, Newsreader + IBM Plex) matches the “lab notes” brief. Heaviest file, but the features named above are implemented in the script, not mocked. Most complete answer to “documentation website.”",
            "link": "/fa01/round-2/grok.html"
          },
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥈 Claude Opus 5.5 — 8.5/10",
            "value": "8.5",
            "valueColor": "success",
            "body": "Design 8.5 · Code quality 8.5 · Structure &amp; functionality 9.0. Data-driven log: seven experiments in a JS array, category tabs (aria-pressed), live search over titles/products, accordion bodies with method lists, caveats, sample size, and animated bar charts (best row highlighted). Featured hero panel, extra cost table on screen repair, light/dark toggle with localStorage plus prefers-color-scheme, focus rings and safe-area padding. Product names are fictional (Aster 9, Keyward), which matches the footer disclaimer. Closest thing here to a working experiment catalog short of a full router.",
            "link": "/fa01/round-2/claude.html"
          },
          {
            "type": "ranking",
            "tone": "info",
            "title": "🥉 Luna 5.6 — 7.5/10",
            "value": "7.5",
            "valueColor": "info",
            "body": "Design 8.0 · Code quality 8.0 · Structure &amp; functionality 6.5. Editorial cream/paper look with sticky header, large display headline, CSS-drawn phone, stat tiles, and a comparison table. Category pills actually hide/show cards via data-category and a .hidden class. Gaps: experiments are teasers only (links jump to #featured / #method, not individual reports); no search, theme, or result charts; method is three short cards. Cohesive demo site, thin as a documentation product.",
            "link": "/fa01/round-2/chatgpt.html"
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "4th — Gemini 3.1 Pro — 7.0/10",
            "value": "7.0",
            "valueColor": "warning",
            "body": "Design 7.5 · Code quality 6.5 · Structure &amp; functionality 7.5. Docs-app chrome: fixed header, Tailwind sidebar, hamburger + overlay, section switching (home / smartphones / repairs / software), CSS bar chart, OEM vs third-party pro/con cards. Search is visual only (Enter swaps the placeholder; ⌘K focuses the box). Relies on the Tailwind CDN; @apply in a page stylesheet is fragile; markup in the shootout table is messy (divide-y used as if it were a tag). Feels like a polished template more than a complete experiment archive.",
            "link": "/fa01/round-2/gemini.html"
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "5th — DeepSeek V4 — 6.5/10",
            "value": "6.5",
            "valueColor": "error",
            "body": "Design 7.0 · Code quality 7.5 · Structure &amp; functionality 5.5. Clear results dashboard: three sections, nine cards with labeled metrics, badges, footnotes, and a summary “key findings” block. Hover lift and a responsive auto-fit grid work; Font Awesome is the only extra. Zero JS: no filter, search, expand, or routing—just one long scroll. Strong as a static lab poster, weak as a website you can browse or query.",
            "link": "/fa01/round-2/deepseek.html"
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa01-r2-claude",
        "text": "Round 2: Claude's Blind Assessment"
      },
      {
        "type": "paragraph",
        "variant": "note",
        "html": "Run in a separate fresh Claude chat with memory off that saw only files A–E, before the key was opened. Claude's method statement: it read all five files in full and ran the scripts for A, B, D and E in a headless DOM (C has no JavaScript). Claude may still recognise its own model's style, even blind."
      },
      {
        "type": "group",
        "layout": "stack",
        "children": [
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥇 Grok 4.6 — 8.5/10",
            "value": "8.5",
            "valueColor": "success",
            "body": "Design 8.5 · Code 8 · Structure 9.5 · Function 9. This is the most complete site: a hash-routed app with index, notes, desk filters, compare, methods and a saved-notes \"Shelf\" page, all generated from a JSON payload. The ten notes are internally consistent; I checked every \"within 8%\" claim against its data. Every route works:<br>• a search dialog opens with the / key;<br>• a metric switcher recomputes each note's summary line;<br>• older/newer and related links, and a reading progress bar;<br>• all output is HTML-escaped.<br>It loses points because the bar scaling gives the worst \"lower is better\" result a zero-length bar. Saving to the shelf isn't protected if localStorage is unavailable. Most importantly, it attributes invented figures to real phones and apps, and its footer claims they were measured."
          },
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥈 Claude Opus 5.5 — 8/10",
            "value": "8",
            "valueColor": "success",
            "body": "Design 8.5 · Code 8.5 · Structure 8 · Function 8.5. It has the strongest visual identity among the light designs: Bricolage/Instrument type, a graph-paper background, and yellow highlights on the winning bar in each test. Dark mode follows the system setting, and a manual toggle is saved in localStorage. The content is driven by a data array, and all of it works:<br>• category tabs combine correctly with live search;<br>• the accordion entries carry aria-expanded;<br>• the animated bars respect reduced-motion settings;<br>• a featured panel links into the log.<br>The flaws are small: a non-standard open-state attribute, and the search term is written into the \"no results\" message unescaped. Its footer honestly marks the fictional products as sample data."
          },
          {
            "type": "ranking",
            "tone": "info",
            "title": "🥉 Luna 5.6 — 6.5/10",
            "value": "6.5",
            "valueColor": "info",
            "body": "Design 7.5 · Code 7.5 · Structure 6.5 · Function 5. It has a tidy editorial look (warm paper palette, a phone drawn in CSS, a 4-stat strip) and clean, small, semantic CSS. It honestly labels its figures as illustrative. Its only interactivity is a category filter, which works. The six experiment cards just jump to other sections rather than to any report. The nav is hidden below 850px with no menu to replace it, and the comparison table has no overflow wrapper for phones."
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "4th — Gemini 3.1 Pro — 5.5/10",
            "value": "5.5",
            "valueColor": "warning",
            "body": "Design 6 · Code 5 · Structure 7 · Function 5.5. The Tailwind docs layout is well planned: sidebar sections, breadcrumbs, a mobile drawer with overlay, and ⌘K to focus search. The execution has real bugs, though:<br>• All the .doc-content heading and paragraph styles use @apply inside a normal &lt;style&gt; tag, which the Tailwind CDN script doesn't process. After Tailwind's reset, the page h1s render at body size.<br>• The camera table wraps its rows in a made-up &lt;divide-y&gt; element instead of &lt;tbody&gt;.<br>• The search always replies \"No results found\", and the \"Download .ZIP\" button does nothing.<br>• The battery bars don't match their 0–16h axis (14h22m is drawn at 85%, not about 90%). The legend's three swatches are all the same grey.<br>"
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "5th — DeepSeek V4 — 5/10",
            "value": "5",
            "valueColor": "error",
            "body": "Design 6.5 · Code 5.5 · Structure 5 · Function 3. It's a clean, consistent card grid with Font Awesome icons and a summary box. It's a single static page with no JavaScript, no navigation, and no &lt;main&gt;, &lt;nav&gt; or &lt;h2&gt; section structure (the section titles are divs). It pins a pre-release Font Awesome (6.0.0-beta3), and I couldn't confirm that some of its newer icon names load from that version. It also presents invented results for named real products and shops (e.g. uBreakiFix at $199) as tested, with no disclaimer. Its repair card says the local shop used a genuine part, yet shows an \"OEM warning\" badge."
          }
        ]
      },
      {
        "type": "paragraph",
        "variant": "small",
        "html": "Checked before publishing: every concrete feature claim in both Round 2 assessments was tested against the submitted code. None was disproven."
      },
      {
        "type": "heading",
        "id": "fa01-r2-findings",
        "text": "Round 2: Key Findings"
      },
      {
        "type": "group",
        "layout": "cards",
        "children": [
          {
            "type": "insight",
            "tone": "success",
            "title": "Grok Won Both Rounds",
            "body": "Grok topped the owner's ranking in Round 1 (9.0) and again in Round 2 (9.0), and in Round 2 Claude's blind assessment put it first too."
          },
          {
            "type": "insight",
            "tone": "info",
            "title": "Claude Ranked Its Own Model Second",
            "body": "In Round 1, Claude's assessment ranked its own submission first. Scoring blind in Round 2, it placed its own model second, behind Grok, matching the owner."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "Every Page Invented Its Results",
            "body": "All five pages made up their experiment data. Only Luna 5.6 labelled its numbers as illustrative, and Claude Opus 5.5's footer marks its products as sample data. Gemini 3.1 Pro, Grok 4.6 and DeepSeek V4 present invented results with no disclaimer; Grok's and DeepSeek's attach them to real products and shops, and Grok's footer says the figures were measured."
          }
        ]
      },
      {
        "type": "conclusion",
        "title": "Round 2 Winner: Grok 4.6",
        "body": "Both assessments ranked Grok 4.6 first and Claude Opus 5.5 second. In the owner's words, Grok's page is the “most complete answer to ‘documentation website.’”"
      },
      {
        "type": "heading",
        "id": "fa01-round-1",
        "text": "Round 1 (Earlier Models)"
      },
      {
        "type": "callout",
        "title": "About Round 1's records",
        "paragraphs": [
          "The original Round 1 files were not kept reliably. The surviving files confirm the Gemini and Grok entries, and those two are linked below. For Claude, DeepSeek and ChatGPT, the attribution can't be verified.",
          "The file saved as Claude's matches this page's description of DeepSeek's entry. DeepSeek's surviving file contains the owner's real experiments, so it was not a cold-prompt output. ChatGPT's file is missing.",
          "Two claims were corrected after checking the files: Grok's theme button only shows an alert (the site is dark-only, with no saved light/dark mode and no timeline component), and Claude's assessment credited Gemini with features its file doesn't have. Round 2 supersedes Round 1's model-by-model results."
        ]
      },
      {
        "type": "heading",
        "id": "fa01-setup",
        "text": "Round 1: Setup"
      },
      {
        "type": "meta",
        "items": [
          {
            "label": "Prompt",
            "value": "\"Build a consumer tech documentation website in HTML for real-world smartphone, repair, and software experiments\""
          },
          {
            "label": "Models Tested",
            "value": "Claude · ChatGPT · Gemini · Grok · DeepSeek"
          },
          {
            "label": "Guidance Given",
            "value": "None — cold prompt only",
            "error": true
          },
          {
            "label": "Content Requirement",
            "value": "Each AI invented its own placeholder content"
          },
          {
            "label": "Judged On",
            "value": "Design · Code quality · Structure · Functionality"
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa01-owner-rankings",
        "text": "Round 1: Owner Rankings"
      },
      {
        "type": "group",
        "layout": "stack",
        "children": [
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥇 Grok — 9.0/10",
            "value": "9.0",
            "valueColor": "success",
            "body": "Full SPA with working JS view-routing, hero stats, category filters, and per-experiment detail views. (Corrected: the original write-up also credited a saved light/dark toggle and a timeline component; the file's theme button only shows an alert, and there is no timeline.) The only entry that built genuine site architecture instead of a static scroll page — and the only one whose structure actually mirrors how this real site is organized.",
            "link": "/fa01/round-1/grok.html"
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "🥈 ChatGPT — 7.0/10",
            "value": "7.0",
            "valueColor": "warning",
            "body": "Sidebar doc layout with a working theme toggle and a live search bar that filters page sections by typed text — a genuinely useful feature none of the others attempted. Let down by sloppy markup (stray br tags instead of CSS spacing) and fairly generic visual styling."
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "🥈 DeepSeek — 7.0/10",
            "value": "7.0",
            "valueColor": "warning",
            "body": "The most visually refined of the five — soft light theme, gradient-text logo, polished card and code-block styling, genuinely nice sidebar/grid layout. Purely static though: nav tabs and links don't go anywhere, no interactivity at all."
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "4th — Gemini — 6.5/10",
            "value": "6.5",
            "valueColor": "error",
            "body": "Clean Docusaurus-style dark sidebar with proper callouts and working anchor nav. Off-topic content (router flashing tutorial) and no interactivity beyond native anchors. Page feels unfinished at just two sections.",
            "link": "/fa01/round-1/gemini.html"
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "5th — Claude — 4.5/10",
            "value": "4.5",
            "valueColor": "error",
            "body": "Plain dark card layout, static table, zero interactivity, and the thinnest content of the five. Functional and clean but clearly the least effort — kept here for transparency. The data is the data."
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa01-claude-assessment",
        "text": "Round 1: Claude's Independent Assessment"
      },
      {
        "type": "paragraph",
        "variant": "note",
        "html": "Note: this assessment was generated separately by Claude before seeing the owner's rankings above. Scores differ — make of that what you will."
      },
      {
        "type": "group",
        "layout": "stack",
        "children": [
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥇 Claude — Editorial Foundation",
            "value": "1st",
            "valueColor": "success",
            "body": "Three intentional font families (Playfair Display, Inter, IBM Plex Mono), full design token system with semantic naming, sticky sidebar with active state navigation, status badges (COMPLETE / PENDING / ON HOLD), light/dark pill toggle, and responsive typography via clamp(). Most architecturally sophisticated of the five. Missing: no actual experiment data — a polished shell rather than a completed document."
          },
          {
            "type": "ranking",
            "tone": "success",
            "title": "🥈 Gemini — Functional Dashboard",
            "value": "2nd",
            "valueColor": "success",
            "body": "Fixed sidebar with grouped navigation, a .callout component system with modifiers, coloured status labels and an equipment table. Content went completely off-brief (OpenWrt router flashing) — nothing to do with smartphones or repair. (Corrected: this assessment originally also credited live search, a saved theme toggle, copy-to-clipboard and JS tab routing; the surviving file contains no JavaScript at all.)"
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "3rd — DeepSeek — Most Visually Distinctive",
            "value": "3rd",
            "valueColor": "warning",
            "body": "Light theme by default, gradient text headline, branded icon in header, clean card system, sidebar meta-info section with active experiment count and maintainer handles, syntax-highlighted code blocks. Went off-brief (developer docs portal via npm, not consumer tech). No dark mode, no accessibility attributes, no print styles."
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "4th — Grok — Most Ambitious, Most Dependent",
            "value": "4th",
            "valueColor": "warning",
            "body": "Space Grotesk headings, yellow accent scheme, large hero section, animated pulse indicator, category filter buttons, JS-populated experiment cards. Relies entirely on Tailwind CSS and Font Awesome CDNs — if either goes down, the entire design collapses. Content is fabricated. Visually impressive but not self-contained."
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "5th — ChatGPT — Recycled, Not Built",
            "value": "5th",
            "valueColor": "error",
            "body": "Three conflicting :root blocks that contradict each other, CSS variables defined but never actually used, Experiment 3 rating bars rendering as empty (no width values), content stopping at Experiment 3, title still reading \"v3\". Essentially recycled the original version of this site and called it a new submission. Least original, least complete, most structurally broken."
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa01-divergence",
        "text": "Round 1: Where the Assessments Diverge"
      },
      {
        "type": "table",
        "caption": "Comparison of owner vs Claude assessments — highlighting disagreements",
        "headers": [
          {
            "label": "Model"
          },
          {
            "label": "Owner Rank",
            "center": true
          },
          {
            "label": "Claude Rank",
            "center": true
          },
          {
            "label": "Difference",
            "center": true
          }
        ],
        "rows": [
          [
            {
              "primary": true,
              "text": "Grok"
            },
            {
              "center": true,
              "badge": "success",
              "text": "1st"
            },
            {
              "center": true,
              "badge": "warning",
              "text": "4th"
            },
            {
              "center": true,
              "badge": "error",
              "text": "▼ 3"
            }
          ],
          [
            {
              "primary": true,
              "text": "ChatGPT"
            },
            {
              "center": true,
              "badge": "success",
              "text": "2nd"
            },
            {
              "center": true,
              "badge": "error",
              "text": "5th"
            },
            {
              "center": true,
              "badge": "error",
              "text": "▼ 3"
            }
          ],
          [
            {
              "primary": true,
              "text": "DeepSeek"
            },
            {
              "center": true,
              "badge": "success",
              "text": "2nd"
            },
            {
              "center": true,
              "badge": "warning",
              "text": "3rd"
            },
            {
              "center": true,
              "badge": "warning",
              "text": "▼ 1"
            }
          ],
          [
            {
              "primary": true,
              "text": "Gemini"
            },
            {
              "center": true,
              "badge": "error",
              "text": "4th"
            },
            {
              "center": true,
              "badge": "success",
              "text": "2nd"
            },
            {
              "center": true,
              "badge": "success",
              "text": "▲ 2"
            }
          ],
          [
            {
              "primary": true,
              "text": "Claude"
            },
            {
              "center": true,
              "badge": "error",
              "text": "5th"
            },
            {
              "center": true,
              "badge": "success",
              "text": "1st"
            },
            {
              "center": true,
              "badge": "success",
              "text": "▲ 4"
            }
          ]
        ]
      },
      {
        "type": "paragraph",
        "variant": "small",
        "html": "The biggest disagreement: Grok and functionality vs. architecture. The owner prioritized working JS routing and SPA structure. Claude prioritized design token systems, semantic code, and self-contained CSS. Neither is objectively correct — they reflect different values in what makes a good website. The owner's assessment has no conflict of interest. Claude's does."
      },
      {
        "type": "heading",
        "id": "fa01-findings",
        "text": "Round 1: Key Findings"
      },
      {
        "type": "group",
        "layout": "cards",
        "children": [
          {
            "type": "insight",
            "tone": "info",
            "title": "Architecture Beat Aesthetics",
            "body": "The deciding factor wasn't color palette or typography — every entry looked reasonably professional. What separated Grok from the pack was building actual information architecture (routable views, reusable detail templates, real state) rather than a single static scroll of cards."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "Content Interpretation Varied Wildly",
            "body": "Only Claude and Grok stayed close to the brief. Gemini built a network admin dashboard. DeepSeek built a developer docs portal. ChatGPT recycled existing work. \"Consumer tech documentation website\" meant five completely different things to five different models."
          },
          {
            "type": "insight",
            "tone": "info",
            "title": "Interactivity Was Rare",
            "body": "Only Grok (view routing, filters and detail views) and ChatGPT (live search) shipped any real JavaScript functionality. DeepSeek, Gemini, and Claude were static HTML/CSS with decorative hover states only."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "Self-Containement Matters",
            "body": "Grok's entry depends on two external CDNs (Tailwind + Font Awesome). Every other submission was fully self-contained. For a documentation site meant to be archived and shared, CDN dependency is a real long-term risk."
          }
        ]
      },
      {
        "type": "conclusion",
        "title": "Owner's Winner: Grok · Claude's Winner: Claude · Honest Winner: Probably Grok",
        "body": "The owner's verdict stands on firmer ground — no conflict of interest, judged by the person who actually built and uses the real site. Grok built the closest thing to a real documentation product with working navigation. Claude's own entry, kept here for transparency, finished last on substance in the owner's assessment despite Claude rating it first. The meta-lesson: an AI judging its own output is not a reliable benchmark. That's exactly why this experiment was worth running."
      },
      {
        "type": "checklist",
        "id": "fa01-recommendation",
        "title": "Round 1: Which AI Should You Use for Web Development?",
        "items": [
          {
            "tone": "success",
            "mark": "✓",
            "name": "Grok",
            "text": "Best for full-page builds with real interactivity and SPA structure"
          },
          {
            "tone": "success",
            "mark": "✓",
            "name": "DeepSeek",
            "text": "Best for polished visual design and refined UI"
          },
          {
            "tone": "success",
            "mark": "✓",
            "name": "ChatGPT",
            "text": "Best for adding specific features (search, theme toggle) to existing work"
          },
          {
            "tone": "warning",
            "mark": "⚠️",
            "name": "Gemini",
            "text": "Good structure, but verify content stays on-brief"
          },
          {
            "tone": "error",
            "mark": "✗",
            "name": "Claude",
            "text": "Solid foundation, but needs the most hand-holding to produce complete content"
          }
        ]
      },
      {
        "type": "related",
        "items": [
          {
            "id": "fa02",
            "label": "🚫 Also see: FA-02 — One Month Out of the Apple Ecosystem"
          }
        ]
      }
    ],
    "nav": {
      "icon": "🤖",
      "label": "AI Comparison"
    }
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
    "scope": "📋 n=1 — personal experience, not a controlled study",
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
    ],
    "sections": [
      {
        "type": "paragraph",
        "variant": "lead",
        "html": "A 30-day attempt to leave the Apple ecosystem completely: phone, desktop, cloud, accessories and account authentication all moved to a Pixel 10 Pro and a Windows laptop. This is a personal friction log, not a controlled study."
      },
      {
        "type": "insight",
        "tone": "warning",
        "title": "Executive Summary",
        "body": "One month away from Apple revealed a painful truth: the ecosystem works so well when all parts align that you don't realize how much it's doing for you until it's gone. The friction wasn't insurmountable, but it was relentless. Every single task involved a workaround, a subscription, or a compromise that iOS/Mac handled transparently."
      },
      {
        "type": "heading",
        "id": "fa02-setup",
        "text": "Setup & Baseline"
      },
      {
        "type": "meta",
        "items": [
          {
            "label": "Duration",
            "value": "30 days"
          },
          {
            "label": "Primary Device",
            "value": "Pixel 10 Pro"
          },
          {
            "label": "Desktop",
            "value": "HP Victus 15-fa2013dx"
          },
          {
            "label": "Baseline (Before)",
            "value": "iPhone 16e + older MacBook Air"
          },
          {
            "label": "Scope",
            "value": "Complete ecosystem exit: phone, desktop, cloud, accessories, auth"
          }
        ]
      },
      {
        "type": "code",
        "text": "# device-swap.log — week 1 baseline capture\ndevice: \"Pixel 10 Pro\"\ndesktop: \"HP Victus 15-fa2013dx\"\nprior_setup: \"iPhone 16e + older MacBook Air\"\naccounts_migrated: 14\nwindows_first_login_time: \"30m\" // just to reach desktop"
      },
      {
        "type": "heading",
        "id": "fa02-timeline",
        "text": "The 30-Day Journey"
      },
      {
        "type": "timeline",
        "items": [
          {
            "tone": "warning",
            "title": "Week 1 — The Unpacking",
            "body": "Setup Pixel 10 Pro and HP Victus. Initial excitement about customization and stock Android freedom quickly replaced by setup friction — 30 minutes just to log into Windows, bloated with unnecessary software, subscription gateways for basic features."
          },
          {
            "tone": "error",
            "title": "Week 2 — The Cracks Appear",
            "body": "App quality on Pixel noticeably worse than iPhone — UI glitches, screen ratio issues, login problems. Windows-Pixel pairing failed repeatedly. Authentication migration revealed data loss: only recent history preserved; older account data disappeared."
          },
          {
            "tone": "error",
            "title": "Week 3 — The Breaking Point",
            "body": "Windows performance unplugged became unusable (\"like a laggy Android tablet from 20 years ago\"). Accessory ecosystem collapsed — Pixel has 3 notable accessory brands vs iPhone's ~100. Health metrics on Google Watch wildly inaccurate."
          },
          {
            "tone": "success",
            "title": "Week 4 — Return & Reflection",
            "body": "Returning to iPhone and Mac was far easier than leaving. The ecosystem pulls you back in. Verdict: Apple's lock-in is real, but it's a side effect of design coherence, not malice. The best ecosystem is the one you don't notice until you leave."
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa02-friction",
        "text": "The Friction Log — Key Findings"
      },
      {
        "type": "group",
        "layout": "cards",
        "children": [
          {
            "type": "insight",
            "tone": "error",
            "title": "Account Migration Was Deceptive",
            "body": "Backing up photos, apps, and data seemed straightforward until the moment of truth. Each account linked to Apple ID required 5–10 minutes of reconfiguration to switch to Google accounts. Worse: only the most recent portion of each account was preserved. All historical data from when accounts were first created on Apple ID was lost."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "App Quality on Pixel vs iPhone",
            "body": "Apps on Pixel 10 Pro work, but with consistent quality issues compared to iPhone: screen ratio problems, occasional lag and UI glitches, forgetting account logins mid-session, failure to send authentication codes. Even Google's own apps aren't optimized for their hardware."
          },
          {
            "type": "insight",
            "tone": "error",
            "title": "Desktop Transition: The Breaking Point",
            "body": "Windows setup was atrocious (30 minutes just to log in), bloated with unnecessary software, required $130/year subscriptions for features free on Mac, and pairing Pixel with Windows required downloading an app just for the OS to recognize the phone. No harmony — every integration felt like a workaround."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "Accessory Ecosystem Collapse",
            "body": "iPhone has ~100 brands worth of accessories. Pixel has 3 notable options. Windows laptop had almost nothing. Customization — a core desire — became impossible. This isn't just convenience; it's a meaningful reduction in how you can personalize your devices."
          },
          {
            "type": "insight",
            "tone": "warning",
            "title": "Peripheral Hardware (Watch, Earphones)",
            "body": "Earphones were an easy swap to Sony WF. Google Buds were \"okay\" but Sony met requirements. Google Watch paired well but health metrics were wildly inaccurate — heartbeat, step count, calorie burn all significantly off compared to Apple Watch."
          },
          {
            "type": "insight",
            "tone": "info",
            "title": "Pixel 10 Pro: The Phone Itself",
            "body": "<strong style='color:#fff'>The good:</strong> Stock Android offers features and customization iOS doesn't have. Rear camera is exceptional. <strong style='color:#fff'>The bad:</strong> Front-facing camera is poor — not comparable to iPhone's selfie quality. Gaming heats up quickly despite the new chipset."
          },
          {
            "type": "insight",
            "tone": "error",
            "title": "Authentication Hell: The Final Straw",
            "body": "Most accounts require two-factor authentication via iPhone. To use Pixel as the only phone requires: logging into accounts on iPhone, re-authenticating to Pixel, then re-authenticating everything else to work only on Pixel. Even after all this, \"it barely works.\" This created a dependency loop where you can't fully leave the iPhone behind."
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa02-implications",
        "text": "What This Reveals About Ecosystem Lock-In"
      },
      {
        "type": "group",
        "layout": "stack",
        "children": [
          {
            "type": "ranking",
            "tone": "warning",
            "title": "The Paradox",
            "value": "",
            "valueColor": "",
            "body": "Apple's ecosystem is so seamless when you're inside it that you never notice how much integration is happening. Phone, watch, MacBook, iPad, Apple TV — they all work in harmony. You rely on that harmony without thinking about it."
          },
          {
            "type": "ranking",
            "tone": "warning",
            "title": "Google's Counter-Offer",
            "value": "",
            "valueColor": "",
            "body": "Individual features that outclass Apple. Stock Android customization, Pixel camera software, hardware options. But these don't integrate. Each one requires a workaround to the next."
          },
          {
            "type": "ranking",
            "tone": "error",
            "title": "Windows Is Brutal",
            "value": "",
            "valueColor": "",
            "body": "It's not just \"different.\" It's bloated, subscription-gated, and requires you to solve puzzles to do things that Mac handles automatically. This was the true deal-breaker."
          },
          {
            "type": "ranking",
            "tone": "success",
            "title": "Returning Was Easier Than Leaving",
            "value": "",
            "valueColor": "",
            "body": "After 30 days, transferring everything back to iPhone and Mac took far less friction than the initial departure. This alone tells you something about which direction the ecosystem was designed to flow."
          }
        ]
      },
      {
        "type": "heading",
        "id": "fa02-verdict",
        "text": "Final Verdict"
      },
      {
        "type": "callout",
        "title": "Going Forward",
        "paragraphs": [
          "Keeping Pixel 10 Pro as part of daily rotation — it's genuinely good as a phone and reliable on Android stock. Everything else (Windows, Google ecosystem beyond the phone, desktop integration, accessories) was \"completely tolerable but just so annoying.\" The experiment confirmed: <strong style=\"color:var(--td-info);\">Apple's lock-in isn't just marketing. The ecosystem actually works better when all parts are in harmony.</strong>",
          "Never doing a full ecosystem exit again. The compromises weren't insurmountable, but they were relentless. Now it's clear why people stay."
        ]
      },
      {
        "type": "conclusion",
        "title": "Key Takeaway for Consumer Tech",
        "body": "Ecosystem lock-in is real, but it's not sinister — it's a side effect of design coherence. Apple makes you stay because leaving is so much harder than staying. Google has the individual parts but not the glue. Windows is still playing catch-up. The best ecosystem is the one you don't notice you're in until you leave."
      },
      {
        "type": "related",
        "items": [
          {
            "id": "fa01",
            "label": "🤖 Also see: FA-01 — Which AI Builds Our Website Best?"
          },
          {
            "id": "fa03",
            "label": "💻 Also see: FA-03 — Laptop Comparison Project"
          }
        ]
      }
    ],
    "nav": {
      "icon": "🚫",
      "label": "Ecosystem Exit"
    }
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
    "scope": "📋 n=1 — personal impressions from daily use, no benchmarks",
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
    ],
    "sections": [
      {
        "type": "paragraph",
        "variant": "lead",
        "html": "About two months of alternating daily use between two laptops: one day on the MacBook Pro 16\", the next on the Acer Aspire 14 AI. The same everyday work on both, plus gaming on the Aspire. These are personal impressions from real use, not measured benchmarks."
      },
      {
        "type": "heading",
        "id": "fa03-setup",
        "text": "Setup"
      },
      {
        "type": "meta",
        "items": [
          {
            "label": "Duration",
            "value": "About 2 months"
          },
          {
            "label": "Method",
            "value": "Alternating daily: one day per laptop"
          },
          {
            "label": "Workloads (both)",
            "value": "Canvas, streaming, CSS / web work, Adobe apps"
          },
          {
            "label": "Extra (Aspire)",
            "value": "Gaming, used a lot"
          }
        ]
      },
      {
        "type": "table",
        "caption": "Configurations as used",
        "headers": [
          {
            "label": "Spec"
          },
          {
            "label": "MacBook Pro 16\""
          },
          {
            "label": "Acer Aspire 14 AI"
          }
        ],
        "rows": [
          [
            {
              "primary": true,
              "text": "Chip"
            },
            {
              "text": "Apple M2 Pro"
            },
            {
              "text": "Intel Core Ultra 7 256V"
            }
          ],
          [
            {
              "primary": true,
              "text": "Graphics"
            },
            {
              "text": "—"
            },
            {
              "text": "Intel Arc 140V"
            }
          ],
          [
            {
              "primary": true,
              "text": "Memory"
            },
            {
              "text": "16GB"
            },
            {
              "text": "16GB"
            }
          ],
          [
            {
              "primary": true,
              "text": "Storage"
            },
            {
              "text": "512GB SSD"
            },
            {
              "text": "1TB"
            }
          ],
          [
            {
              "primary": true,
              "text": "Display size"
            },
            {
              "text": "16\""
            },
            {
              "text": "14\""
            }
          ],
          [
            {
              "primary": true,
              "text": "Notes"
            },
            {
              "text": "Gray"
            },
            {
              "text": "Refurbished"
            }
          ]
        ]
      },
      {
        "type": "heading",
        "id": "fa03-impressions",
        "text": "Impressions"
      },
      {
        "type": "table",
        "caption": "Side-by-side impressions from daily use",
        "headers": [
          {
            "label": "Area"
          },
          {
            "label": "MacBook Pro 16\""
          },
          {
            "label": "Acer Aspire 14 AI"
          }
        ],
        "rows": [
          [
            {
              "primary": true,
              "text": "Browsing"
            },
            {
              "text": "About equal"
            },
            {
              "text": "About equal"
            }
          ],
          [
            {
              "primary": true,
              "text": "Productive work (Canvas, CSS, Adobe)"
            },
            {
              "badge": "success",
              "text": "Worked very well; looked and felt smoother"
            },
            {
              "badge": "warning",
              "text": "Capable, but not as fast or smooth"
            }
          ],
          [
            {
              "primary": true,
              "text": "Build quality"
            },
            {
              "badge": "success",
              "text": "Felt noticeably better"
            },
            {
              "text": "—"
            }
          ],
          [
            {
              "primary": true,
              "text": "Gaming"
            },
            {
              "text": "—"
            },
            {
              "badge": "success",
              "text": "A real strength; used a lot"
            }
          ],
          [
            {
              "primary": true,
              "text": "Ecosystem"
            },
            {
              "badge": "success",
              "text": "Seamless for someone already in Apple's ecosystem"
            },
            {
              "text": "—"
            }
          ]
        ]
      },
      {
        "type": "keyFinding",
        "title": "Key Finding",
        "body": "For everyday browsing the two were about equal. The difference showed in productive work: the MacBook Pro looked and felt smoother, helped by its build quality, while the Aspire handled the same work, just not as fast or as smoothly."
      },
      {
        "type": "heading",
        "id": "fa03-verdict",
        "text": "Verdict"
      },
      {
        "type": "conclusion",
        "title": "Both are good laptops — for different people",
        "body": "For someone already in Apple's ecosystem, the MacBook Pro 16\" is the smoother, better-built productivity machine and works seamlessly with everything else. The Acer Aspire 14 AI proves itself too: it does the same productive work, only slower, and adds gaming that the Mac setup was not used for."
      },
      {
        "type": "footnote",
        "html": "<strong>FA-03</strong> | Status: Done — personal impressions<br> Source: owner's firsthand daily use over about two months. No benchmarks, thermal, battery or repair measurements were taken; none are claimed."
      },
      {
        "type": "related",
        "items": [
          {
            "id": "fa02",
            "label": "🚫 Also see: FA-02 — One Month Out of the Apple Ecosystem"
          },
          {
            "to": "#/experiments/queued-exp8",
            "label": "🔄 Also see: Experiment 8 — Cross-Platform Ecosystem Reliability"
          }
        ]
      }
    ],
    "nav": {
      "icon": "💻",
      "label": "Two Laptops"
    }
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
