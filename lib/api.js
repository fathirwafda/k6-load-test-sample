import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';
import { AUTH_TOKEN, BASE_URL } from './config.js';

// Custom metric so list latency shows up separately in the summary.
export const listLatency = new Trend('dough_list_duration', true);

const authHeaders = { Authorization: `token ${AUTH_TOKEN}` };

// Parses the body without throwing: an HTML error page must fail a check, not abort the iteration.
const jsonOrNull = (res, selector) => {
  try {
    return res.json(selector);
  } catch (_) {
    return null;
  }
};

export function listDoughs() {
  const res = http.get(`${BASE_URL}/api/doughs`, {
    headers: authHeaders,
    tags: { name: 'list_doughs' },
  });
  listLatency.add(res.timings.duration);
  check(res, {
    'list: status is 200': (r) => r.status === 200,
    'list: returns a non-empty array': (r) => {
      const doughs = jsonOrNull(r, 'doughs');
      return Array.isArray(doughs) && doughs.length > 0;
    },
  });
  return res;
}

/** `type` is one of QuickPizza's ingredient groups, e.g. "tomato", "mozzarella", "topping". */
export function getIngredients(type) {
  const res = http.get(`${BASE_URL}/api/ingredients/${type}`, {
    headers: authHeaders,
    tags: { name: 'get_ingredients' },
  });
  check(res, {
    'detail: status is 200': (r) => r.status === 200,
    'detail: every item has an ID and a name': (r) => {
      const items = jsonOrNull(r, 'ingredients');
      return Array.isArray(items) && items.length > 0 && items.every((i) => i.ID && i.name);
    },
  });
  return res;
}

export function getMissing() {
  const res = http.get(`${BASE_URL}/api/pizza/999999999`, {
    headers: authHeaders,
    tags: { name: 'get_missing' },
    // A 404 is the expected answer here. Without this, k6 counts it in http_req_failed.
    responseCallback: http.expectedStatuses(404),
  });
  check(res, { 'missing: status is 404': (r) => r.status === 404 });
  return res;
}
