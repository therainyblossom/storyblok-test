# Security Headers Checklist

Quick reference for expected values. Based on OWASP Secure Headers Project.

## Required Headers

### Content-Security-Policy
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none'
```
- **Critical**: Must be present
- **Fail if**: Missing, or `script-src` includes `'unsafe-eval'`, or `default-src *`
- **Warning if**: `script-src 'unsafe-inline'` (needed by some frameworks, but risky)
- **Note**: CSP is complex — the above is a starting point. Customize per project.
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

### Strict-Transport-Security
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
- **Critical**: Must be present on HTTPS sites
- **Fail if**: Missing, or `max-age < 31536000` (1 year)
- **Bonus**: `includeSubDomains` and `preload`
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- **Major**: Prevents MIME sniffing attacks
- **Fail if**: Missing
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options

### X-Frame-Options
```
X-Frame-Options: DENY
```
- **Major**: Prevents clickjacking
- **Fail if**: Missing or `ALLOWALL`
- **Pass if**: `DENY` or `SAMEORIGIN`
- **Note**: `frame-ancestors` in CSP supersedes this, but both should be set for compatibility
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- **Major**: Controls referrer information leakage
- **Fail if**: Missing or `unsafe-url`
- **Pass if**: `no-referrer`, `strict-origin`, `strict-origin-when-cross-origin`, `same-origin`
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```
- **Minor**: Restricts browser features
- **Fail if**: Missing and site doesn't need camera/mic/geo
- **Note**: Set `()` (empty) for features you don't use
- **Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

## Headers That Should NOT Be Present

| Header | Risk | Why |
|--------|------|-----|
| `Server: Apache/2.4.51` | Information disclosure | Reveals server software and version |
| `X-Powered-By: Express` | Information disclosure | Reveals backend framework |
| `X-AspNet-Version` | Information disclosure | Reveals .NET version |

## Cookie Flags

| Flag | When Required | Risk if Missing |
|------|---------------|-----------------|
| `Secure` | Always on HTTPS sites | Cookie sent over HTTP (interceptable) |
| `HttpOnly` | Session/auth cookies | Cookie accessible to JavaScript (XSS risk) |
| `SameSite=Lax` | All cookies | CSRF attacks via cross-site requests |
| `__Host-` prefix | Session cookies | Ensures Secure + Path=/ + no Domain |

## HTTPS Enforcement

| Check | Expected |
|-------|----------|
| HTTP → HTTPS redirect | 301 redirect to HTTPS equivalent |
| HSTS header | Present on HTTPS response |
| Mixed content | No HTTP resources loaded on HTTPS pages |
| Certificate validity | Not expired, matches domain |

## Severity Guide

| Severity | Examples |
|----------|----------|
| Critical | Missing CSP, missing HSTS, HTTP with no redirect |
| Major | Missing X-Content-Type-Options, missing X-Frame-Options, cookies without Secure |
| Minor | Missing Permissions-Policy, Server header exposed, missing SameSite on non-session cookie |
