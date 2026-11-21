// Shared settings. Override with: k6 run -e BASE_URL=https://... scripts/load.js
//
// Target: QuickPizza, Grafana's public demo app for k6. The old demo API (test-api.k6.io) was
// retired and now redirects to QuickPizza's web page, which returns HTML instead of JSON.
export const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

// QuickPizza's read endpoints accept any 16-character token; it identifies a demo "user", it is
// not a secret. Override with -e AUTH_TOKEN=... if a target needs a real one.
export const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'abcdef0123456789';

// Percentiles shown in the end-of-test summary. k6's default stops at p(95); p(99) is a threshold
// here, so it should be visible too.
export const summaryTrendStats = ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'];

export const thresholds = {
  // fewer than 1% of requests may fail
  http_req_failed: ['rate<0.01'],
  // 95% of requests under 800 ms, 99% under 1.5 s
  http_req_duration: ['p(95)<800', 'p(99)<1500'],
  // every check() must pass at least 99% of the time
  checks: ['rate>0.99'],
};
