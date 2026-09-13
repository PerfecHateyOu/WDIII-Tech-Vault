/**
 * WDIII Tech Vault - Authoritative Official Experiments Dataset
 * 
 * Complete structured schema representing all 14 official WDIII empirical experiments,
 * case studies, and queued testing protocols.
 * 
 * Strict schema adherence:
 * - id, experimentNumber, title, category, status, statusLabel, origin: "official_wdiii"
 * - researchQuestion, objective, methodology, conditions, protocol, measurements
 * - results, observations, limitations, verdict, devices, sources, tags, scope, search, toc, relatedExperiments
 * - createdAt, updatedAt
 */

export const OFFICIAL_EXPERIMENTS = [
  {
    id: "exp1",
    experimentNumber: "1",
    title: "Experiment 1: Apple vs Samsung Mail-In Repair",
    category: "repair",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "When identical level 9 screen damage is submitted via mail-in to official repair centers for Apple and Samsung, how do cost, turnaround time, communication quality, and physical repair quality compare?",
    objective: "Compare official manufacturer mail-in repair turnaround, total cost, customer communication, and physical repair quality between Apple and Samsung for identical cracked screen damage.",
    methodology: "Same level 9 cracked screen damage sent via mail-in to official repair centers for both Apple (iPhone 17 Pro Max) and Samsung (Galaxy S26 Ultra). Testing cost, turnaround time, communication quality, and repair quality.",
    conditions: "Identical level 9 screen damage, official manufacturer mail-in service channels only, 1-month observation period.",
    protocol: "1. Document baseline level 9 display damage. 2. Initiate official mail-in repair request online. 3. Ship device using manufacturer-provided packaging. 4. Track notification intervals and payment portal responsiveness. 5. Inspect returned unit under 10x magnification for display seam tightness, adhesive residue, and touch digitizer calibration.",
    measurements: {
      apple: {
        device: "iPhone 17 Pro Max",
        cost: "$600",
        turnaround: "2 days",
        quality: "Pristine",
        communication: "Proactive texts/calls",
        issues: "None"
      },
      samsung: {
        device: "Galaxy S26 Ultra",
        cost: "$289–$300",
        turnaround: "~1 month",
        quality: "Pristine",
        communication: "Text updates only",
        issues: "Critical admin failure"
      }
    },
    results: "Apple completed repair in 2 days at $600 with pristine quality and proactive communication. Samsung took ~1 month ($289–$300) due to a 14-day administrative failure where an incorrect email address delayed the payment link, requiring a full re-dispatch, though physical repair quality was also pristine.",
    observations: [
      "Critical Failure — Samsung Admin Error: Samsung wrote the email address incorrectly and sent no payment link. After 14 days, the phone was returned unrepaired. The process had to restart entirely, wasting an additional 14 days.",
      "Repair Quality Was Identical: Both phones returned pristine — screen tight, crystal clean, polished. Quality is not the differentiator. Process, speed, and communication are.",
      "Apple's Premium Delivers Velocity: Apple delivered in 48 hours with proactive customer alerts, whereas Samsung's logistical friction erased its 50% price advantage."
    ],
    limitations: "📋 n=1 per brand — single case, not a statistical sample",
    verdict: "Winner: Apple. Apple charges double ($600 vs $300) but delivers in 2 days with zero friction. Samsung's administrative failure erased every cost advantage. When repair quality is equal, execution determines the winner.",
    devices: ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"],
    sources: ["WDIII Experiment 1 Empirical Testing Log", "Apple Support Official Repair Invoice", "Samsung Care+ Repair Ticket"],
    tags: ["1 month duration", "Level 9 screen damage", "Official channels only"],
    scope: "📋 n=1 per brand — single case, not a statistical sample",
    search: "exp-1 apple samsung repair mail-in screen damage",
    toc: [
      { id: "exp1-comparison", label: "Comparison" },
      { id: "exp1-findings", label: "Key Findings" },
      { id: "exp1-conclusion", label: "Conclusion" }
    ],
    relatedExperiments: [
      { id: "exp2", label: "⚙️ Also see: Experiment 2 — Repair Channel Tiers" },
      { id: "exp6", label: "🏪 Also see: Experiment 6 — AASP Repair Test" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp2",
    experimentNumber: "2",
    title: "Experiment 2: Repair Channel Comparison",
    category: "repair",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "How do Official Apple, Apple Authorized Service Providers (AASP), and Independent Third-Party repair channels compare across pricing, turnaround time, part authenticity, and warranty coverage?",
    objective: "Benchmark 3 identical iPhone 15 units with cracked screens repaired through 3 distinct repair channel tiers to identify trade-offs in cost, turnaround, part quality, and post-repair warranty.",
    methodology: "Three identical iPhone 15 units with cracked screens repaired through: Tier 1 (Official Apple Store), Tier 2 (Apple Authorized Service Provider / AASP), Tier 3 (Independent Third-Party Shop).",
    conditions: "Identical iPhone 15 hardware, identical cracked screen severity, same metropolitan geographic market.",
    protocol: "1. Baseline diagnostic verification on 3 units. 2. Submit to Tier 1, Tier 2, and Tier 3 simultaneously. 3. Log quotes, diagnostic fees, repair durations, and part serialized pairing screens. 4. Verify post-repair true tone, display serialization flags, and physical seal pressure tolerance.",
    measurements: {
      tier1: { channel: "Official Apple", cost: "$279", turnaround: "2 hours", parts: "OEM serialized", warranty: "90 days Apple" },
      tier2: { channel: "AASP (Best Buy)", cost: "$279", turnaround: "Same day", parts: "OEM serialized", warranty: "90 days Apple" },
      tier3: { channel: "Third-Party Shop", cost: "$149", turnaround: "45 mins", parts: "Aftermarket OLED", warranty: "30 days shop" }
    },
    results: "Tier 1 and Tier 2 provide identical genuine OEM parts and official calibration with 90-day Apple warranty at $279. Tier 3 saved 46% ($149) with 45-minute turnaround, but introduced non-genuine display warnings in iOS settings and lacked factory water-seal re-pressurization.",
    observations: [
      "AASP equals Apple Store for common repairs when parts are in stock.",
      "Third-party repair is viable for budget-conscious users but forfeits display serialization and water-resistance certification.",
      "True Tone loss occurs in third-party repair unless the shop uses EEPROM programmer tools."
    ],
    limitations: "Single geographic market, iPhone 15 platform only.",
    verdict: "For devices under warranty or AppleCare+, Tier 1 or Tier 2 is mandatory. For out-of-warranty older models, Tier 3 offers strong cost efficiency if aftermarket screen trade-offs are accepted.",
    devices: ["apple-iphone-15"],
    sources: ["WDIII Repair Channel Empirical Log", "Apple Repair Pricing Matrix", "Independent Shop Invoices"],
    tags: ["iPhone 15", "Screen Repair", "AASP vs Third-Party"],
    scope: "3 identical iPhone 15 units tested simultaneously",
    search: "exp-2 repair channel comparison aasp apple third-party",
    toc: [
      { id: "exp2-tiers", label: "Channel Tiers" },
      { id: "exp2-findings", label: "Trade-off Matrix" },
      { id: "exp2-conclusion", label: "Recommendation" }
    ],
    relatedExperiments: [
      { id: "exp1", label: "📦 Experiment 1 — Apple vs Samsung Mail-In" },
      { id: "exp6", label: "🏪 Experiment 6 — AASP Repair Test (iFix)" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp3",
    experimentNumber: "3",
    title: "Experiment 3: Customer Service Quality Test",
    category: "support",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "Which major smartphone manufacturers provide accessible, free, and knowledgeable first-party customer support when an end user calls with a technical issue?",
    objective: "Evaluate the accessibility, hold times, technical competency, and barrier-to-entry of customer support channels across 8 smartphone manufacturers.",
    methodology: "Standardized troubleshooting scenario presented to telephone support representatives across Apple, Samsung, Google, Huawei, Xiaomi, OPPO, OnePlus, Vivo, and BlackBerry.",
    conditions: "Same script used for all calls: simulated network connectivity drops and battery drain diagnostic inquiries during standard business hours.",
    protocol: "1. Initiate telephone call to primary official customer care line. 2. Measure hold time until live agent answers. 3. Present standardized technical scenario. 4. Score agent knowledge, willingness to help, and follow-up resources. 5. Document any paywalls or barrier gates.",
    measurements: {
      apple: { rating: "4.0 / 5", wait: "3 mins", agent: "Knowledgeable", cost: "Free" },
      huawei: { rating: "4.5 / 5", wait: "1 min", agent: "Exceptional", cost: "Free (Co-Winner)" },
      xiaomi: { rating: "4.5 / 5", wait: "2 mins", agent: "Exceptional", cost: "Free (Co-Winner)" },
      oppo: { rating: "3.5 / 5", wait: "5 mins", agent: "Helpful", cost: "Free" },
      oneplus: { rating: "3.0 / 5", wait: "8 mins", agent: "Scripted", cost: "Free" },
      vivo: { rating: "1.0 / 5", wait: "N/A", agent: "Email only", cost: "No live phone" },
      blackberry: { rating: "0.0 / 5", wait: "Instant", agent: "Paywall gate", cost: "Paid support code required" }
    },
    results: "Huawei and Xiaomi tied for top customer service quality (4.5★) with rapid live pickups and thorough technical troubleshooting. BlackBerry scored 0★ by demanding upfront payment to speak with an agent. Vivo provided no phone support option in the test region.",
    observations: [
      "Huawei and Xiaomi proved that cost-effective brands can deliver first-rate phone support.",
      "BlackBerry's paywalled consumer support model is completely hostile to users.",
      "Apple delivered consistent, high-standard phone support but took longer to escalate complex issues."
    ],
    limitations: "Sample based on North American and European support numbers during weekday hours.",
    verdict: "Winners: Huawei & Xiaomi. Both provide fast, free, and competent phone support without automated labyrinth loops or fees.",
    devices: [
      "huawei-support-test-unit",
      "xiaomi-support-test-unit",
      "oppo-support-test-unit",
      "oneplus-support-test-unit",
      "vivo-support-test-unit",
      "blackberry-support-test-unit"
    ],
    sources: ["WDIII Support Audio Logs", "Call Duration Metadata", "Support Ticket Transcripts"],
    tags: ["Customer Service", "Phone Support", "8 Brands Tested"],
    scope: "8 manufacturers evaluated under identical script conditions",
    search: "exp-3 customer service support quality phone test",
    toc: [
      { id: "exp3-leaderboard", label: "Leaderboard" },
      { id: "exp3-findings", label: "Analysis" },
      { id: "exp3-paywalls", label: "Paywall Audit" }
    ],
    relatedExperiments: [
      { id: "exp1", label: "📦 Experiment 1 — Apple vs Samsung Mail-In" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp4",
    experimentNumber: "4",
    title: "Experiment 4: iOS Performance Comparison (Historical)",
    category: "software",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "Does upgrading an iPhone through successive major iOS revisions degrade real-world app launch times, Geekbench compute scores, or thermal throttling thresholds?",
    objective: "Track benchmark and real-world performance metrics across major iOS versions on the same hardware.",
    methodology: "iPhone 15 Pro tested across iOS 17.0 baseline, iOS 18.0, and historical comparative points. Geekbench 6 single/multi-core, Metal GPU compute, 3DMark Wild Life Stress, and standardized 10-app opening speed runs.",
    conditions: "Room temperature 22°C, 100% battery charge on AC power, identical background application state.",
    protocol: "1. Clean restore via DFU mode. 2. Complete initial indexing for 24 hours. 3. Execute 5 consecutive Geekbench 6 runs with 10-minute cool-down intervals. 4. Record thermal surface temperatures with FLIR camera. 5. Measure cold app launch latency using 240fps high-speed camera.",
    measurements: {
      geekbenchSingleCore: { "iOS 17.0": 2915, "iOS 18.0": 2940, "iOS 18.6": 2955 },
      geekbenchMultiCore: { "iOS 17.0": 7240, "iOS 18.0": 7290, "iOS 18.6": 7320 },
      appLaunchRunTime: { "iOS 17.0": "18.4s", "iOS 18.0": "18.2s", "iOS 18.6": "18.1s" },
      thermalPeak: { "iOS 17.0": "41.2°C", "iOS 18.0": "39.8°C", "iOS 18.6": "39.4°C" }
    },
    results: "No planned obsolescence degradation observed. Performance scores remained consistent (+0.5% to +1.2% variation within margin of error). iOS 18 showed improved thermal regulation during sustained compute workloads.",
    observations: [
      "Thermal dispatch improved after iOS 18.1, keeping peak chassis temperature ~1.8°C cooler.",
      "Background indexing immediately post-update causes temporary battery/thermal hits for 24-48 hours, often mistaken by consumers for permanent slowdowns."
    ],
    limitations: "Single iPhone generation hardware cycle (A17 Pro).",
    verdict: "Modern iOS updates on flagship Apple silicon do not degrade computational performance. Perception of slowdown is tied to temporary post-update file indexing and battery chemical aging.",
    devices: ["apple-iphone-15-pro"],
    sources: ["Geekbench 6 Database Export", "FLIR Thermal Capture Logs", "High-Speed Camera Timings"],
    tags: ["iOS Performance", "Geekbench", "Thermal Analysis"],
    scope: "iPhone 15 Pro tracked through 3 OS update milestones",
    search: "exp-4 ios performance comparison historical benchmarks",
    toc: [
      { id: "exp4-benchmarks", label: "Benchmarks" },
      { id: "exp4-thermals", label: "Thermal Analysis" },
      { id: "exp4-conclusion", label: "Conclusions" }
    ],
    relatedExperiments: [
      { id: "exp5", label: "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone" },
      { id: "queued-exp10", label: "⏳ Queued Exp 10 — iOS 26 vs iOS 27 Survey" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "casestudy",
    experimentNumber: "CS-01",
    title: "Case Study: Samsung Battery Failures & Corporate Accountability",
    category: "legal",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "Does Samsung hardware exhibit a systemic, multi-generation lithium-ion battery swelling pattern in long-term storage compared to other brands, and how does corporate warranty support respond?",
    objective: "Document battery swelling across Samsung Galaxy devices stored under controlled conditions, evaluate safety risks, and audit Samsung corporate liability responses including CPSC complaint filings.",
    methodology: "Long-term climate-controlled storage analysis of 7 Samsung devices alongside non-Samsung controls (iPhone 5c). Documentation of battery pouch delamination, casing separation, and corporate dispute resolution records.",
    conditions: "Storage temperature 20°C–23°C, 40%–50% relative humidity, battery state of charge 40%–60% at initial storage.",
    protocol: "1. Place devices in certified flame-retardant storage enclosure. 2. Periodic physical inspection for back cover lifting. 3. Caliper measurement of battery pouch thickness expansion. 4. Escalate failed units through Samsung corporate customer advocacy. 5. File formal documentation with Consumer Product Safety Commission (CPSC).",
    measurements: {
      swollenUnits: [
        { model: "Galaxy S20 FE", timeline: "18 months", failure: "Severe expansion, back glass unglued" },
        { model: "Galaxy S8", timeline: "36 months", failure: "Pouch ballooning, frame split" },
        { model: "Galaxy S10", timeline: "28 months", failure: "Casing bowed" },
        { model: "Galaxy S10e", timeline: "30 months", failure: "Rear panel separated" },
        { model: "Galaxy Note 8 (Unit A)", timeline: "40 months", failure: "Battery puffed" },
        { model: "Galaxy Note 8 (Unit B)", timeline: "44 months", failure: "Critical pouch split" },
        { model: "Galaxy Z Fold 2", timeline: "24 months", failure: "Back glass pushed off" }
      ],
      controlUnits: [
        { model: "iPhone 5c", timeline: "10+ years", failure: "Zero swelling, casing intact" }
      ],
      corporateResponse: "Refused out-of-warranty coverage; demanded inspection fee; denied systemic defect."
    },
    results: "7 out of 7 stored pre-2021 Samsung units suffered severe battery swelling and casing rupture. The 2013 iPhone 5c control unit exhibited zero swelling under identical climate conditions. Samsung refused corporate accountability, classifying hazardous battery expansion as ordinary wear.",
    observations: [
      "Failure Pattern: Battery swelling is concentrated in Samsung SDI cell formulations manufactured between 2016 and 2020.",
      "Post-2021 Control Check: Newer Galaxy models (S21 through S25) show improved electrolyte stability thus far.",
      "Corporate Response Deficit: Samsung treats severe battery delamination as an out-of-warranty cosmetic defect rather than a safety hazard."
    ],
    limitations: "Focuses on storage behavior; active daily cycling may alter swelling trajectory.",
    verdict: "A documented, empirical safety failure pattern exists in pre-2021 Samsung Galaxy batteries stored in dormant conditions. Samsung's corporate refusal to replace hazardous cells violates consumer protection standards.",
    devices: [
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
    sources: ["WDIII Physical Inspection Logs", "CPSC Official Report #2023-098", "Samsung Service Tickets"],
    tags: ["Battery Swelling", "Samsung SDI", "CPSC Complaint", "Safety Analysis"],
    scope: "7 Samsung units + control devices tracked over 4+ years",
    search: "case study samsung battery failures swelling cpsc corporate",
    toc: [
      { id: "cs-timeline", label: "Failure Timeline" },
      { id: "cs-evidence", label: "Physical Evidence" },
      { id: "cs-corporate", label: "Corporate Response" },
      { id: "cs-cpsc", label: "CPSC Findings" }
    ],
    relatedExperiments: [
      { id: "exp1", label: "📦 Experiment 1 — Apple vs Samsung Mail-In" },
      { id: "exp5", label: "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp5",
    experimentNumber: "5",
    title: "Experiment 5: Battery Life — Google Pixel Pro vs iPhone",
    category: "hardware",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "How do 5 generations of Google Pixel Pro (Pixel 6 Pro through 10 Pro) compare against contemporary iPhone hardware in standardized, multi-workload battery endurance tests?",
    objective: "Execute a controlled, empirical battery drain test comparing Google Pixel Pro generations against iPhone flagships across video streaming, social browsing, gaming, and 5G cellular web tests.",
    methodology: "Automated test suite cycling YouTube 1080p, Instagram scrolling, Geekbench compute loops, and 5G web surfing. All displays calibrated to exactly 200 nits with a Klein K10-A colorimeter. Ambient temperature maintained at 21.5°C.",
    conditions: "Calibrated 200 nits display brightness, Wi-Fi 6 / 5G sub-6 connection, 100% battery health baseline, identical audio volume via Bluetooth headset.",
    protocol: "1. Charge all devices to 100% and float for 30 minutes. 2. Calibrate screen brightness with spectrophotometer. 3. Start synchronized workload loop. 4. Log battery percentage drop every 15 minutes. 5. Record shutdown time and calculate total Screen-on-Time (SoT).",
    measurements: {
      "Pixel 6 Pro": "6 hrs 12 mins",
      "Pixel 7 Pro": "6 hrs 45 mins",
      "Pixel 8 Pro": "7 hrs 22 mins",
      "Pixel 9 Pro": "8 hrs 40 mins",
      "Pixel 10 Pro": "10 hrs 15 mins",
      "iPhone 13 (Baseline)": "7 hrs 30 mins",
      "iPhone 15 Pro": "8 hrs 10 mins",
      "iPhone 16e": "8 hrs 50 mins"
    },
    results: "Google Pixel 10 Pro (TSMC Tensor G5) achieved 10 hrs 15 mins SoT, dominating all earlier Tensor generations and outlasting iPhone 15 Pro by over 2 hours. Older Samsung Foundry Tensor chips (Tensor G1 & G2) lagged significantly behind contemporary iPhones in power efficiency.",
    observations: [
      "The TSMC switch on Tensor G5 provided a massive 18% efficiency leap over Tensor G4 and 65% over Tensor G1.",
      "Pixel 6 Pro and 7 Pro suffered higher cellular standby drain due to early Samsung Exynos modems.",
      "iPhone 16e demonstrated impressive endurance for a compact device with Apple's in-house modem."
    ],
    limitations: "Conducted under lab Wi-Fi/5G mixed conditions; extreme outdoor cold/heat may alter rankings.",
    verdict: "Winner: Google Pixel 10 Pro. The transition to TSMC silicon solved Pixel's historic battery disadvantage, crowning the Pixel 10 Pro as the endurance champion.",
    devices: [
      "google-pixel-6-pro",
      "google-pixel-7-pro",
      "google-pixel-8-pro",
      "google-pixel-9-pro",
      "google-pixel-10-pro",
      "apple-iphone-13",
      "apple-iphone-15-pro",
      "apple-iphone-16e"
    ],
    sources: ["WDIII Automated Battery Benchmark Suite", "Klein K10-A Calibration Logs", "Hardware Telemetry Dumps"],
    tags: ["Battery Life", "Pixel vs iPhone", "SoT Benchmark", "TSMC vs Samsung Silicon"],
    scope: "8 devices tested concurrently across 4 standardized workload phases",
    search: "exp-5 battery life google pixel pro iphone endurance drain",
    toc: [
      { id: "exp5-results", label: "Results Table" },
      { id: "exp5-analysis", label: "Efficiency Curves" },
      { id: "exp5-verdict", label: "Final Verdict" }
    ],
    relatedExperiments: [
      { id: "exp7", label: "📱 Experiment 7 — Pixel Generation Comparison" },
      { id: "fa02", label: "🔄 FA-02 — One Month Out of Apple" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp6",
    experimentNumber: "6",
    title: "Experiment 6: AASP Repair Test — iFix",
    category: "repair",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "Does an Apple Authorized Service Provider (iFix / Best Buy AASP) maintain the same repair quality, calibration standards, and turnaround promises as a first-party Apple Store?",
    objective: "Audit the end-to-end customer experience, repair turnaround, diagnostic accuracy, and hardware calibration of an Apple Authorized Service Provider on a cracked iPhone 16 Pro Max.",
    methodology: "Real-world cracked display walk-in repair submitted to certified AASP franchise location. Contributor MTA documented booking, intake diagnostics, repair duration, and post-repair calibration validation.",
    conditions: "Cracked outer display glass on iPhone 16 Pro Max, genuine Apple repair tier, walk-in appointment.",
    protocol: "1. Schedule through Apple Support portal. 2. Record check-in intake inspection. 3. Monitor repair turnaround against estimate. 4. Verify Apple System Configuration serial calibration. 5. Inspect display bezel gaps and digitizer touch sample rate.",
    measurements: {
      intakeWait: "12 mins",
      repairDuration: "2 hours 15 mins",
      cost: "$379 (Official Apple Rate)",
      systemConfigStatus: "Passed (Genuine Display Detected)",
      seamUniformity: "0.1mm tolerance (Factory Spec)"
    },
    results: "AASP completed repair within 2 hours and 15 minutes using genuine Apple parts and Apple System Configuration cloud pairing. Repair was indistinguishable from an Apple Store Genius Bar repair.",
    observations: [
      "OEM calibration successfully cleared all 'Unknown Part' flags in iOS.",
      "Turnaround was 30 minutes longer than original estimate due to Apple cloud calibration queue delays.",
      "Customer service was professional and adhered strictly to Apple official repair checklists."
    ],
    limitations: "Single AASP franchise location.",
    verdict: "Approved. AASPs provide a viable, official alternative to Apple Stores in regions lacking first-party retail presence.",
    devices: ["apple-iphone-16-pro-max"],
    sources: ["WDIII Contributor MTA Field Report", "Apple System Configuration Diagnostics Log", "iFix Work Order #8821"],
    tags: ["AASP", "iFix", "iPhone 16 Pro Max", "Display Repair"],
    scope: "Full walk-in repair audit on flagship hardware",
    search: "exp-6 aasp repair test ifix authorized service provider",
    toc: [
      { id: "exp6-timeline", label: "Intake & Timeline" },
      { id: "exp6-quality", label: "Hardware Inspection" },
      { id: "exp6-verdict", label: "AASP Verdict" }
    ],
    relatedExperiments: [
      { id: "exp1", label: "📦 Experiment 1 — Apple vs Samsung Mail-In" },
      { id: "exp2", label: "⚙️ Experiment 2 — Repair Channel Tiers" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp7",
    experimentNumber: "7",
    title: "Experiment 7: Google Pixel Pro Generation Comparison",
    category: "hardware",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "How has Google's flagship hardware progressed from Pixel 6 Pro to Pixel 10 Pro across thermal dissipation, sustained compute, modem reliability, and camera zoom fidelity?",
    objective: "Conduct a comprehensive generational review of Google Pixel Pro smartphones (6 Pro, 7 Pro, 8 Pro, 9 Pro, and 10 Pro) to map the evolution of Google's custom Tensor silicon and industrial design.",
    methodology: "Side-by-side evaluation of 5 Pixel Pro generations across camera telephoto zoom at 10x/30x/100x, Geekbench compute stress loops, cellular signal reception in weak-coverage zones, and display outdoor peak brightness.",
    conditions: "All devices running current available OS versions, room temp 22°C, identical Wi-Fi 6 / 5G test carriers.",
    protocol: "1. Camera: Capture standardized outdoor urban scene at 1x, 5x, 10x, 30x, and 100x. 2. Thermals: Run 30-minute 3DMark Wild Life Extreme stress test with thermal imaging. 3. Cellular: Measure dBm signal strength and packet loss in RF-shielded chamber. 4. Display: Measure full-screen sustained lux outdoors.",
    measurements: {
      "Pixel 6 Pro": { chip: "Tensor G1", modem: "Exynos 5123", thermals: "Hot (44°C)", zoomMax: "20x", stability: "72%" },
      "Pixel 7 Pro": { chip: "Tensor G2", modem: "Exynos 5300", thermals: "Warm (42°C)", zoomMax: "30x", stability: "78%" },
      "Pixel 8 Pro": { chip: "Tensor G3", modem: "Exynos 5300", thermals: "Warm (41°C)", zoomMax: "30x", stability: "82%" },
      "Pixel 9 Pro": { chip: "Tensor G4", modem: "Exynos 5400", thermals: "Cool (38°C)", zoomMax: "30x", stability: "89%" },
      "Pixel 10 Pro": { chip: "Tensor G5", modem: "TSMC Custom", thermals: "Cool (36°C)", zoomMax: "100x", stability: "96%" }
    },
    results: "Google's 5-generation trajectory shows dramatic silicon maturation. The jump from Pixel 6 Pro (Samsung Tensor G1) to Pixel 10 Pro (TSMC Tensor G5) resolved thermal throttling, doubled zoom reach, and eliminated dropped calls in weak reception areas.",
    observations: [
      "Pixel 6 Pro suffered severe modem disconnects in fringe areas; Pixel 9 Pro and 10 Pro exhibited zero dropped packets.",
      "The 100x Pro Res Zoom on Pixel 10 Pro leverages generative super-resolution for readable text at extreme distances.",
      "Vapor chamber cooling introduced in Pixel 9 Pro and refined in 10 Pro prevented thermal degradation during long 4K60 video recording."
    ],
    limitations: "Pixel 6 Pro battery capacity degraded slightly due to age relative to newer review units.",
    verdict: "Pixel 10 Pro represents the definitive maturity point of Google's flagship hardware vision, finally achieving thermal and computational parity with top industry competitors.",
    devices: [
      "google-pixel-6-pro",
      "google-pixel-7-pro",
      "google-pixel-8-pro",
      "google-pixel-9-pro",
      "google-pixel-10-pro"
    ],
    sources: ["WDIII Pixel Generational Benchmark Archive", "RF Chamber Telemetry Logs", "Camera Image RAW Analysis"],
    tags: ["Google Pixel", "Tensor Silicon", "Hardware Evolution", "Telephoto Zoom"],
    scope: "5 consecutive generations of flagship Google devices tested side-by-side",
    search: "exp-7 google pixel pro generation comparison tensor camera zoom",
    toc: [
      { id: "exp7-silicon", label: "Silicon Evolution" },
      { id: "exp7-camera", label: "Zoom & Imaging" },
      { id: "exp7-connectivity", label: "Modem & RF" },
      { id: "exp7-conclusion", label: "Generational Verdict" }
    ],
    relatedExperiments: [
      { id: "exp5", label: "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone" },
      { id: "fa02", label: "🔄 FA-02 — One Month Out of Apple" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "exp9",
    experimentNumber: "9",
    title: "Experiment 9: Comprehensive Apple Ecosystem Security Audit",
    category: "software",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "What attack vectors, telemetry leaks, and permission bypasses exist across macOS, iOS, iCloud, and AirDrop in default consumer configurations?",
    objective: "Conduct an end-to-end security and privacy audit of default Apple ecosystem configurations, evaluating network telemetry, AirDrop vulnerability exposure, and iCloud Advanced Data Protection resilience.",
    methodology: "Packet capture with Wireshark on isolated gateway router, Bluetooth low-energy packet sniffing during AirDrop discovery, and penetration testing on iCloud keychain synchronization with and without Advanced Data Protection.",
    conditions: "Isolated VLAN network, default consumer Apple ID configurations, macOS Sonoma & iOS 18 test units.",
    protocol: "1. Capture 72 hours of idle background telemetry packets. 2. Sniff BLE broadcast frames during AirDrop 'Everyone' and 'Contacts Only' states. 3. Test sandbox escape mitigations in Safari WebKit. 4. Verify end-to-end encryption keys under iCloud ADP.",
    measurements: {
      telemetryHostsContacted: "42 distinct Apple domains",
      airDropHashLeak: "Partial phone/email SHA256 hashes broadcast in BLE advertise packets",
      cloudADPEncryptionCoverage: "98% of data types encrypted (excluding metadata, mail, contacts, calendar)",
      gatekeeperBypassResistance: "High (quarantine attributes enforced)"
    },
    results: "Apple maintains industry-leading default endpoint security and sandbox isolation. However, AirDrop discovery broadcasts truncated cryptographic hashes of user phone numbers and emails, and default iCloud backups (without ADP enabled) allow Apple legal access to iMessage encryption keys.",
    observations: [
      "AirDrop Hash Leakage: Passive BLE sniffers in public areas can harvest contact hashes to de-anonymize commuters.",
      "Advanced Data Protection (ADP) is essential: Default iCloud backup leaves message keys vulnerable to subpoena compliance.",
      "Background Telemetry: Apple devices ping analytics servers up to 600 times per hour even with analytics opt-outs checked."
    ],
    limitations: "Tests conducted on consumer production firmware; internal diagnostic modes not evaluated.",
    verdict: "Apple provides robust consumer security, but privacy requires manual user intervention: users must enable Advanced Data Protection and set AirDrop to 'Contacts Only' or 'Off'.",
    devices: ["apple-iphone-15-pro", "apple-macbook-air-m3-2024"],
    sources: ["WDIII Security Lab Packet Captures", "Wireshark Trace Dumps", "Apple Security Whitepaper Verification"],
    tags: ["Apple Security", "AirDrop Vulnerability", "iCloud ADP", "Privacy Audit"],
    scope: "Cross-device ecosystem audit covering network, Bluetooth, and cloud layers",
    search: "exp-9 apple ecosystem security audit airdrop privacy icloud",
    toc: [
      { id: "exp9-network", label: "Network Telemetry" },
      { id: "exp9-airdrop", label: "AirDrop BLE Audit" },
      { id: "exp9-cloud", label: "iCloud ADP Analysis" },
      { id: "exp9-recommendations", label: "Security Hardening Guide" }
    ],
    relatedExperiments: [
      { id: "queued-exp8", label: "🔒 Queued Exp 8 — Ecosystem Reliability Protocol" },
      { id: "fa02", label: "🔄 FA-02 — One Month Out of Apple" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "queued-exp8",
    experimentNumber: "8",
    title: "Queued Experiment 8: Cross-Platform Ecosystem Reliability & Hardware Longevity Protocol",
    category: "ecosystem",
    status: "queued",
    statusLabel: "Queued",
    origin: "official_wdiii",
    researchQuestion: "How do interconnected devices from Apple, Google, and Samsung maintain sync integrity, peripheral handoff, and hardware reliability over an extended 24-month lifecycle?",
    objective: "Formalize the multi-year protocol for tracking cross-device ecosystem handoff failures, Bluetooth peripheral synchronization drifts, and hardware mechanical degradation across 3 rival ecosystems.",
    methodology: "Tri-ecosystem testing grid pairing phone + laptop + smartwatch + earbuds for Apple, Google, and Samsung under synchronized daily usage scripts.",
    conditions: "24-month observation horizon, automated daily sync logging, periodic sensor drift calibration checks.",
    protocol: "1. Deploy 3 complete hardware suites (Apple, Google, Samsung). 2. Execute 100 clipboard and handoff transfers daily. 3. Monitor notifications delivery latency across paired smartwatches. 4. Track battery wear degradation curves at 6, 12, 18, and 24 months.",
    measurements: null,
    results: "Testing protocol formalized and queued. Baseline telemetry servers active.",
    observations: [
      "Hardware cohorts acquired and cataloged in WDIII Tech Vault repository.",
      "Automated notification latency probes configured on dedicated gateway."
    ],
    limitations: "Long-duration lifecycle study currently in setup phase.",
    verdict: "Protocol approved by research board. Testing commencing upon hardware cohort burn-in.",
    devices: [
      "apple-iphone-15-pro",
      "google-pixel-10-pro",
      "samsung-galaxy-s26-ultra",
      "apple-macbook-air-m3-2024"
    ],
    sources: ["WDIII Protocol RFC-088", "Ecosystem Reliability Test Definition v1.0"],
    tags: ["Ecosystem Protocol", "Hardware Longevity", "Queued Study"],
    scope: "24-month multi-device tracking protocol across 3 major ecosystems",
    search: "exp-8 queued cross-platform ecosystem reliability protocol",
    toc: [
      { id: "q8-scope", label: "Protocol Scope" },
      { id: "q8-methodology", label: "Testing Grid" },
      { id: "q8-schedule", label: "Execution Milestones" }
    ],
    relatedExperiments: [
      { id: "exp9", label: "🔒 Experiment 9 — Apple Ecosystem Security Audit" },
      { id: "fa02", label: "🔄 FA-02 — One Month Out of Apple" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "queued-exp10",
    experimentNumber: "10",
    title: "Queued Experiment 10: Year-Long iOS 26 vs iOS 27 Data Survey",
    category: "software",
    status: "queued",
    statusLabel: "Queued",
    origin: "official_wdiii",
    researchQuestion: "Does multi-year data support consumer claims that next-generation major iOS updates introduce cumulative battery wear and UI frame rate drops?",
    objective: "Execute a longitudinal 365-day quantitative survey measuring app startup latency, background battery drain, and thermal throttling across consecutive major iOS releases.",
    methodology: "Dual-device control setup running automated nightly telemetry captures, Geekbench compute logs, and UI frametime recordings using Xcode Instruments.",
    conditions: "Identical iPhone hardware batches, controlled ambient lab environment, identical network loads.",
    protocol: "1. Lock baseline iPhone units to iOS 26.x and upgrade companion units to iOS 27.x. 2. Run automated nightly 10-app launch cycle. 3. Record standby battery loss percentage over 8-hour sleep window. 4. Track dropped display frames with Quartz Debugger.",
    measurements: null,
    results: "Protocol queued awaiting release milestone.",
    observations: [
      "Initial calibration scripts verified on iOS 18 / iOS 26 test harnesses."
    ],
    limitations: "Pending release schedule.",
    verdict: "Awaiting next major operating system release window.",
    devices: ["apple-iphone-15-pro", "apple-iphone-17-pro-max"],
    sources: ["WDIII Protocol RFC-102", "Xcode Instruments Test Harness"],
    tags: ["iOS Longitudinal", "Software Performance", "Queued Survey"],
    scope: "365-day multi-device longitudinal data collection",
    search: "exp-10 queued year-long ios survey performance battery",
    toc: [
      { id: "q10-protocol", label: "Survey Protocol" },
      { id: "q10-metrics", label: "Telemetry Points" }
    ],
    relatedExperiments: [
      { id: "exp4", label: "📈 Experiment 4 — Historical iOS Performance" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "fa01",
    experimentNumber: "FA-01",
    title: "FA-01 — Which AI Builds Our Website Best?",
    category: "ai",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "How do contemporary frontier AI coding models perform when tasked with generating a production-grade, responsive consumer technology research website with complex data tables and interactive charts?",
    objective: "Benchmark frontier AI coding models on prompt adherence, code cleanliness, responsive design, architectural elegance, and bug density when building the WDIII Tech Vault web platform.",
    methodology: "Identical prompt specification fed into Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro. Code output evaluated for HTML semantic validity, CSS responsiveness, JavaScript error rate, and component modularity.",
    conditions: "Single-prompt zero-shot generation followed by a single iterative refinement prompt across all three models.",
    protocol: "1. Submit standardized prompt specification with data requirements. 2. Capture raw generated code. 3. Validate code in headless Chromium browser for rendering errors. 4. Score typography, responsive breakpoints, data presentation, and dark mode contrast.",
    measurements: {
      "Claude 3.5 Sonnet": { score: "9.2 / 10", errors: 0, layout: "Superb typography and responsive layout" },
      "GPT-4o": { score: "8.4 / 10", errors: 1, layout: "Clean UI but generic component styling" },
      "Gemini 1.5 Pro": { score: "8.1 / 10", errors: 2, layout: "Functional but required syntax corrections" }
    },
    results: "Claude 3.5 Sonnet generated the most visually sophisticated and error-free single-page research layout with complete data tables and responsive navigation. All models successfully understood the research vault domain.",
    observations: [
      "Frontier models are fully capable of generating intricate, non-trivial documentation portals.",
      "Clear prompt framing regarding typography and layout hierarchy prevents generic AI design clichés."
    ],
    limitations: "Single project benchmark prompt; multi-turn agentic coding workflows not tested in this phase.",
    verdict: "Winner: Claude 3.5 Sonnet. Delivered the highest code quality, cleanest component architecture, and most refined aesthetic.",
    devices: [],
    sources: ["WDIII AI Evaluation Benchmark Log", "Model Response Transcripts", "Chromium Render Traces"],
    tags: ["AI Coding", "Model Benchmark", "Web Development"],
    scope: "3 frontier AI models evaluated on identical web application specifications",
    search: "fa-01 which ai builds website best coding models",
    toc: [
      { id: "fa01-comparison", label: "Model Comparison" },
      { id: "fa01-code", label: "Code Quality Audit" },
      { id: "fa01-verdict", label: "Benchmark Leaderboard" }
    ],
    relatedExperiments: [],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "fa02",
    experimentNumber: "FA-02",
    title: "FA-02 — One Month Out of the Apple Ecosystem",
    category: "ecosystem",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "Can an Apple ecosystem power user transition entirely to Android (Pixel 10 Pro) and Windows (HP Victus) for 30 days without critical productivity or communication friction?",
    objective: "Document the empirical friction, workarounds, workflow shifts, and benefits of migrating 100% of daily digital tasks from Apple hardware to Android and Windows for 30 consecutive days.",
    methodology: "Lead researcher archived all Apple hardware (iPhone 16e, MacBook Pro, Apple Watch, AirPods Max) and transitioned to Google Pixel 10 Pro, HP Victus laptop (Windows 11), Pixel Watch, and Sony WH-1000XM5.",
    conditions: "30 consecutive days, full professional workload including coding, document drafting, photo editing, and messaging.",
    protocol: "1. Migrate iCloud data to Google Workspace and OneDrive. 2. Set up RCS messaging on carrier network. 3. Log daily friction points in 5 categories: Handoff, Messaging, Hardware Quality, Battery Life, and App Parity. 4. Score overall transition viability.",
    measurements: {
      messagingFriction: "Low (RCS enabled seamless high-res media with iOS contacts)",
      laptopBatteryDelta: "-3.5 hrs (Windows laptop battery life lagged MacBook)",
      fileTransferFriction: "Medium (Quick Share on Windows required manual pairing)",
      customizationGain: "High (Android notification triage & split-screen multi-tasking superior)"
    },
    results: "Transition was 85% seamless. Android's notification handling, Pixel camera performance, and RCS cross-platform messaging made phone departure effortless. The primary downgrade was Windows laptop battery life and trackpad ergonomics compared to MacBook hardware.",
    observations: [
      "iMessage Lock-in is Largely Broken: With RCS support on iOS 18+, cross-platform group chats, read receipts, and typing indicators functioned smoothly.",
      "Hardware Disparity: The Pixel 10 Pro matched or exceeded iPhone build quality, but finding a Windows laptop with MacBook Air silent thermal efficiency remains difficult."
    ],
    limitations: "Single researcher workflow; relies heavily on web-based SaaS tools.",
    verdict: "Viable and liberating. The Apple ecosystem is no longer an unbreakable walled garden. Phone transition is effortless; laptop migration requires careful hardware selection.",
    devices: [
      "google-pixel-10-pro",
      "hp-victus-15-fa2013dx",
      "apple-iphone-16e"
    ],
    sources: ["WDIII 30-Day Transition Diary", "Workflow Telemetry Log", "Cross-Platform Messaging Audit"],
    tags: ["Ecosystem Exit", "Android Migration", "Windows vs Mac", "Pixel 10 Pro"],
    scope: "30-day continuous field experiment replacing all personal and work devices",
    search: "fa-02 one month out of apple ecosystem android pixel windows",
    toc: [
      { id: "fa02-setup", label: "Hardware Setup" },
      { id: "fa02-messaging", label: "Messaging & Handoff" },
      { id: "fa02-hardware", label: "Hardware Comparison" },
      { id: "fa02-verdict", label: "Final Assessment" }
    ],
    relatedExperiments: [
      { id: "exp5", label: "🔋 Experiment 5 — Battery Life: Pixel Pro vs iPhone" },
      { id: "exp7", label: "📱 Experiment 7 — Pixel Generation Comparison" },
      { id: "fa03", label: "💻 FA-03 — 7 Years of Laptop Evolution" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  },
  {
    id: "fa03",
    experimentNumber: "FA-03",
    title: "FA-03 — Seven Years of Laptop Evolution: 2017 MacBook Air vs. 2024 M3 MacBook Air vs. Acer Aspire 14",
    category: "hardware",
    status: "done",
    statusLabel: "Done",
    origin: "official_wdiii",
    researchQuestion: "How has consumer laptop compute efficiency, battery longevity under load, display color accuracy, and thermal noise evolved over 7 years across Apple Silicon and contemporary Intel x86 architectures?",
    objective: "Benchmark 7 years of laptop evolution comparing a vintage 2017 Intel MacBook Air, a 2024 M3 MacBook Air, and a 2024 Intel Core Ultra Acer Aspire 14 across synthetic compute, real-world compiling, and thermal performance.",
    methodology: "Standardized suite: Geekbench 6 CPU/GPU, Cinebench R24 multi-core 10-minute throttle test, Chromium source compilation time, 150-nit YouTube 4K playback battery rundown, and sound level meter measurement at 30cm.",
    conditions: "Calibrated 150 nits display brightness, room temperature 21.5°C, AC power connected for compute runs, battery power for rundown.",
    protocol: "1. Display calibration with Datacolor SpyderX. 2. Run Geekbench 6 x3. 3. Execute 10-min Cinebench R24 loop; record thermal delta. 4. Measure decibel peak with Class 2 SPL meter. 5. Measure battery rundown to 0% shutdown.",
    measurements: {
      "2017 MacBook Air (Intel i5)": {
        cinebenchR24Multi: 112,
        batteryHours: "4 hrs 40 mins",
        noiseLevel: "46 dBA (loud fan whistle)",
        displayDeltaE: "4.8 (poor TN panel)"
      },
      "2024 MacBook Air (Apple M3)": {
        cinebenchR24Multi: 560,
        batteryHours: "15 hrs 20 mins",
        noiseLevel: "0 dBA (completely fanless)",
        displayDeltaE: "0.9 (reference Liquid Retina)"
      },
      "2024 Acer Aspire 14 (Intel Core Ultra 7)": {
        cinebenchR24Multi: 685,
        batteryHours: "8 hrs 45 mins",
        noiseLevel: "39 dBA (audible fan whir)",
        displayDeltaE: "1.4 (good sRGB IPS)"
      }
    },
    results: "Apple M3 delivered a 5x compute jump over 2017 Intel while operating in dead silence (0 dBA fanless) with more than triple the battery life (15.3 hrs vs 4.7 hrs). Intel's 2024 Core Ultra in the Acer Aspire delivered higher sustained peak multi-core power (685 pts) but required active cooling fans and surrendered nearly half its battery endurance.",
    observations: [
      "Fanless Revolution: M3's ability to maintain high sustained compute with zero mechanical noise represents the biggest ergonomic leap in laptop history.",
      "Display Evolution: The jump from 2017 TN panels (1440x900) to 2024 Liquid Retina (2560x1664) represents an enormous leap in ocular comfort and color accuracy.",
      "Intel Architecture Progress: Intel Core Ultra 7 has significantly narrowed the efficiency gap compared to older 14nm chips, but x86 still requires fans under sustained multi-thread loads."
    ],
    limitations: "Acer Aspire had 14-inch chassis vs 13.6-inch MacBook Air; differences in thermal dissipation volumes.",
    verdict: "Winner: 2024 M3 MacBook Air. It represents the pinnacle of everyday consumer portable computing, pairing desktop-class responsiveness with fanless silence and all-day battery life.",
    devices: [
      "apple-macbook-air-2017",
      "apple-macbook-air-m3-2024",
      "acer-aspire-14-2024"
    ],
    sources: ["WDIII Laptop Testing Archive 2017–2024", "Cinebench R24 Telemetry", "SpyderX Display Calibration Profiles"],
    tags: ["Laptop Evolution", "Apple M3", "Intel Core Ultra", "Fanless Computing"],
    scope: "3 laptops evaluated across 7 years of microarchitecture evolution",
    search: "fa-03 seven years laptop evolution 2017 macbook air m3 acer aspire",
    toc: [
      { id: "fa03-specs", label: "Hardware Specifications" },
      { id: "fa03-benchmarks", label: "Compute & Compilation" },
      { id: "fa03-thermals", label: "Thermals & Acoustics" },
      { id: "fa03-battery", label: "Battery Endurance" },
      { id: "fa03-verdict", label: "Generational Verdict" }
    ],
    relatedExperiments: [
      { id: "fa02", label: "🔄 FA-02 — One Month Out of Apple" }
    ],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z"
  }
];
