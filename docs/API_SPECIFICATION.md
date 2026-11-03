# Academy Desk — API Specification

**Version:** 1.0  
**Backend:** Next.js Route Handlers  
**Base URL:** `/api/v1`  
**Status:** Planned

## 1. API Overview

Academy Desk APIs will be implemented using Next.js App Router Route Handlers.

All protected APIs must perform server-side authentication, authorization and input validation.

### Base URL

Development:

`http://localhost:3000/api/v1`

Production:

`https://your-domain.com/api/v1`

## 2. API Standards

- Use RESTful API conventions.
- Use JSON for request and response bodies.
- Use appropriate HTTP methods and status codes.
- Validate all incoming data using Zod.
- Authenticate protected requests.
- Enforce role-based permissions server-side.
- Never expose database credentials or internal errors.
- Use pagination for large data collections.
- Use consistent response formats.

## 3. Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Request could not be completed",
  "code": "VALIDATION_ERROR",
  "errors": []
}
```

## 4. HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request without response body |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Duplicate or conflicting operation |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## 5. Authentication APIs

Base: `/api/v1/auth`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/login` | Email/password login | Public |
| POST | `/logout` | Logout | Authenticated |
| GET | `/session` | Current session | Authenticated |
| POST | `/forgot-password` | Request reset link | Public |
| POST | `/reset-password` | Reset password | Valid reset token |
| GET | `/google` | Start Google login | Public |
| GET | `/callback/google` | Google login callback | OAuth flow |

Authentication will use Auth.js. Actual OAuth callback and session handling must follow the selected Auth.js configuration.

## 6. User APIs

Base: `/api/v1/users`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/me` | Current user profile | Authenticated |
| PATCH | `/me` | Update permitted profile fields | Authenticated |
| GET | `/:id` | View user details | Authorized Coach |
| PATCH | `/:id/status` | Change account status | Head Coach |

Players must not modify role, academy assignment or protected account fields.

## 7. Player APIs

Base: `/api/v1/players`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List players | Authorized Coach |
| POST | `/` | Create player account | Authorized Coach |
| GET | `/:id` | View player profile | Authorized Coach |
| PATCH | `/:id` | Update permitted player details | Authorized Coach |
| GET | `/me` | View own player profile | Player |
| PATCH | `/me` | Update permitted personal details | Player |

All player queries must enforce academy, assigned sport and ownership restrictions.

## 8. Coach APIs

Base: `/api/v1/coaches`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List coaches | Head Coach |
| POST | `/` | Create coach account | Head Coach |
| GET | `/:id` | View coach profile | Head Coach |
| PATCH | `/:id` | Update coach assignments | Head Coach |

## 9. Scout APIs

Base: `/api/v1/scouts`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List scouts | Head Coach |
| POST | `/` | Create scout account | Head Coach |
| GET | `/:id` | View scout details | Head Coach |
| PATCH | `/:id` | Update scout details | Head Coach |

## 10. Sports APIs

Base: `/api/v1/sports`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List academy sports | Authenticated |
| POST | `/` | Create sport | Head Coach |
| GET | `/:id` | View sport details | Authorized |
| PATCH | `/:id` | Update sport | Head Coach |
| DELETE | `/:id` | Deactivate sport | Head Coach |

Historical records must not be deleted merely because a sport is deactivated.

## 11. Session APIs

Base: `/api/v1/sessions`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List sessions | Authorized Coach |
| POST | `/` | Create session | Authorized Coach |
| GET | `/:id` | View session | Authorized |
| POST | `/:id/close` | Close session | Authorized Coach |
| POST | `/:id/reopen` | Reopen session with reason | Authorized Coach |

A session must not be edited normally after closure.

## 12. Attendance APIs

Base: `/api/v1/attendance`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List attendance records | Authorized Coach |
| POST | `/` | Mark attendance | Authorized Coach |
| PATCH | `/:id` | Correct attendance | Authorized Coach |
| GET | `/players/:playerId` | View player attendance | Authorized |
| GET | `/me` | View own attendance | Player |

Rules:

- Only OPEN sessions accept attendance changes.
- One attendance record per player per session.
- Duplicate records must be rejected.
- Players cannot modify attendance.
- Closed-session corrections require controlled reopening and audit logging.

## 13. Match APIs

Base: `/api/v1/matches`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List matches | Authorized |
| POST | `/` | Create match | Authorized Coach |
| GET | `/:id` | View match details | Authorized |
| PATCH | `/:id` | Update permitted match details | Authorized Coach |
| POST | `/:id/complete` | Complete match | Authorized Coach |

Rules:

- Only valid participants can be selected.
- Players absent from the relevant practice session must be rejected under the initial participation rule.
- Duplicate participants are prohibited.
- Negative scores are prohibited.
- Completed match corrections must be audited.

## 14. Readiness APIs

Base: `/api/v1/readiness`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | List readiness records | Authorized Coach |
| GET | `/players/:playerId` | View player readiness | Authorized |
| GET | `/me` | View own readiness | Player |
| GET | `/scout` | List Ready players only | Scout |

Readiness rules:

- Attendance must be at least 75%.
- At least two completed matches are required.
- Both conditions must be satisfied.
- Readiness is calculated using verified database records.
- Scout queries must return Ready players only.

## 15. Analytics APIs

Base: `/api/v1/analytics`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/academy` | Academy analytics | Head Coach |
| GET | `/players` | Player performance analytics | Authorized Coach |
| GET | `/attendance` | Attendance analytics | Authorized Coach |
| GET | `/matches` | Match analytics | Authorized Coach |
| GET | `/me` | Personal analytics | Player |

