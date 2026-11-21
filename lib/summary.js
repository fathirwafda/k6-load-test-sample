import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// Prints the usual console summary and also writes a JSON file CI can archive.
export function makeSummary(name) {
  return (data) => ({
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`results/${name}-summary.json`]: JSON.stringify(data, null, 2),
  });
}
