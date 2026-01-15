import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per IP per hour
const CIRCUIT_BREAKER_THRESHOLD = 1000; // Global threshold per hour

// In-memory stores (for production, use Redis)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const globalRequestCount = { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW_MS };

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

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

// Helper to generate fingerprint (basic: IP + User-Agent)
function generateFingerprint(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  return `${ip}-${userAgent}`;
}

// Check rate limit
function checkRateLimit(fingerprint: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(fingerprint);

  if (!entry || now > entry.resetTime) {
    ipRequestCounts.set(fingerprint, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Check circuit breaker
function checkCircuitBreaker(): boolean {
  const now = Date.now();
  if (now > globalRequestCount.resetTime) {
    globalRequestCount.count = 0;
    globalRequestCount.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  if (globalRequestCount.count >= CIRCUIT_BREAKER_THRESHOLD) {
    return false;
  }

  globalRequestCount.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const fingerprint = generateFingerprint(request);

  // Check circuit breaker first
  if (!checkCircuitBreaker()) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable due to high traffic' },
      { status: 503 }
    );
  }

  // Check rate limit
  if (!checkRateLimit(fingerprint)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Proceed with the request
  return NextResponse.next();
}

// Apply middleware to API routes
export const config = {
  matcher: '/api/:path*',
};