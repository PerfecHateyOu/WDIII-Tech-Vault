/**
 * Production check: can a visitor dodge the rate limit by sending fake X-Forwarded-For values?
 *
 *   node scripts/check-rate-limit.mjs https://<your-hosting-url>
 *
 * Sends 4 requests, each claiming a different client address, and reads the server's own
 * counter (the RateLimit response header). If the counter keeps going down, the fake values were
 * ignored and every request counted against you: good. If it never goes down, the fake values were
 * believed: set TRUST_PROXY_HOPS on the Cloud Run service (see HANDOFF.md) and run this again.
 *
 * Run it against the Hosting URL (the real front door). The direct run.app address has one hop fewer
 * and will still look spoofable.
 */
const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('Usage: node scripts/check-rate-limit.mjs https://<hosting-url>');
  process.exit(2);
}

const fakes = ['198.18.0.11', '198.18.0.12', '198.18.0.13', '198.18.0.14'];
const remaining = [];
for (const [i, fake] of fakes.entries()) {
  const res = await fetch(`${base}/api/summary?ratecheck=${Date.now()}-${i}`, {
    headers: { 'X-Forwarded-For': fake, 'Cache-Control': 'no-cache' }
  });
  const header = res.headers.get('ratelimit') || '';
  const match = /remaining=(\d+)/.exec(header);
  remaining.push(match ? Number(match[1]) : null);
  console.log(`request ${i + 1}: HTTP ${res.status}, claimed address ${fake}, RateLimit: ${header || '(no header)'}`);
}

const known = remaining.every((r) => r !== null);
const decreasing = known && remaining.every((r, i) => i === 0 || r < remaining[i - 1]);
const flat = known && remaining.every((r) => r >= remaining[0]);

console.log('');
if (!known) {
  console.log('INCONCLUSIVE: no RateLimit header came back. Is this the right URL, and is it the new version?');
  process.exit(1);
} else if (decreasing) {
  console.log('OK: the fake addresses were ignored. All four requests counted against the same visitor.');
} else if (flat) {
  console.log('FAIL: the fake addresses were believed, so each request looked like a new visitor.');
  console.log('Set TRUST_PROXY_HOPS to the real number of proxies in front of the server and deploy again.');
  process.exit(1);
} else {
  console.log('INCONCLUSIVE: the counter moved unevenly, possibly because several server instances answered. Run it again.');
  process.exit(1);
}
