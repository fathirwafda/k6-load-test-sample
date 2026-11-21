import { sleep } from 'k6';
import { summaryTrendStats, thresholds } from '../lib/config.js';
import { listDoughs } from '../lib/api.js';
import { makeSummary } from '../lib/summary.js';

// Stress: push past expected load in steps to find where latency and errors start to climb.
// abortOnFail stops the run once the system is clearly past its limit.
export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '30s', target: 0 },
  ],
  summaryTrendStats,
  thresholds: {
    ...thresholds,
    http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '30s' }],
  },
};

export default function () {
  listDoughs();
  sleep(1);
}

export const handleSummary = makeSummary('stress');