Analytics responses must respect role permissions and academy boundaries.

## 16. Enquiry APIs

Base: `/api/v1/enquiries`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/` | Submit enquiry | Public |
| GET | `/` | List enquiries | Authorized Coach |
| GET | `/:id` | View enquiry | Authorized Coach |
| PATCH | `/:id` | Update enquiry status | Authorized Coach |

Public enquiry endpoints must have rate limiting and input validation.

## 17. Export APIs

Base: `/api/v1/exports`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/analytics/pdf` | Export analytics PDF | Authorized Coach |
| GET | `/players/:id/pdf` | Export player report | Authorized |
| GET | `/attendance/pdf` | Export attendance report | Authorized Coach |

Exports must enforce the same data-access permissions as normal API endpoints.

## 18. Health API

Base: `/api/v1/health`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/` | Application health check | Public |

Health responses must not expose credentials, database connection strings or sensitive infrastructure details.

## 19. Pagination and Filtering

List APIs should support:

- `page`
- `limit`
- `search`
- `sortBy`
- `sortOrder`
- Relevant sport and date filters.

Example:

`GET /api/v1/players?page=1&limit=20`

Pagination limits must be validated on the server.

## 20. API Security Requirements

- Validate every request.
- Check authentication on protected endpoints.
- Enforce authorization on every operation.
- Validate resource ownership.
- Enforce academy boundaries.
- Apply rate limiting to sensitive endpoints.
- Protect authentication and password reset flows.
- Avoid exposing sensitive user fields.
- Prevent mass assignment vulnerabilities.
- Use safe database queries.
- Log important administrative operations.

## 21. API Versioning

All application APIs will initially use:

`/api/v1/`

Breaking API changes should be introduced through a new version where necessary.

## 22. Implementation Notes

This specification defines planned API contracts, not completed endpoints.

Actual Route Handlers will be implemented feature by feature.

Each endpoint must have:

- Defined request schema.
- Defined response schema.
- Authentication requirements.
- Authorization policy.
- Validation rules.
- Error handling.
- Relevant automated tests.

---

**Document Status:** Initial API Contract  
**Project:** Academy Desk