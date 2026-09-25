/**
 * Automated Test Suite: CORS & External Tool Fetching Verification
 * Validates that external tools, scripts, and AI agents can fetch, view, and summarize data
 */
import http from 'http';
import assert from 'assert';
import fs from 'fs';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: 'localhost',
      port: 3000,
      path: path,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 4000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function check(desc, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${desc} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   CORS & EXTERNAL TOOL FETCHING INTEGRITY AUDIT');
  console.log('======================================================\n');

  console.log('--- 1. Universal CORS Headers Across Routes ---');
  const routesToTest = [
    '/',
    '/index.html',
    '/api/summary',
    '/api/experiments',
    '/api/devices',
    '/llms.txt',
    '/experiment-12',
    '/logo.svg'
  ];

  for (const route of routesToTest) {
    const res = await request(route);
    check(`GET ${route} returns Access-Control-Allow-Origin: *`, res.headers['access-control-allow-origin'] === '*');
    check(`GET ${route} defines Access-Control-Allow-Methods`, Boolean(res.headers['access-control-allow-methods']));
  }

  console.log('\n--- 2. OPTIONS Preflight Support for Cross-Origin Fetching ---');
  const preflightRes = await request('/api/summary', {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://external-summarizer-tool.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  });
  check('OPTIONS /api/summary returns HTTP 204 No Content', preflightRes.statusCode === 204);
  check('OPTIONS /api/summary includes Access-Control-Allow-Origin: *', preflightRes.headers['access-control-allow-origin'] === '*');
  check('OPTIONS /api/summary specifies allowed methods', preflightRes.headers['access-control-allow-methods'].includes('GET'));
  check('OPTIONS /api/summary specifies allowed headers', preflightRes.headers['access-control-allow-headers'].includes('Content-Type'));

  console.log('\n--- 3. Dedicated /api/summary Endpoint for External Summarizers ---');
  const summaryRes = await request('/api/summary');
  check('GET /api/summary returns HTTP 200', summaryRes.statusCode === 200);
  check('GET /api/summary returns application/json', summaryRes.headers['content-type'].includes('application/json'));
  
  const summaryData = JSON.parse(summaryRes.body);
  check('Summary includes site title', summaryData.title && summaryData.title.includes('WDIII Tech Vault'));
  check('Summary includes version', summaryData.version === 'V5.7.3');
  check('Summary includes lastUpdated', summaryData.lastUpdated === 'September 26, 2026');
  check('Summary includes totalExperiments >= 14', summaryData.stats.totalExperiments >= 14);
  check('Summary includes totalDevices >= 30', summaryData.stats.totalDevices >= 30);
  check('Summary contains experiments array with objectives and verdicts', 
    Array.isArray(summaryData.experiments) && summaryData.experiments[0].objective !== undefined
  );
  check('Summary contains devices array with specs', 
    Array.isArray(summaryData.devices) && summaryData.devices[0].brand !== undefined
  );

  console.log('\n--- 4. Dedicated /api/experiments & /api/devices Query Endpoints ---');
  const expListRes = await request('/api/experiments');
  check('GET /api/experiments returns HTTP 200', expListRes.statusCode === 200);
  const expListData = JSON.parse(expListRes.body);
  check('Experiments payload includes total count', expListData.total >= 14);

  const exp1Res = await request('/api/experiments/exp1');
  check('GET /api/experiments/exp1 returns HTTP 200', exp1Res.statusCode === 200);
  const exp1Data = JSON.parse(exp1Res.body);
  check('Exp 1 title is correct', exp1Data.title.includes('Apple vs Samsung Mail-In Repair'));

  const devListRes = await request('/api/devices');
  check('GET /api/devices returns HTTP 200', devListRes.statusCode === 200);
  const devListData = JSON.parse(devListRes.body);
  check('Devices payload includes total count', devListData.total >= 30);

  const devRes = await request('/api/devices/apple-iphone-16e');
  check('GET /api/devices/apple-iphone-16e returns HTTP 200', devRes.statusCode === 200);
  const devData = JSON.parse(devRes.body);
  check('Device model is iPhone 16e', devData.model === 'iPhone 16e' || devData.name === 'iPhone 16e');

  console.log('\n--- 5. Plaintext LLM & AI Scraper Ingestion (/llms.txt & robots.txt) ---');
  const llmsRes = await request('/llms.txt');
  check('GET /llms.txt returns HTTP 200', llmsRes.statusCode === 200);
  check('GET /llms.txt returns text/plain', llmsRes.headers['content-type'].includes('text/plain'));
  check('llms.txt contains markdown documentation', llmsRes.body.includes('# Consumer Tech Documentation'));

  const robotsRes = await request('/robots.txt');
  check('GET /robots.txt returns HTTP 200', robotsRes.statusCode === 200);
  check('robots.txt allows /api/', robotsRes.body.includes('Allow: /api/'));
  check('robots.txt allows /llms.txt', robotsRes.body.includes('Allow: /llms.txt'));
  check('robots.txt explicitly allows AI crawlers (GPTBot, ClaudeBot, etc.)', 
    robotsRes.body.includes('GPTBot') && robotsRes.body.includes('ClaudeBot')
  );

  console.log(`\n======================================================`);
  console.log(`   CORS & TOOLS AUDIT: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
