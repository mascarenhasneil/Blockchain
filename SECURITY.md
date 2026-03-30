# Security Policy

## Supported Versions

This project is a **learning and demonstration** codebase. Only the latest
version on the `master` branch receives security attention.

| Version | Supported |
|---|---|
| Latest (`master`) | ✅ Yes |
| Older tags / forks | ❌ No |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please follow these
steps:

1. **Do not open a public GitHub issue** — this could expose the vulnerability
   before a fix is available.

2. **Email the maintainer directly:**  
   Contact Neil Mascarenhas via [About Me](https://about.me/neilmascarenhas).  
   Include:

   - A description of the vulnerability.
   - Steps to reproduce it.
   - The potential impact.
   - Any suggested mitigations (optional but appreciated).

3. **Allow reasonable time for a response** — you will receive an
   acknowledgement within **72 hours** and a resolution timeline within
   **7 days** for critical issues.

4. Once the fix is released you are welcome to disclose the vulnerability
   publicly. We will credit you in the release notes unless you prefer
   anonymity.

---

## Scope

### In scope

- Logic bugs in `dev/blockchain.js` that break immutability guarantees or allow
  chain manipulation.
- Authentication / authorisation issues in `dev/api.js` (API endpoints currently
  have no auth — this is **by design** for a local learning environment; adding
  auth would be in scope for a production hardening PR).
- Dependency vulnerabilities in packages listed in `package.json`.
- Cross-Site Scripting (XSS) or injection issues in the Block Explorer UI
  (`dev/block-explorer/index.html`).

### Out of scope

- Issues that only affect local development environments with no network
  exposure.
- Denial-of-service against proof-of-work (computationally expensive by design).
- Social engineering attacks.

---

## Known Security Considerations

Because this is a **demonstration project**, several intentional simplifications
exist that would be unacceptable in a production system:

| Consideration | Status | Notes |
|---|---|---|
| No API authentication | By design | All endpoints are open; add JWT/API keys before any public deployment |
| No HTTPS | By design | All nodes communicate over plain HTTP; use TLS in production |
| No rate limiting | By design | The `/mine` endpoint is compute-heavy; add rate limiting before exposing publicly |
| No input validation | Partial | Addresses and amounts are not validated; malformed data can corrupt pending transactions |
| Proof-of-Work difficulty is low | By design | `0000` prefix is trivial to compute; increase leading zeros for a more realistic simulation |
| No wallet / key management | By design | Sender/recipient addresses are plain strings; a real system requires asymmetric cryptography |

---

## Dependency Security

Transitive dependency vulnerabilities are tracked and fixed via Dependabot.
The `overrides` field in `package.json` pins vulnerable transitive packages to
safe versions. After cloning, always run:

```sh
npm install
npm audit
```

If `npm audit` reports new vulnerabilities, please open an issue or follow the
responsible disclosure process above.

---

## Security Best Practices for Contributors

- Never commit secrets, credentials, or private keys.
- Keep dependencies up to date — run `npm audit fix` regularly.
- Validate and sanitise all user-supplied input at API boundaries.
- Prefer `===` over `==` to avoid type coercion surprises.
- Use `helmet` middleware if this API is ever exposed beyond localhost.
