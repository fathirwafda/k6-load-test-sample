import { sleep, group } from 'k6';
import { summaryTrendStats, thresholds } from '../lib/config.js';
import { listDoughs, getIngredients, getMissing } from '../lib/api.js';
import { makeSummary } from '../lib/summary.js';

// Smoke: 1 VU for 30 s. Answers "does the script and the system work at all?"
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    ...thresholds,
    // Smoke sends ~40 requests, so p95 is set by the 2-3 slowest ones and swings with network
    // noise. Allow 1 s here; load.js keeps the stricter shared 800 ms target.
    http_req_duration: ['p(95)<1000', 'p(99)<1500'],
  },
  summaryTrendStats,
};

export default function () {
  group('browse', () => {
    listDoughs();
    getIngredients('tomato');
    getMissing();
  });
  sleep(1);
}

export const handleSummary = makeSummary('smoke');
