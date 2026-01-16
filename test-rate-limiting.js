// Simple test script for rate limiting logic
// Run with: node test-rate-limiting.js

const RATE_LIMIT_MAX_REQUESTS = 10;
const CIRCUIT_BREAKER_THRESHOLD = 1000;

const ipRequestCounts = new Map();
const globalRequestCount = { count: 0, resetTime: Date.now() + 60 * 60 * 1000 };

function getClientIP(request) {
  const forwarded = request.headers['x-forwarded-for'];
  const realIP = request.headers['x-real-ip'];
  const clientIP = request.headers['x-client-ip'];

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }
  return 'unknown';
}

function generateFingerprint(request) {
  const ip = getClientIP(request);
  const userAgent = request.headers['user-agent'] || '';
  return `${ip}-${userAgent}`;
}

function checkRateLimit(fingerprint) {
  const now = Date.now();
  const entry = ipRequestCounts.get(fingerprint);

  if (!entry || now > entry.resetTime) {
    ipRequestCounts.set(fingerprint, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

function checkCircuitBreaker() {
  const now = Date.now();
  if (now > globalRequestCount.resetTime) {
    globalRequestCount.count = 0;
    globalRequestCount.resetTime = now + 60 * 60 * 1000;
  }

  if (globalRequestCount.count >= CIRCUIT_BREAKER_THRESHOLD) {
    return false;
  }

  globalRequestCount.count++;
  return true;
}

// Test functions
function testGetClientIP() {
  console.log('Testing getClientIP...');

  const testCases = [
    { input: { headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' } }, expected: '192.168.1.1' },
    { input: { headers: { 'x-real-ip': '192.168.1.2' } }, expected: '192.168.1.2' },
    { input: { headers: { 'x-client-ip': '192.168.1.3' } }, expected: '192.168.1.3' },
    { input: { headers: {} }, expected: 'unknown' },
  ];

  testCases.forEach((testCase, index) => {
    const result = getClientIP(testCase.input);
    const passed = result === testCase.expected;
    console.log(`  Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'} - Expected: ${testCase.expected}, Got: ${result}`);
  });
}

function testGenerateFingerprint() {
  console.log('Testing generateFingerprint...');

  const testCases = [
    {
      input: { headers: { 'x-forwarded-for': '192.168.1.1', 'user-agent': 'TestAgent/1.0' } },
      expected: '192.168.1.1-TestAgent/1.0'
    },
    {
      input: { headers: { 'x-forwarded-for': '192.168.1.1' } },
      expected: '192.168.1.1-'
    },
  ];

  testCases.forEach((testCase, index) => {
    const result = generateFingerprint(testCase.input);
    const passed = result === testCase.expected;
    console.log(`  Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'} - Expected: ${testCase.expected}, Got: ${result}`);
  });
}

function testCheckRateLimit() {
  console.log('Testing checkRateLimit...');

  // Reset for test
  ipRequestCounts.clear();

  const fingerprint = 'test-fingerprint-' + Date.now();

  // Test first request
  const firstResult = checkRateLimit(fingerprint);
  console.log(`  First request: ${firstResult ? 'PASS' : 'FAIL'} - Expected: true, Got: ${firstResult}`);

  // Test within limit
  let withinLimit = true;
  for (let i = 1; i < 10; i++) {
    if (!checkRateLimit(fingerprint)) {
      withinLimit = false;
      break;
    }
  }
  console.log(`  Within limit (9 more): ${withinLimit ? 'PASS' : 'FAIL'}`);

  // Test over limit
  const overLimit = !checkRateLimit(fingerprint);
  console.log(`  Over limit: ${overLimit ? 'PASS' : 'FAIL'} - Expected: false, Got: ${!overLimit}`);
}

function testCheckCircuitBreaker() {
  console.log('Testing checkCircuitBreaker...');

  // Reset for test
  globalRequestCount.count = 0;
  globalRequestCount.resetTime = Date.now() + 60 * 60 * 1000;

  // Test within limit
  const withinLimit = checkCircuitBreaker();
  console.log(`  Within limit: ${withinLimit ? 'PASS' : 'FAIL'}`);

  // Test over limit
  globalRequestCount.count = CIRCUIT_BREAKER_THRESHOLD;
  const overLimit = !checkCircuitBreaker();
  console.log(`  Over limit: ${overLimit ? 'PASS' : 'FAIL'}`);
}

// Run tests
console.log('Running Rate Limiting Tests...\n');

testGetClientIP();
console.log('');

testGenerateFingerprint();
console.log('');

testCheckRateLimit();
console.log('');

testCheckCircuitBreaker();
console.log('');

console.log('Tests completed!');