# Academy Desk — System Architecture

**Version:** 1.0  
**Architecture Style:** Feature-Based Modular Monolith  
**Framework:** Next.js App Router  
**Status:** Planned

## 1. Architecture Overview

Academy Desk will use a modular monolithic architecture.

The application will run as one Next.js project containing:

- Frontend application.
- Backend API using Next.js Route Handlers.
- Server-side business logic.
- Database access layer.
- Authentication and authorization.
- Shared components and utilities.

A separate Express or FastAPI backend is not required for the initial version.

## 2. High-Level Architecture

```text
             USERS
    Coach / Scout / Player
              |
              v
       Next.js Frontend
       (Mobile-First UI)
              |
              v
       Next.js Route Handlers
          (API Layer)
              |
       Authentication
       Authorization
       Input Validation
              |
              v
        Service Layer
       (Business Logic)
              |
              v
       Repository Layer
        (Data Access)
              |
              v
        MongoDB Atlas
```

Vercel will host the Next.js application, including its frontend and server-side API functionality.

## 3. Technology Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Language | TypeScript |
| Routing | App Router |
| API | Route Handlers |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Auth.js |
| Validation | Zod |
| Charts | Recharts |
| Testing | Vitest + Playwright |
| Deployment | Vercel |
| Repository | GitHub |

## 4. Frontend Architecture

Frontend code will be organized inside `src/app`, `src/components` and `src/features`.

### App Router

- `(public)` — Public pages.
- `(auth)` — Login and password recovery.
- `(dashboard)` — Role-based dashboard routes.
- `api` — Backend API endpoints.

### Components

Reusable UI elements will be maintained separately:

- UI components.
- Navigation and layout.
- Forms.
- Tables.
- Charts.
- Dashboard components.
- Shared components.

### Mobile-First Strategy

- Design for mobile screens first.
- Extend layouts for tablets and desktops.
- Use responsive navigation.
- Make forms touch-friendly.
- Use responsive tables and charts.
- Optimize images and loading performance.

## 5. Backend Architecture

Backend code will be implemented through Next.js Route Handlers.

Location:

`src/app/api/`

Each API endpoint will follow this processing flow:

1. Receive request.
2. Validate authentication.
3. Check user permissions.
4. Validate request data using Zod.
5. Call the relevant service.
6. Access database through repository.
7. Return a consistent response.

Business logic must not be duplicated across Route Handlers.

## 6. Backend Layers

### Route Handler Layer

Responsible for:
- HTTP requests and responses.
- Authentication checks.
- Authorization checks.
- Input validation.
- Error handling.

### Service Layer

Location: `src/server/services/`

Responsible for:
- Player management logic.
- Attendance calculations.
- Session locking.
- Match management.
- Readiness calculations.
- Analytics operations.

### Repository Layer

Location: `src/server/repositories/`

Responsible for:
- MongoDB queries.
- Database reads and writes.
- Reusable data access operations.

### Policy Layer

Location: `src/server/policies/`

Responsible for:
- Role permissions.
- Coach sport assignments.
- Player ownership restrictions.
- Scout Ready-player restrictions.

## 7. Database Architecture

MongoDB Atlas will be the primary database.

Initial collections:

- users
- academies
- players
- coaches
- scouts
- sports
- sessions
- attendance
- matches
- enquiries

Mongoose schemas will define document structure, validation and indexes.

Database access will only happen on the server.

MongoDB credentials must never be exposed to browser code.

## 8. Authentication Architecture

Authentication will support:

- Email and password.
- Google login.
- Secure password hashing.
- Secure session management.
- Password reset through email links.

The system will have three application roles:

- Coach
- Scout
- Player

Head Coach will have academy-wide permissions within the Coach role.

Only authorized Coaches can create Player and Scout accounts.

## 9. Authorization Architecture

Authorization will be enforced on the server for every protected operation.

| Role | Access |
|---|---|
| Head Coach | Entire academy |
| Coach | Assigned sports and players |
| Scout | Ready players only |
| Player | Own profile and records only |

Hiding a button or page is not sufficient security.

Every protected API must independently verify permissions.

## 10. Feature Module Architecture

Each business feature will be organized inside `src/features/`.

Core modules:

- Authentication
- Academy
- Players
- Coaches
- Scouts
- Sports
- Sessions
- Attendance
- Matches
- Readiness
- Analytics
- Enquiries
- Exports

Future modules will be added when their development begins.

## 11. Error Handling Architecture

The application will use centralized error handling.

Requirements:

- Consistent API error responses.
- Appropriate HTTP status codes.
- No database credentials in error messages.
- No sensitive stack traces exposed to users.
- Server-side error logging.
- User-friendly error messages.

## 12. Security Architecture

Security controls will include:

- Server-side role authorization.
- Secure password hashing.
- Zod validation.
- Rate limiting.
- Secure cookies.
- CSRF protection where applicable.
- Secure HTTP headers.
- Environment variable protection.
- Database access restrictions.
- Audit logging.
- Dependency vulnerability monitoring.

## 13. Testing Architecture

Testing will be organized into:

- Unit tests.
- Integration tests.
- End-to-end tests.
- Security tests.
- Responsive UI tests.

Critical business rules must be tested before deployment.

## 14. Deployment Architecture

Deployment platform: Vercel.

Database: MongoDB Atlas.

Source control: GitHub.

Deployment flow:

```text
Developer
    |
    v
GitHub Repository
    |
    v
Vercel Build
    |
    v
Production Deployment
    |
    v
Live Academy Desk
    |
    v
MongoDB Atlas
```

Environment variables will be configured through Vercel project settings.

## 15. Future AI/ML Architecture

Python-based AI/ML functionality may be introduced later.

Planned architecture:

```text
Next.js Application
        |
        v
Next.js Route Handler
        |
        v
Python AI/ML Service
        |
        v
AI / ML Processing
        |
        v
Response to Next.js
```

A separate FastAPI service will only be introduced when required.

AI/ML services will communicate through authenticated server-to-server requests.

## 16. Architecture Principles

- Mobile-first development.
- Feature-based modular organization.
- Separation of concerns.
- Server-side security enforcement.
- Reusable components.
- Type-safe development.
- Centralized validation and error handling.
- Maintainable database access.
- Testable business logic.
- Future extensibility without unnecessary complexity.

---

**Document Status:** Initial Architecture Baseline  
**Project:** Academy Desk