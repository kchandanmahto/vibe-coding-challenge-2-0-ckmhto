# Academy Desk — Security Policy

**Version:** 1.0
**Status:** Planned
**Security Approach:** Defense in Depth

## 1. Security Objectives

Academy Desk must protect:

- User accounts and authentication credentials.
- Player personal information.
- Attendance records.
- Match and performance records.
- Academy information.
- Administrative operations.
- Database credentials and application secrets.

Security must be enforced on the server, not only through frontend restrictions.

## 2. Authentication Security

The application will support:

- Email and password authentication.
- Google OAuth authentication.
- Secure logout.
- Password reset through email links.
- Secure session management.

Requirements:

- Passwords must never be stored in plain text.
- Use Argon2id for password hashing when implementing credentials authentication.
- Never store passwords in browser storage.
- Use secure, HTTP-only and appropriately configured cookies.
- Validate OAuth callback and state parameters.
- Prevent account enumeration during password recovery.
- Apply rate limits to login and recovery endpoints.

## 3. Role-Based Access Control (RBAC)

The system will support four permission levels:

| Role       | Permission                             |
| ---------- | -------------------------------------- |
| Head Coach | Academy-wide management                |
| Coach      | Assigned sports and authorized players |
| Scout      | Ready players only                     |
| Player     | Own profile and records only           |

Rules:

- Every protected API must verify permissions.
- Frontend visibility does not count as authorization.
- Users cannot change their own role.
- Only authorized Coaches can create Player and Scout accounts.
- Only Head Coach can create or manage other Coaches.
- Players cannot edit attendance, scores or readiness records.
- Scouts cannot modify academy records.

## 4. Academy and Resource Isolation

Every relevant database query must enforce academy boundaries.

Requirements:

- Validate academy membership before accessing resources.
- Validate Coach sport assignments.
- Validate Player ownership.
- Prevent access through guessed or modified resource IDs.
- Never trust academyId, role or ownership values supplied by the client.

## 5. Database Security

MongoDB Atlas will be used as the database.

Requirements:

- Keep database credentials server-side.
- Use a dedicated database user with minimum required privileges.
- Use secure database connection settings.
- Restrict database network access where practical.
- Never expose MongoDB connection strings.
- Validate data before database operations.
- Use appropriate indexes and unique constraints.
- Use atomic operations or transactions where required.
- Plan backups and recovery procedures.

## 6. Environment Variable Security

Sensitive configuration must be stored in environment variables.

Examples:

- MONGODB_URI
- AUTH_SECRET
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- EMAIL_SERVER credentials
- Application service secrets

Rules:

- Never commit real secrets to GitHub.
- Never use the `NEXT_PUBLIC_` prefix for secrets.
- Keep `.env.local` out of version control.
- Provide placeholders only in `.env.example`.
- Configure production secrets through Vercel environment settings.
- Rotate credentials if they are accidentally exposed.

## 7. Input Validation

All incoming data must be validated using Zod and appropriate server-side checks.

Requirements:

- Validate request bodies.
- Validate query parameters.
- Validate route parameters.
- Reject unexpected fields where appropriate.
- Enforce length and numeric limits.
- Validate dates and identifiers.
- Prevent negative or invalid scores.
- Sanitize data before displaying user-generated content.

Client-side validation is helpful for usability but never replaces server-side validation.

## 8. API Security

- Authenticate protected requests.
- Enforce role permissions.
- Apply rate limiting to sensitive endpoints.
- Prevent mass assignment.
- Use safe database queries.
- Return generic errors for unexpected failures.
- Avoid exposing stack traces.
- Avoid leaking sensitive user information.
- Use appropriate HTTP security headers.
- Configure CORS only when cross-origin access is genuinely needed.

## 9. Session and Cookie Security

- Use secure session management.
- Set HTTP-only cookies.
- Set Secure cookies in production.
- Choose appropriate SameSite settings.
- Validate session expiration.
- Invalidate sessions on logout.
- Revoke or invalidate sessions when an account is suspended where supported.
- Never expose session secrets to frontend JavaScript.

## 10. CSRF and XSS Protection

### CSRF

- Use framework-supported protections where applicable.
- Validate origins for sensitive cookie-authenticated operations.
- Configure SameSite cookies appropriately.
- Protect state-changing requests.

### XSS

- Avoid rendering untrusted HTML.
- Use React's default escaping.
- Sanitize content when HTML rendering is necessary.
- Apply a suitable Content Security Policy after evaluating application requirements.

## 11. Password Reset Security

- Generate cryptographically secure, unpredictable reset tokens.
- Store only hashed reset tokens.
- Set short expiration periods.
- Make reset tokens single-use.
- Do not reveal whether an email address is registered.
- Invalidate existing reset tokens after successful password changes.

## 12. File Upload Security

If profile image uploads are implemented:

- Validate actual file type and size.
- Do not trust file extensions alone.
- Generate safe server-side filenames.
- Restrict allowed image formats.
- Prevent executable file uploads.
- Use a secure storage provider.
- Avoid storing uploaded files directly in temporary serverless application storage.

