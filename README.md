# k6-load-test-sample

Three small [k6](https://k6.io) performance scripts (smoke, load, stress) with shared helpers,
pass/fail thresholds, a custom metric, and a CI job. The target is Grafana's public k6 demo app
[QuickPizza](https://quickpizza.grafana.com), which exists for exactly this purpose. (The older
demo API, `test-api.k6.io`, was retired and now redirects to QuickPizza.)

> Please do not point these scripts at services you do not own.

## Run it

```bash
# install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
mkdir -p results
k6 run scripts/smoke.js     # 1 VU, 30 s - does it work at all?
k6 run scripts/load.js      # ramp to 20 VUs, hold 3 min
k6 run scripts/stress.js    # step up to 150 VUs to find the breaking point

# against another environment
k6 run -e BASE_URL=https://staging.example.com scripts/load.js
```

## What each test answers

| Script | Shape | Question |
|---|---|---|
| `smoke.js` | 1 VU, 30 s | Are the script and the system sane before spending load? |
| `load.js` | ramp to 20 VUs, 3 min steady | Does it meet the latency target at expected traffic? |
| `stress.js` | steps to 150 VUs, aborts on >5% errors | Where do latency and errors start to climb? |

## Pass/fail criteria (`lib/config.js`)

- `http_req_failed` < 1%
- `http_req_duration` p95 < 800 ms and p99 < 1.5 s
- `checks` pass rate > 99%

A threshold breach makes `k6 run` exit non-zero, so CI fails the build. Treat the numbers as an
example: real thresholds should come from an SLO, not from a template.

## Layout

```
lib/config.js     base URL and shared thresholds
lib/api.js        request helpers with checks and tags (+ custom Trend metric)
lib/summary.js    console summary + JSON output for CI
scripts/          smoke, load, stress
.github/workflows k6.yml: smoke on pushes to main and pull requests, any script on demand
```

## Notes

- Requests are tagged (`name:`) so dashboards group by endpoint instead of by URL.
- Think time (`sleep`) is included; without it the test measures a tight loop, not users.
- Results in `results/*.json` are git-ignored; CI uploads them as an artifact.
