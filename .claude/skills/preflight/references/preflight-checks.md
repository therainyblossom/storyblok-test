# Pre-Flight Checks Reference

Run these before any test suite. If any check fails, stop — running tests against a broken environment wastes time and produces misleading results.

## Check Order

Run in this order (each depends on the previous passing):

```
1. Connectivity → Can we reach the server?
2. Authentication → Do credentials work?
3. Page renders → Does the app actually load?
4. Resources → Do CSS/JS/fonts load?
5. Cookie consent → Can we dismiss the banner?
```

## Connectivity

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Timeout (000) | VPN not connected, DNS failure, firewall | Connect VPN, check DNS |
| 502 Bad Gateway | Deploy in progress or failed | Wait 2 min, retry. Check deploy pipeline. |
| 503 Service Unavailable | Server overloaded or maintenance | Wait and retry. Check status page. |
| 404 | Wrong URL or app not deployed to this path | Verify `PLAYWRIGHT_BASE_URL` env var |
| SSL error | Certificate expired or self-signed | Check cert. Use `ignoreHTTPSErrors: true` in config. |

## Authentication

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| 401 with credentials | Wrong username/password | Check `PLAYWRIGHT_BASIC_AUTH_USER` and `PLAYWRIGHT_BASIC_AUTH_PASS` env vars |
| 401 without credentials | Auth required but not configured | Add `httpCredentials` to playwright.config.ts |
| 200 without auth | No basic auth on this environment | Remove `httpCredentials` block from config |

## Page Renders

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Blank page (<100 chars) | SSR failure, JS not executing | Check server logs, verify build succeeded |
| "Internal Server Error" | Backend crash, missing env vars | Check application logs |
| "Application error" | Framework error boundary triggered | Check application logs |
| Console errors on load | Missing API endpoints, CORS issues | Check browser console, verify API is deployed |

## Resources

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| CSS 404 | Build artifacts not deployed, wrong asset path | Redeploy, check build output |
| JS 404 | Same as CSS | Same |
| Font 403 | CORS not configured for font CDN | Check font hosting CORS headers |
| Mixed content blocked | HTTP resource on HTTPS page | Update resource URLs to HTTPS |

## Cookie Consent

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Banner doesn't appear | Consent script blocked, wrong domain config | Check consent provider dashboard |
| Banner can't be dismissed | Selector changed, new consent provider | Update `helpers/cookie-consent.ts` selectors |
| Banner reappears on every page | Cookies not persisting (SameSite/Secure flags) | Check cookie domain/path configuration |

## Environment Variables

Tests expect these env vars (or placeholders in config):

| Variable | Purpose | Required |
|----------|---------|----------|
| `PLAYWRIGHT_BASE_URL` | Staging URL to test against | Yes |
| `PLAYWRIGHT_BASIC_AUTH_USER` | Basic auth username | If staging has auth |
| `PLAYWRIGHT_BASIC_AUTH_PASS` | Basic auth password | If staging has auth |

## CI Pre-Flight

Add as a separate CI job that gates the test suite:

```yaml
preflight:
  stage: test
  script:
    - curl -sf --max-time 10 -u "$AUTH_USER:$AUTH_PASS" "$STAGING_URL/" > /dev/null
  allow_failure: false

e2e-tests:
  stage: test
  needs: [preflight]
  script:
    - npx playwright test --project=chromium
```