## 13. Audit Logging

Important actions must be recorded.

Examples:

- Account creation and suspension.
- Coach assignment changes.
- Attendance modifications.
- Session reopening.
- Match score corrections.
- Permission changes.

Audit logs must include:

- Actor ID.
- Action.
- Affected resource.
- Timestamp.
- Reason where required.

Never log passwords, authentication tokens, reset tokens or database credentials.

Audit records should be protected from unauthorized modification.

## 14. Error Handling and Logging

- Use centralized error handling.
- Return safe, user-friendly messages.
- Keep detailed diagnostic information server-side.
- Do not expose internal paths or stack traces in production.
- Protect logs against accidental exposure.
- Avoid logging sensitive personal information unnecessarily.

## 15. Rate Limiting and Abuse Prevention

Apply appropriate rate limits to:

- Login attempts.
- Password reset requests.
- Public enquiry submissions.
- Account creation.
- Sensitive administrative operations.

Use a rate-limiting solution compatible with the Vercel deployment environment.

Do not rely only on in-memory rate limits in serverless deployments.

## 16. Dependency Security

- Monitor npm package vulnerabilities.
- Review dependency updates.
- Avoid unnecessary packages.
- Use lockfile-based installation.
- Review security advisories.
- Run dependency audits regularly.
- Do not blindly use `npm audit fix --force`.

## 17. Data Privacy

- Collect only necessary personal information.
- Restrict access to emergency contact details.
- Avoid exposing private player information to Scouts.
- Protect player records from unauthorized access.
- Define data retention and deletion policies.
- Follow applicable privacy and data protection laws.

## 18. Deployment Security

Before production deployment:

- Configure production environment variables.
- Verify `.gitignore`.
- Remove development-only secrets.
- Verify database access restrictions.
- Enable HTTPS.
- Configure secure headers.
- Review authentication and authorization.
- Run production build and security tests.
- Verify Vercel deployment settings.

## 19. Security Testing Checklist

- [ ] Unauthenticated users cannot access protected APIs.
- [ ] Player cannot view another player's private records.
- [ ] Player cannot modify attendance or match scores.
- [ ] Scout cannot access Not Ready players.
- [ ] Scout cannot modify records.
- [ ] Coach cannot access unassigned sports.
- [ ] Head Coach can manage the academy.
- [ ] Suspended users cannot perform protected actions.
- [ ] Invalid inputs are rejected.
- [ ] Duplicate attendance is prevented.
- [ ] Password reset tokens expire and cannot be reused.
- [ ] Secrets are not exposed in frontend bundles.
- [ ] Sensitive information is not leaked in error messages.
- [ ] Rate limits work for sensitive endpoints.

## 20. Security Incident Response

If a security incident occurs:

1. Identify the affected system or account.
2. Restrict compromised access.
3. Revoke exposed credentials and sessions where necessary.
4. Investigate relevant logs.
5. Restore affected data if required.
6. Fix the underlying vulnerability.
7. Verify the correction.
8. Document the incident and preventive measures.

---

**Document Status:** Initial Security Baseline
**Project:** Academy Desk
## 21. Distributed Rate Limiting (Phase 1, Task 9)

Academy Desk uses Upstash Redis for distributed rate limiting across serverless instances.

Policies:
- Login (email): 20 requests per hour (fail open on Upstash outage).
- Login (IP): 5 requests per 15 minutes (fail open).
- Forgot password (IP): 5 requests per hour (fail closed).
- Forgot password (email): 3 requests per hour (fail closed).
- Reset password (IP): 10 requests per hour (fail closed).
- Reset password (token): 5 requests per 15 minutes (fail closed).

Identifiers are HMAC-SHA256 hashed with `RATE_LIMIT_KEY_SECRET` before being used as Redis keys. Raw emails, IPs and reset tokens are never stored in Redis.

IP extraction trusts only Vercel-provided headers (`x-vercel-forwarded-for`, `x-forwarded-for`, `x-real-ip`) and validates them as IP addresses. Invalid values fall back to identifier-only limits.

Login limits are enforced inside the Auth.js `authorize()` flow (post-CSRF). No separate middleware or proxy is used. Auth.js CSRF validation remains authoritative.

Forgot-password and reset-password routes return HTTP 429 with `Retry-After` on limit violations while keeping responses generic to avoid account enumeration.

Failure behavior:
- Login: fail open (availability first).
- Forgot password: fail closed.
- Reset password: fail closed.

Known limitations:
- Upstash timeout (2 seconds) returns success=true from the SDK; fail-closed operations treat a timeout as a denial.
- `Promise.race` cannot cancel the underlying Upstash request; late increments may occur.
- Auth.js cannot emit HTTP 429 from `authorize()`; login over-limit attempts return a generic failed-login result.
- Timing differences in forgot-password may reveal account existence; mitigations are best-effort.

