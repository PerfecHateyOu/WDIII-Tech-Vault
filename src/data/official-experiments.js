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
    "researchQuestion": "How do Official Apple, Apple Authorized Service Providers (AASP), and Independent Third-Party repair channels compare across pricing, turnaround time, part authenticity, and warranty coverage?",
    "objective": "Benchmark 3 identical iPhone 15 units with cracked screens repaired through 3 distinct repair channel tiers to identify trade-offs in cost, turnaround, part quality, and post-repair warranty.",
    "methodology": "Three identical iPhone 15 units with cracked screens repaired through: Tier 1 (Official Apple Store), Tier 2 (Apple Authorized Service Provider / AASP), Tier 3 (Independent Third-Party Shop).",
    "conditions": "Identical iPhone 15 hardware, identical cracked screen severity, same metropolitan geographic market.",
    "protocol": "1. Baseline diagnostic verification on 3 units. 2. Submit to Tier 1, Tier 2, and Tier 3 simultaneously. 3. Log quotes, diagnostic fees, repair durations, and part serialized pairing screens. 4. Verify post-repair true tone, display serialization flags, and physical seal pressure tolerance.",
    "measurements": {
      "tier1": {
        "channel": "Official Apple",
        "cost": "$279",
        "turnaround": "2 hours",
        "parts": "OEM serialized",
        "warranty": "90 days Apple"
      },
      "tier2": {
        "channel": "AASP (Best Buy)",
        "cost": "$279",
        "turnaround": "Same day",
        "parts": "OEM serialized",
        "warranty": "90 days Apple"
      },
      "tier3": {
        "channel": "Third-Party Shop",
        "cost": "$149",
        "turnaround": "45 mins",
        "parts": "Aftermarket OLED",
        "warranty": "30 days shop"
      }
    },
    "results": "Tier 1 and Tier 2 provide identical genuine OEM parts and official calibration with 90-day Apple warranty at $279. Tier 3 saved 46% ($149) with 45-minute turnaround, but introduced non-genuine display warnings in iOS settings and lacked factory water-seal re-pressurization.",
    "observations": [
      "AASP equals Apple Store for common repairs when parts are in stock.",
      "Third-party repair is viable for budget-conscious users but forfeits display serialization and water-resistance certification.",
      "True Tone loss occurs in third-party repair unless the shop uses EEPROM programmer tools."
    ],
    "limitations": "Single geographic market, iPhone 15 platform only.",
    "verdict": "For devices under warranty or AppleCare+, Tier 1 or Tier 2 is mandatory. For out-of-warranty older models, Tier 3 offers strong cost efficiency if aftermarket screen trade-offs are accepted.",
    "devices": [
      "apple-iphone-15"
    ],
    "sources": [
      "WDIII Repair Channel Empirical Log",
      "Apple Repair Pricing Matrix",
      "Independent Shop Invoices"
    ],
    "tags": [
      "iPhone 15",
      "Screen Repair",
      "AASP vs Third-Party"
    ],
    "scope": "3 identical iPhone 15 units tested simultaneously",
    "search": "exp-2 repair channel comparison aasp apple third-party",
    "toc": [
      {
        "id": "exp2-tiers",
        "label": "Channel Tiers"
      },
      {
        "id": "exp2-findings",
        "label": "Trade-off Matrix"
      },
      {
        "id": "exp2-conclusion",
        "label": "Recommendation"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "channelTier",
        "label": "Repair Channel Tier",
        "type": "string",
        "required": true
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
        "key": "turnaroundHours",
        "label": "Turnaround Time",
        "type": "number",
        "unit": "Hours",
        "required": true,
        "min": 0,
        "max": 500
      },
      {
        "key": "turnaroundDays",
        "label": "Turnaround Days",
        "type": "number",
        "unit": "Days",
        "required": false,
        "min": 0,
        "max": 60
      },
      {
        "key": "qualityRating",
        "label": "Repair Quality Rating",
        "type": "number",
        "unit": "/ 10",
        "required": false,
        "min": 1,
        "max": 10
      },
      {
        "key": "genuinePartVerified",
        "label": "OEM Genuine Part Verified",
        "type": "boolean",
        "required": false
      },
      {
        "key": "warrantyMonths",
        "label": "Warranty Coverage",
        "type": "number",
        "unit": "Months",
        "required": false,
        "min": 0,
        "max": 36
      }
    ],
    "allowedMeasurementKeys": [
      "channelTier",
      "repairCost",
      "turnaroundHours",
      "turnaroundDays",
      "qualityRating",
      "genuinePartVerified",
      "warrantyMonths"
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
    "researchQuestion": "Which major smartphone manufacturers provide accessible, free, and knowledgeable first-party customer support when an end user calls with a technical issue?",
    "objective": "Evaluate the accessibility, hold times, technical competency, and barrier-to-entry of customer support channels across 8 smartphone manufacturers.",
    "methodology": "Standardized troubleshooting scenario presented to telephone support representatives across Apple, Samsung, Google, Huawei, Xiaomi, OPPO, OnePlus, Vivo, and BlackBerry.",
    "conditions": "Same script used for all calls: simulated network connectivity drops and battery drain diagnostic inquiries during standard business hours.",
    "protocol": "1. Initiate telephone call to primary official customer care line. 2. Measure hold time until live agent answers. 3. Present standardized technical scenario. 4. Score agent knowledge, willingness to help, and follow-up resources. 5. Document any paywalls or barrier gates.",
    "measurements": {
      "apple": {
        "rating": "4.0 / 5",
        "wait": "3 mins",
        "agent": "Knowledgeable",
        "cost": "Free"
      },
      "huawei": {
        "rating": "4.5 / 5",
        "wait": "1 min",
        "agent": "Exceptional",
        "cost": "Free (Co-Winner)"
      },
      "xiaomi": {
        "rating": "4.5 / 5",
        "wait": "2 mins",
        "agent": "Exceptional",
        "cost": "Free (Co-Winner)"
      },
      "oppo": {
        "rating": "3.5 / 5",
        "wait": "5 mins",
        "agent": "Helpful",
        "cost": "Free"
      },
      "oneplus": {
        "rating": "3.0 / 5",
        "wait": "8 mins",
        "agent": "Scripted",
        "cost": "Free"
      },
      "vivo": {
        "rating": "1.0 / 5",
        "wait": "N/A",
        "agent": "Email only",
        "cost": "No live phone"
      },
      "blackberry": {
        "rating": "0.0 / 5",
        "wait": "Instant",
        "agent": "Paywall gate",
        "cost": "Paid support code required"
      }
    },
    "results": "Huawei and Xiaomi tied for top customer service quality (4.5★) with rapid live pickups and thorough technical troubleshooting. BlackBerry scored 0★ by demanding upfront payment to speak with an agent. Vivo provided no phone support option in the test region.",
    "observations": [
      "Huawei and Xiaomi proved that cost-effective brands can deliver first-rate phone support.",
      "BlackBerry's paywalled consumer support model is completely hostile to users.",
      "Apple delivered consistent, high-standard phone support but took longer to escalate complex issues."
    ],
    "limitations": "Sample based on North American and European support numbers during weekday hours.",
    "verdict": "Winners: Huawei & Xiaomi. Both provide fast, free, and competent phone support without automated labyrinth loops or fees.",
    "devices": [
      "huawei-support-test-unit",
      "xiaomi-support-test-unit",
      "oppo-support-test-unit",
      "oneplus-support-test-unit",
      "vivo-support-test-unit",
      "blackberry-support-test-unit"
    ],
    "sources": [
      "WDIII Support Audio Logs",
      "Call Duration Metadata",
      "Support Ticket Transcripts"
    ],
    "tags": [
      "Customer Service",
      "Phone Support",
      "8 Brands Tested"
    ],
    "scope": "8 manufacturers evaluated under identical script conditions",
    "search": "exp-3 customer service support quality phone test",
    "toc": [
      {
        "id": "exp3-leaderboard",
        "label": "Leaderboard"
      },
      {
        "id": "exp3-findings",
        "label": "Analysis"
      },
      {
        "id": "exp3-paywalls",
        "label": "Paywall Audit"
      }
    ],
    "relatedExperiments": [
      {
        "id": "exp1",
        "label": "📦 Experiment 1 — Apple vs Samsung Mail-In"
      }
    ],
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "holdTimeMinutes",
        "label": "Initial Hold Time",
        "type": "number",
        "unit": "Minutes",
        "required": true,
        "min": 0,
        "max": 180
      },
      {
        "key": "waitMinutes",
        "label": "Wait Duration",
        "type": "number",
        "unit": "Minutes",
        "required": false,
        "min": 0,
        "max": 240
      },
      {
        "key": "resolutionDays",
        "label": "Resolution Time",
        "type": "number",
        "unit": "Days",
        "required": true,
        "min": 0,
        "max": 90
      },
      {
        "key": "escalationsCount",
        "label": "Escalation Count",
        "type": "number",
        "unit": "Tiers",
        "required": false,
        "min": 0,
        "max": 20
      },
      {
        "key": "resolutionRate",
        "label": "Resolution Success Rate",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "satisfactionScore",
        "label": "Support Satisfaction Score",
        "type": "number",
        "unit": "Score",
        "required": false,
        "min": 1,
        "max": 10
      }
    ],
    "allowedMeasurementKeys": [
      "holdTimeMinutes",
      "waitMinutes",
      "resolutionDays",
      "escalationsCount",
      "resolutionRate",
      "satisfactionScore"
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
    "researchQuestion": "Does upgrading an iPhone through successive major iOS revisions degrade real-world app launch times, Geekbench compute scores, or thermal throttling thresholds?",
    "objective": "Track benchmark and real-world performance metrics across major iOS versions on the same hardware.",
    "methodology": "iPhone 15 Pro tested across iOS 17.0 baseline, iOS 18.0, and historical comparative points. Geekbench 6 single/multi-core, Metal GPU compute, 3DMark Wild Life Stress, and standardized 10-app opening speed runs.",
    "conditions": "Room temperature 22°C, 100% battery charge on AC power, identical background application state.",
    "protocol": "1. Clean restore via DFU mode. 2. Complete initial indexing for 24 hours. 3. Execute 5 consecutive Geekbench 6 runs with 10-minute cool-down intervals. 4. Record thermal surface temperatures with FLIR camera. 5. Measure cold app launch latency using 240fps high-speed camera.",
    "measurements": {
      "geekbenchSingleCore": {
        "iOS 17.0": 2915,
        "iOS 18.0": 2940,
        "iOS 18.6": 2955
      },
      "geekbenchMultiCore": {
        "iOS 17.0": 7240,
        "iOS 18.0": 7290,
        "iOS 18.6": 7320
      },
      "appLaunchRunTime": {
        "iOS 17.0": "18.4s",
        "iOS 18.0": "18.2s",
        "iOS 18.6": "18.1s"
      },
      "thermalPeak": {
        "iOS 17.0": "41.2°C",
        "iOS 18.0": "39.8°C",
        "iOS 18.6": "39.4°C"
      }
    },
    "results": "No planned obsolescence degradation observed. Performance scores remained consistent (+0.5% to +1.2% variation within margin of error). iOS 18 showed improved thermal regulation during sustained compute workloads.",
    "observations": [
      "Thermal dispatch improved after iOS 18.1, keeping peak chassis temperature ~1.8°C cooler.",
      "Background indexing immediately post-update causes temporary battery/thermal hits for 24-48 hours, often mistaken by consumers for permanent slowdowns."
    ],
    "limitations": "Single iPhone generation hardware cycle (A17 Pro).",
    "verdict": "Modern iOS updates on flagship Apple silicon do not degrade computational performance. Perception of slowdown is tied to temporary post-update file indexing and battery chemical aging.",
    "devices": [
      "apple-iphone-15-pro"
    ],
    "sources": [
      "Geekbench 6 Database Export",
      "FLIR Thermal Capture Logs",
      "High-Speed Camera Timings"
    ],
    "tags": [
      "iOS Performance",
      "Geekbench",
      "Thermal Analysis"
    ],
    "scope": "iPhone 15 Pro tracked through 3 OS update milestones",
    "search": "exp-4 ios performance comparison historical benchmarks",
    "toc": [
      {
        "id": "exp4-benchmarks",
        "label": "Benchmarks"
      },
      {
        "id": "exp4-thermals",
        "label": "Thermal Analysis"
      },
      {
        "id": "exp4-conclusion",
        "label": "Conclusions"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "geekbenchSingleCore",
        "label": "Geekbench Single-Core",
        "type": "number",
        "unit": "Points",
        "required": true,
        "min": 0,
        "max": 10000
      },
      {
        "key": "geekbenchMultiCore",
        "label": "Geekbench Multi-Core",
        "type": "number",
        "unit": "Points",
        "required": true,
        "min": 0,
        "max": 30000
      },
      {
        "key": "appLaunchRunTime",
        "label": "Cold App Launch Duration",
        "type": "number",
        "unit": "Seconds",
        "required": true,
        "min": 0,
        "max": 30
      },
      {
        "key": "thermalPeak",
        "label": "Peak Temperature Under Load",
        "type": "number",
        "unit": "°C",
        "required": false,
        "min": 15,
        "max": 90
      },
      {
        "key": "primaryScore",
        "label": "Benchmark Overall Score",
        "type": "number",
        "unit": "Score",
        "required": false,
        "min": 0,
        "max": 50000
      }
    ],
    "allowedMeasurementKeys": [
      "geekbenchSingleCore",
      "geekbenchMultiCore",
      "appLaunchRunTime",
      "thermalPeak",
      "primaryScore"
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
    "researchQuestion": "Does Samsung hardware exhibit a systemic, multi-generation lithium-ion battery swelling pattern in long-term storage compared to other brands, and how does corporate warranty support respond?",
    "objective": "Document battery swelling across Samsung Galaxy devices stored under controlled conditions, evaluate safety risks, and audit Samsung corporate liability responses including CPSC complaint filings.",
    "methodology": "Long-term climate-controlled storage analysis of 7 Samsung devices alongside non-Samsung controls (iPhone 5c). Documentation of battery pouch delamination, casing separation, and corporate dispute resolution records.",
    "conditions": "Storage temperature 20°C–23°C, 40%–50% relative humidity, battery state of charge 40%–60% at initial storage.",
    "protocol": "1. Place devices in certified flame-retardant storage enclosure. 2. Periodic physical inspection for back cover lifting. 3. Caliper measurement of battery pouch thickness expansion. 4. Escalate failed units through Samsung corporate customer advocacy. 5. File formal documentation with Consumer Product Safety Commission (CPSC).",
    "measurements": {
      "swollenUnits": [
        {
          "model": "Galaxy S20 FE",
          "timeline": "18 months",
          "failure": "Severe expansion, back glass unglued"
        },
        {
          "model": "Galaxy S8",
          "timeline": "36 months",
          "failure": "Pouch ballooning, frame split"
        },
        {
          "model": "Galaxy S10",
          "timeline": "28 months",
          "failure": "Casing bowed"
        },
        {
          "model": "Galaxy S10e",
          "timeline": "30 months",
          "failure": "Rear panel separated"
        },
        {
          "model": "Galaxy Note 8 (Unit A)",
          "timeline": "40 months",
          "failure": "Battery puffed"
        },
        {
          "model": "Galaxy Note 8 (Unit B)",
          "timeline": "44 months",
          "failure": "Critical pouch split"
        },
        {
          "model": "Galaxy Z Fold 2",
          "timeline": "24 months",
          "failure": "Back glass pushed off"
        }
      ],
      "controlUnits": [
        {
          "model": "iPhone 5c",
          "timeline": "10+ years",
          "failure": "Zero swelling, casing intact"
        }
      ],
      "corporateResponse": "Refused out-of-warranty coverage; demanded inspection fee; denied systemic defect."
    },
    "results": "7 out of 7 stored pre-2021 Samsung units suffered severe battery swelling and casing rupture. The 2013 iPhone 5c control unit exhibited zero swelling under identical climate conditions. Samsung refused corporate accountability, classifying hazardous battery expansion as ordinary wear.",
    "observations": [
      "Failure Pattern: Battery swelling is concentrated in Samsung SDI cell formulations manufactured between 2016 and 2020.",
      "Post-2021 Control Check: Newer Galaxy models (S21 through S25) show improved electrolyte stability thus far.",
      "Corporate Response Deficit: Samsung treats severe battery delamination as an out-of-warranty cosmetic defect rather than a safety hazard."
    ],
    "limitations": "Focuses on storage behavior; active daily cycling may alter swelling trajectory.",
    "verdict": "A documented, empirical safety failure pattern exists in pre-2021 Samsung Galaxy batteries stored in dormant conditions. Samsung's corporate refusal to replace hazardous cells violates consumer protection standards.",
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
      "WDIII Physical Inspection Logs",
      "CPSC Official Report #2023-098",
      "Samsung Service Tickets"
    ],
    "tags": [
      "Battery Swelling",
      "Samsung SDI",
      "CPSC Complaint",
      "Safety Analysis"
    ],
    "scope": "7 Samsung units + control devices tracked over 4+ years",
    "search": "case study samsung battery failures swelling cpsc corporate",
    "toc": [
      {
        "id": "cs-timeline",
        "label": "Failure Timeline"
      },
      {
        "id": "cs-evidence",
        "label": "Physical Evidence"
      },
      {
        "id": "cs-corporate",
        "label": "Corporate Response"
      },
      {
        "id": "cs-cpsc",
        "label": "CPSC Findings"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "swollenUnits",
        "label": "Swollen Battery Count",
        "type": "number",
        "unit": "Units",
        "required": true,
        "min": 0,
        "max": 100
      },
      {
        "key": "controlUnits",
        "label": "Control Batch Size",
        "type": "number",
        "unit": "Units",
        "required": true,
        "min": 1,
        "max": 1000
      },
      {
        "key": "peakTempC",
        "label": "Peak Storage Temp",
        "type": "number",
        "unit": "°C",
        "required": false,
        "min": -20,
        "max": 100
      },
      {
        "key": "storageTemp",
        "label": "Ambient Storage Temperature",
        "type": "number",
        "unit": "°C",
        "required": false,
        "min": -10,
        "max": 60
      },
      {
        "key": "corporateResponseReceived",
        "label": "Formal Manufacturer Response",
        "type": "boolean",
        "required": false
      }
    ],
    "allowedMeasurementKeys": [
      "swollenUnits",
      "controlUnits",
      "peakTempC",
      "storageTemp",
      "corporateResponseReceived"
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
    "researchQuestion": "How do 5 generations of Google Pixel Pro (Pixel 6 Pro through 10 Pro) compare against contemporary iPhone hardware in standardized, multi-workload battery endurance tests?",
    "objective": "Execute a controlled, empirical battery drain test comparing Google Pixel Pro generations against iPhone flagships across video streaming, social browsing, gaming, and 5G cellular web tests.",
    "methodology": "Automated test suite cycling YouTube 1080p, Instagram scrolling, Geekbench compute loops, and 5G web surfing. All displays calibrated to exactly 200 nits with a Klein K10-A colorimeter. Ambient temperature maintained at 21.5°C.",
    "conditions": "Calibrated 200 nits display brightness, Wi-Fi 6 / 5G sub-6 connection, 100% battery health baseline, identical audio volume via Bluetooth headset.",
    "protocol": "1. Charge all devices to 100% and float for 30 minutes. 2. Calibrate screen brightness with spectrophotometer. 3. Start synchronized workload loop. 4. Log battery percentage drop every 15 minutes. 5. Record shutdown time and calculate total Screen-on-Time (SoT).",
    "measurements": {
      "Pixel 6 Pro": "6 hrs 12 mins",
      "Pixel 7 Pro": "6 hrs 45 mins",
      "Pixel 8 Pro": "7 hrs 22 mins",
      "Pixel 9 Pro": "8 hrs 40 mins",
      "Pixel 10 Pro": "10 hrs 15 mins",
      "iPhone 13 (Baseline)": "7 hrs 30 mins",
      "iPhone 15 Pro": "8 hrs 10 mins",
      "iPhone 16e": "8 hrs 50 mins"
    },
    "results": "Google Pixel 10 Pro (TSMC Tensor G5) achieved 10 hrs 15 mins SoT, dominating all earlier Tensor generations and outlasting iPhone 15 Pro by over 2 hours. Older Samsung Foundry Tensor chips (Tensor G1 & G2) lagged significantly behind contemporary iPhones in power efficiency.",
    "observations": [
      "The TSMC switch on Tensor G5 provided a massive 18% efficiency leap over Tensor G4 and 65% over Tensor G1.",
      "Pixel 6 Pro and 7 Pro suffered higher cellular standby drain due to early Samsung Exynos modems.",
      "iPhone 16e demonstrated impressive endurance for a compact device with Apple's in-house modem."
    ],
    "limitations": "Conducted under lab Wi-Fi/5G mixed conditions; extreme outdoor cold/heat may alter rankings.",
    "verdict": "Winner: Google Pixel 10 Pro. The transition to TSMC silicon solved Pixel's historic battery disadvantage, crowning the Pixel 10 Pro as the endurance champion.",
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
      "WDIII Automated Battery Benchmark Suite",
      "Klein K10-A Calibration Logs",
      "Hardware Telemetry Dumps"
    ],
    "tags": [
      "Battery Life",
      "Pixel vs iPhone",
      "SoT Benchmark",
      "TSMC vs Samsung Silicon"
    ],
    "scope": "8 devices tested concurrently across 4 standardized workload phases",
    "search": "exp-5 battery life google pixel pro iphone endurance drain",
    "toc": [
      {
        "id": "exp5-results",
        "label": "Results Table"
      },
      {
        "id": "exp5-analysis",
        "label": "Efficiency Curves"
      },
      {
        "id": "exp5-verdict",
        "label": "Final Verdict"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "screenOnTimeHours",
        "label": "Screen-On Time",
        "type": "number",
        "unit": "Hours",
        "required": true,
        "min": 0,
        "max": 30
      },
      {
        "key": "screenOnTimeMinutes",
        "label": "Screen-On Time (Minutes)",
        "type": "number",
        "unit": "Minutes",
        "required": false,
        "min": 0,
        "max": 1800
      },
      {
        "key": "chargeTimeMinutes",
        "label": "0-100% Charge Duration",
        "type": "number",
        "unit": "Minutes",
        "required": false,
        "min": 0,
        "max": 300
      },
      {
        "key": "peakTempC",
        "label": "Peak Temperature During Fast Charging",
        "type": "number",
        "unit": "°C",
        "required": false,
        "min": 15,
        "max": 80
      },
      {
        "key": "standbyDrainPercent",
        "label": "24h Standby Drain",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 0,
        "max": 100
      },
      {
        "key": "batteryHealthPercent",
        "label": "Maximum Battery Health",
        "type": "number",
        "unit": "%",
        "required": false,
        "min": 50,
        "max": 100
      }
    ],
    "allowedMeasurementKeys": [
      "screenOnTimeHours",
      "screenOnTimeMinutes",
      "chargeTimeMinutes",
      "peakTempC",
      "standbyDrainPercent",
      "batteryHealthPercent"
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
    "researchQuestion": "Does an Apple Authorized Service Provider (iFix / Best Buy AASP) maintain the same repair quality, calibration standards, and turnaround promises as a first-party Apple Store?",
    "objective": "Audit the end-to-end customer experience, repair turnaround, diagnostic accuracy, and hardware calibration of an Apple Authorized Service Provider on a cracked iPhone 16 Pro Max.",
    "methodology": "Real-world cracked display walk-in repair submitted to certified AASP franchise location. Contributor MTA documented booking, intake diagnostics, repair duration, and post-repair calibration validation.",
    "conditions": "Cracked outer display glass on iPhone 16 Pro Max, genuine Apple repair tier, walk-in appointment.",
    "protocol": "1. Schedule through Apple Support portal. 2. Record check-in intake inspection. 3. Monitor repair turnaround against estimate. 4. Verify Apple System Configuration serial calibration. 5. Inspect display bezel gaps and digitizer touch sample rate.",
    "measurements": {
      "intakeWait": "12 mins",
      "repairDuration": "2 hours 15 mins",
      "cost": "$379 (Official Apple Rate)",
      "systemConfigStatus": "Passed (Genuine Display Detected)",
      "seamUniformity": "0.1mm tolerance (Factory Spec)"
    },
    "results": "AASP completed repair within 2 hours and 15 minutes using genuine Apple parts and Apple System Configuration cloud pairing. Repair was indistinguishable from an Apple Store Genius Bar repair.",
    "observations": [
      "OEM calibration successfully cleared all 'Unknown Part' flags in iOS.",
      "Turnaround was 30 minutes longer than original estimate due to Apple cloud calibration queue delays.",
      "Customer service was professional and adhered strictly to Apple official repair checklists."
    ],
    "limitations": "Single AASP franchise location.",
    "verdict": "Approved. AASPs provide a viable, official alternative to Apple Stores in regions lacking first-party retail presence.",
    "devices": [
      "apple-iphone-16-pro-max"
    ],
    "sources": [
      "WDIII Contributor MTA Field Report",
      "Apple System Configuration Diagnostics Log",
      "iFix Work Order #8821"
    ],
    "tags": [
      "AASP",
      "iFix",
      "iPhone 16 Pro Max",
      "Display Repair"
    ],
    "scope": "Full walk-in repair audit on flagship hardware",
    "search": "exp-6 aasp repair test ifix authorized service provider",
    "toc": [
      {
        "id": "exp6-timeline",
        "label": "Intake & Timeline"
      },
      {
        "id": "exp6-quality",
        "label": "Hardware Inspection"
      },
      {
        "id": "exp6-verdict",
        "label": "AASP Verdict"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "intakeWait",
        "label": "Intake Wait Duration",
        "type": "number",
        "unit": "Minutes",
        "required": true,
        "min": 0,
        "max": 240
      },
      {
        "key": "repairDuration",
        "label": "Repair Work Duration",
        "type": "number",
        "unit": "Hours",
        "required": true,
        "min": 0,
        "max": 48
      },
      {
        "key": "cost",
        "label": "Total Cost",
        "type": "number",
        "unit": "USD",
        "required": true,
        "min": 0,
        "max": 2000
      },
      {
        "key": "repairCost",
        "label": "Total Cost (USD)",
        "type": "number",
        "unit": "USD",
        "required": false,
        "min": 0,
        "max": 2000
      },
      {
        "key": "systemConfigStatus",
        "label": "Apple System Config Validation",
        "type": "string",
        "required": true
      },
      {
        "key": "seamUniformity",
        "label": "Chassis Seam Uniformity",
        "type": "number",
        "unit": "/ 10",
        "required": false,
        "min": 1,
        "max": 10
      }
    ],
    "allowedMeasurementKeys": [
      "intakeWait",
      "repairDuration",
      "cost",
      "repairCost",
      "systemConfigStatus",
      "seamUniformity"
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
    "researchQuestion": "How has Google's flagship hardware progressed from Pixel 6 Pro to Pixel 10 Pro across thermal dissipation, sustained compute, modem reliability, and camera zoom fidelity?",
    "objective": "Conduct a comprehensive generational review of Google Pixel Pro smartphones (6 Pro, 7 Pro, 8 Pro, 9 Pro, and 10 Pro) to map the evolution of Google's custom Tensor silicon and industrial design.",
    "methodology": "Side-by-side evaluation of 5 Pixel Pro generations across camera telephoto zoom at 10x/30x/100x, Geekbench compute stress loops, cellular signal reception in weak-coverage zones, and display outdoor peak brightness.",
    "conditions": "All devices running current available OS versions, room temp 22°C, identical Wi-Fi 6 / 5G test carriers.",
    "protocol": "1. Camera: Capture standardized outdoor urban scene at 1x, 5x, 10x, 30x, and 100x. 2. Thermals: Run 30-minute 3DMark Wild Life Extreme stress test with thermal imaging. 3. Cellular: Measure dBm signal strength and packet loss in RF-shielded chamber. 4. Display: Measure full-screen sustained lux outdoors.",
    "measurements": {
      "Pixel 6 Pro": {
        "chip": "Tensor G1",
        "modem": "Exynos 5123",
        "thermals": "Hot (44°C)",
        "zoomMax": "20x",
        "stability": "72%"
      },
      "Pixel 7 Pro": {
        "chip": "Tensor G2",
        "modem": "Exynos 5300",
        "thermals": "Warm (42°C)",
        "zoomMax": "30x",
        "stability": "78%"
      },
      "Pixel 8 Pro": {
        "chip": "Tensor G3",
        "modem": "Exynos 5300",
        "thermals": "Warm (41°C)",
        "zoomMax": "30x",
        "stability": "82%"
      },
      "Pixel 9 Pro": {
        "chip": "Tensor G4",
        "modem": "Exynos 5400",
        "thermals": "Cool (38°C)",
        "zoomMax": "30x",
        "stability": "89%"
      },
      "Pixel 10 Pro": {
        "chip": "Tensor G5",
        "modem": "TSMC Custom",
        "thermals": "Cool (36°C)",
        "zoomMax": "100x",
        "stability": "96%"
      }
    },
    "results": "Google's 5-generation trajectory shows dramatic silicon maturation. The jump from Pixel 6 Pro (Samsung Tensor G1) to Pixel 10 Pro (TSMC Tensor G5) resolved thermal throttling, doubled zoom reach, and eliminated dropped calls in weak reception areas.",
    "observations": [
      "Pixel 6 Pro suffered severe modem disconnects in fringe areas; Pixel 9 Pro and 10 Pro exhibited zero dropped packets.",
      "The 100x Pro Res Zoom on Pixel 10 Pro leverages generative super-resolution for readable text at extreme distances.",
      "Vapor chamber cooling introduced in Pixel 9 Pro and refined in 10 Pro prevented thermal degradation during long 4K60 video recording."
    ],
    "limitations": "Pixel 6 Pro battery capacity degraded slightly due to age relative to newer review units.",
    "verdict": "Pixel 10 Pro represents the definitive maturity point of Google's flagship hardware vision, finally achieving thermal and computational parity with top industry competitors.",
    "devices": [
      "google-pixel-6-pro",
      "google-pixel-7-pro",
      "google-pixel-8-pro",
      "google-pixel-9-pro",
      "google-pixel-10-pro"
    ],
    "sources": [
      "WDIII Pixel Generational Benchmark Archive",
      "RF Chamber Telemetry Logs",
      "Camera Image RAW Analysis"
    ],
    "tags": [
      "Google Pixel",
      "Tensor Silicon",
      "Hardware Evolution",
      "Telephoto Zoom"
    ],
    "scope": "5 consecutive generations of flagship Google devices tested side-by-side",
    "search": "exp-7 google pixel pro generation comparison tensor camera zoom",
    "toc": [
      {
        "id": "exp7-silicon",
        "label": "Silicon Evolution"
      },
      {
        "id": "exp7-camera",
        "label": "Zoom & Imaging"
      },
      {
        "id": "exp7-connectivity",
        "label": "Modem & RF"
      },
      {
        "id": "exp7-conclusion",
        "label": "Generational Verdict"
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
    "updatedAt": "2026-09-13T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "displayPeakNits",
        "label": "Display Peak Brightness",
        "type": "number",
        "unit": "Nits",
        "required": true,
        "min": 100,
        "max": 4000
      },
      {
        "key": "tensorThermalThrottle",
        "label": "Thermal Throttle Percent",
        "type": "number",
        "unit": "%",
        "required": true,
        "min": 0,
        "max": 100
      },
      {
        "key": "modemSignalDbm",
        "label": "Cellular Signal Strength",
        "type": "number",
        "unit": "dBm",
        "required": false,
        "min": -140,
        "max": -40
      },
      {
        "key": "primaryScore",
        "label": "Overall Generational Score",
        "type": "number",
        "unit": "Score",
        "required": false,
        "min": 0,
        "max": 100
      }
    ],
    "allowedMeasurementKeys": [
      "displayPeakNits",
      "tensorThermalThrottle",
      "modemSignalDbm",
      "primaryScore"
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
    "researchQuestion": "Does iOS 27 deliver Apple's claimed responsiveness, battery efficiency, and stability improvements on iPhone 16e, and how reliably do Gemini, Claude, and ChatGPT integrate with Siri AI under isolated testing?",
    "objective": "Validate Apple's iOS 27 performance claims (responsiveness, battery life, system stability, claimed 'up to 60%' improvements) on iPhone 16e. Test isolated integration of Gemini, Claude, and ChatGPT with Siri AI. Verify headline features announced during iOS 27 presentation through firsthand testing.",
    "methodology": "Controlled single-device testing on iPhone 16e (iPhone17,5) running iOS 27.0 (tracking through 27.1, 27.2+). Cold/warm app launch timings, automated load responsiveness, battery drain cycle logging, and isolated side-by-side prompt execution across Gemini, Claude, and ChatGPT with Siri AI handoff.",
    "conditions": "iPhone 16e (A18, 8GB RAM, Apple C1 modem), iOS 27.0 release build, controlled 21°C lab ambient, standardized Wi-Fi test network, identical prompts across all AI services.",
    "protocol": "1. Baseline setup on iPhone 16e running clean iOS 27.0. 2. Responsiveness testing: launch time logging, UI frametime under load, multitasking switching latency. 3. Battery drain testing: standard workload consumption, 8-hour standby drain, thermal profiles. 4. Siri AI Chatbot Integration: execute identical prompt sequences on Gemini, Claude, and ChatGPT measuring latency, handoff reliability, and multi-turn context retention. 5. Headline feature verification: validate functional completeness of announced iOS 27 presentation features.",
    "measurements": {
      "responsivenessGain": "Tracking (target: up to 60%)",
      "siriHandoffLatency": "Testing in progress",
      "batteryDrainStandardRate": "Active logging"
    },
    "results": "Testing actively underway on iOS 27.0 (final) on iPhone 16e. App launch profiling and Siri AI chatbot integration benchmarks in progress.",
    "observations": [
      "iPhone 16e hardware baseline initialized with iOS 27.0 clean installation.",
      "Siri AI chatbot dispatch framework active for Gemini, Claude, and ChatGPT isolated prompt sets.",
      "Initial warm launch speed shows measurable improvements on system utilities."
    ],
    "limitations": "Single-device testing strictly scoped to iPhone 16e (n=1). Controlled side-by-side comparisons rather than general multi-user field averages. Cannot be extrapolated across the entire iPhone 16 lineup.",
    "verdict": "Active testing in progress. Final verdict pending completion of 27.0 baseline benchmarks and minor update regression passes.",
    "devices": [
      "apple-iphone-16e"
    ],
    "sources": [
      "WDIII iOS 27 Laboratory Test Suite",
      "Apple iOS 27 Keynote Performance Specifications",
      "Xcode Instruments & Quartz Debugger Frametime Logs"
    ],
    "tags": [
      "iOS 27",
      "iPhone 16e",
      "Siri AI",
      "Gemini",
      "Claude",
      "ChatGPT",
      "Benchmark"
    ],
    "scope": "Controlled single-device performance & AI chatbot integration testing on iPhone 16e",
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
    "updatedAt": "2026-09-25T00:00:00.000Z",
    "protocolVersion": "1.0.0",
    "version": "1.0.0",
    "measurementSchema": [
      {
        "key": "appLaunchTimeDeltaPct",
        "label": "App Launch Responsiveness Improvement",
        "type": "number",
        "unit": "%",
        "required": true,
        "min": -50,
        "max": 100
      },
      {
        "key": "siriAiHandoffLatencyMs",
        "label": "Siri AI Handoff Latency",
        "type": "number",
        "unit": "ms",
        "required": true,
        "min": 100,
        "max": 10000
      },
      {
        "key": "standbyBatteryDrainPerHour",
        "label": "Standby Battery Drain Rate",
        "type": "number",
        "unit": "%/hr",
        "required": false,
        "min": 0,
        "max": 10
      },
      {
        "key": "headlineFeaturesVerified",
        "label": "Headline Features Functionally Verified",
        "type": "number",
        "unit": "Features",
        "required": false,
        "min": 0,
        "max": 30
      }
    ],
    "allowedMeasurementKeys": [
      "appLaunchTimeDeltaPct",
      "siriAiHandoffLatencyMs",
      "standbyBatteryDrainPerHour",
      "headlineFeaturesVerified"
    ]
  }
];
