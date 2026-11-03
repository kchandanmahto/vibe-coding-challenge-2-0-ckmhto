# Testing Strategy — Academy Desk

**Version:** 1.0  
**Status:** Planned  
**Project:** Academy Desk

## 1. Purpose

This document defines the testing strategy to ensure Academy Desk is reliable, secure, responsive and works correctly for all user roles.

## 2. Testing Levels

| Testing Type | Purpose |
|---|---|
| Unit Testing | Test individual functions and business logic |
| Integration Testing | Test database, services and API interactions |
| End-to-End Testing | Test complete user workflows |
| Security Testing | Verify authentication, authorization and data protection |
| UI Testing | Verify responsive design and usability |
| Regression Testing | Ensure existing features continue working after changes |

## 3. Unit Testing

Use **Vitest** for unit tests.

Important test cases:

### Authentication and Authorization
- Valid and invalid login credentials.
- Unauthenticated users cannot access protected routes.
- Players cannot access Coach or Scout features.
- Regular Coaches cannot access unassigned sports.
- Head Coach has academy-wide permissions.

### Readiness Calculation

Readiness must follow these rules:

- Attendance percentage = Present sessions / Eligible sessions held × 100.
- Attendance must be at least 75%.
- Player must have at least 2 qualifying matches.
- Both conditions must be satisfied.

Test cases:

| Attendance | Matches | Expected Result |
|---:|---:|---|
| 74% | 2 | Not Ready |
| 75% | 1 | Not Ready |
| 75% | 2 | Ready |
| 90% | 3 | Ready |
| 60% | 5 | Not Ready |
| 100% | 0 | Not Ready |

Also test zero eligible sessions and decimal rounding.

### Validation
- Required fields cannot be empty.
- Invalid dates and scores are rejected.
- Duplicate records are prevented where required.
- Invalid IDs are handled safely.

## 4. Integration Testing

Test interactions between APIs, services and MongoDB.

| Module | Test Cases |
|---|---|
| Authentication | Login, logout, password reset |
| Academy | Academy creation and data isolation |
| Sports | Create, update and assign sports |
| Coaches | Create coach and assign sports |
| Players | Create, update and retrieve player |
| Scouts | Create account and restrict access |
| Sessions | Create, update and close session |
| Attendance | Mark Present/Absent and prevent duplicates |
| Matches | Create match, add participants and scores |
| Readiness | Calculate readiness using actual records |
| Audit Logs | Record sensitive actions and reopen reasons |

Additional checks:
- Closed sessions cannot be edited without authorized reopening.
- Reopening requires a reason.
- Unauthorized users cannot modify another user's records.
- Data from one academy cannot leak into another academy.

## 5. End-to-End Testing

Use **Playwright** for browser-based tests.

### Coach Workflow
1. Coach logs in.
2. Opens assigned sport.
3. Creates a player.
4. Creates a practice session.
5. Marks attendance.
6. Closes the session.
7. Creates a match.
8. Adds eligible players and scores.
9. Checks player readiness.

### Player Workflow
1. Player logs in.
2. Views own dashboard.
3. Views own attendance and match records.
4. Updates permitted profile fields.
5. Cannot access another player's records.

### Scout Workflow
1. Scout logs in.
2. Opens player directory.
3. Sees Ready players only.
4. Cannot edit player, attendance or match records.

### Head Coach Workflow
1. Head Coach logs in.
2. Creates and manages coaches.
3. Assigns sports to coaches.
4. Views academy-wide records.
5. Reviews audit logs.

## 6. Business Rule Testing

The following rules are mandatory:

- Public player registration must remain disabled.
- Only authorized Coaches can create Player and Scout accounts.
- Regular Coaches can manage only assigned sports and players.
- Players can access only their own records.
- Scouts can view only Ready players.
- Attendance records cannot be duplicated for the same player and session.
- A closed session cannot be modified without authorized reopening.
- Match participation must follow the approved attendance eligibility rule.
- Readiness must be calculated from valid attendance and qualifying match records.

**Important design requirement:** Match eligibility must be linked to a clearly defined relevant session or an explicitly approved eligibility policy. Do not implement an ambiguous same-day attendance check.

## 7. Security Testing

Verify the following:

- Unauthenticated API access is rejected.
- Role escalation is prevented.
- IDOR and unauthorized record access are prevented.
- Input validation is applied on the server.
- MongoDB injection and unsafe query input are prevented.
- Sensitive environment variables are never exposed to the browser.
- Passwords are securely hashed.
- Password reset tokens expire and cannot be reused.
- Rate limits protect sensitive authentication endpoints.
- Error responses do not expose secrets or internal stack traces.
- Session cookies use appropriate security settings.

## 8. Responsive UI Testing

Academy Desk is a mobile-first web application.

Test these viewport widths:

| Device Category | Width |
|---|---:|
| Small Mobile | 320px |
| Mobile | 375px |
| Mobile | 390px |
| Tablet | 768px |
| Laptop | 1024px |
| Desktop | 1440px |

Verify:
- Navigation works on mobile.
- Tables remain usable on small screens.
- Forms are easy to complete.
- Buttons and touch targets are comfortable.
- No horizontal overflow occurs.
- Loading, empty and error states are understandable.
- Keyboard navigation and basic accessibility work.

## 9. Performance Testing

- Avoid unnecessary database queries.
- Use pagination for large lists.
- Optimize images.
- Avoid unnecessary client-side JavaScript.
- Test dashboard loading and API response times.
- Check performance on slower mobile connections.

## 10. Regression Testing

After every major feature or bug fix:

- Run relevant unit tests.
- Run integration tests.
- Run important E2E workflows.
- Verify role permissions.
- Verify existing mobile layouts.
- Check that previously working features remain functional.

## 11. Continuous Integration

GitHub Actions should eventually run:

1. Dependency installation.
2. ESLint.
3. TypeScript checks.
4. Unit tests.
5. Production build.
6. Selected integration and E2E tests.

## 12. Planned Test Commands

These commands will be configured when the testing dependencies and scripts are installed:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run test:e2e
npm run build
```

Do not consider these test commands configured until their scripts and dependencies have been added.

## 13. Definition of Done

A feature is considered complete when:

- Requirements are implemented.
- Server-side validation is present.
- Role permissions are verified.
- Relevant tests pass.
- Mobile layout is checked.
- Error and loading states are handled.
- Documentation is updated.
- No critical security issue remains.

---

**End of Testing Strategy**