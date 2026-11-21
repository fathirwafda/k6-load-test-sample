import { sleep, group } from 'k6';
import { summaryTrendStats, thresholds } from '../lib/config.js';
import { listDoughs, getIngredients } from '../lib/api.js';
import { makeSummary } from '../lib/summary.js';

const INGREDIENT_TYPES = ['tomato', 'mozzarella', 'topping'];

// Load: ramp to expected traffic, hold, ramp down. Answers "is it fast enough at normal load?"
export const options = {
  stages: [
    { duration: '1m', target: 20 },  // ramp up
    { duration: '3m', target: 20 },  // steady state
    { duration: '30s', target: 0 },  // ramp down
  ],
  thresholds,
  summaryTrendStats,
};

export default function () {
  group('browse and open', () => {
    listDoughs();
    getIngredients(INGREDIENT_TYPES[Math.floor(Math.random() * INGREDIENT_TYPES.length)]);
  });
  sleep(Math.random() * 2 + 1); // think time, 1-3 s
}

export const handleSummary = makeSummary('load');
