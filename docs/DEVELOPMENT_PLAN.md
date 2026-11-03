# Academy Desk — Development Plan

**Version:** 1.0  
**Status:** Planned  
**Development Approach:** Agile + Incremental Development  
**Architecture:** Feature-Based Modular Monolith

## 1. Development Objectives

Build a secure, scalable, mobile-first sports academy management application using Next.js, TypeScript and MongoDB Atlas.

Development will follow small, independently testable tasks.

No feature will be considered complete until its implementation, validation and testing are finished.

## 2. Development Principles

- Mobile-first responsive development.
- Security-first implementation.
- Feature-based modular architecture.
- TypeScript strict mode.
- Reusable UI components.
- Server-side authorization.
- Centralized validation and error handling.
- Automated testing.
- Git commits after stable milestones.
- Documentation updated alongside implementation.
- Avoid unnecessary dependencies and overengineering.

## 3. Phase 1 — Project Foundation

Tasks:

- Verify Next.js project configuration.
- Configure TypeScript strict mode.
- Configure Tailwind CSS.
- Configure ESLint and Prettier.
- Organize final folder structure.
- Configure environment variables.
- Add reusable utility functions.
- Establish coding standards.
- Configure GitHub repository.
- Verify production build.

Deliverables:

- Working Next.js application.
- Clean project structure.
- Development environment.
- Initial coding guidelines.

## 4. Phase 2 — Database Foundation

Tasks:

- Configure MongoDB Atlas.
- Implement Mongoose connection.
- Configure database models.
- Create common schema validation.
- Implement database indexes.
- Implement repository layer.
- Add database error handling.
- Test database connectivity.

Deliverables:

- Secure database connection.
- Initial MongoDB collections.
- Validated data models.
- Reusable database layer.

## 5. Phase 3 — Authentication

Tasks:

- Configure Auth.js.
- Implement email/password authentication.
- Implement secure password hashing.
- Configure Google OAuth.
- Implement secure sessions.
- Implement logout.
- Implement forgot password.
- Implement password reset links.
- Implement account status validation.
- Test authentication flows.

Deliverables:

- Working authentication.
- Secure account management.
- Session handling.

## 6. Phase 4 — Authorization and Permissions

Tasks:

- Implement role definitions.
- Implement Head Coach permissions.
- Implement Coach permissions.
- Implement Scout permissions.
- Implement Player permissions.
- Enforce academy-level data isolation.
- Enforce sport assignments.
- Enforce player ownership.
- Add reusable authorization policies.
- Test unauthorized access scenarios.

Deliverables:

- Role-based access control.
- Secure API authorization.
- Permission enforcement.

## 7. Phase 5 — Application Layout and UI Foundation

Tasks:

- Create responsive application layout.
- Create mobile navigation.
- Create desktop sidebar.
- Create reusable buttons and inputs.
- Create form components.
- Create responsive tables.
- Create loading states.
- Create error states.
- Create empty states.
- Create confirmation dialogs.
- Establish consistent typography and spacing.

Deliverables:

- Mobile-first design system.
- Reusable UI components.
- Responsive application shell.

## 8. Phase 6 — Academy and Sports Management

Tasks:

- Create academy configuration.
- Create sports management.
- Support multiple sports.
- Create Coach management.
- Assign Coaches to sports.
- Implement Head Coach access.
- Validate sport assignments.

Deliverables:

- Academy management.
- Sports management.
- Coach assignment management.

## 9. Phase 7 — Player Management

Tasks:

- Create Player accounts through authorized Coaches.
- Implement player profile management.
- Add player details.
- Implement profile image handling when configured.
- Allow Players to update approved personal information.
- Prevent unauthorized profile modifications.
- Implement player search and pagination.

Deliverables:

- Player registration.
- Player profiles.
- Player management dashboard.

## 10. Phase 8 — Session Management

Tasks:

- Create practice sessions.
- Select sport and date.
- Prevent duplicate sessions according to academy policy.
- List relevant players.
- Implement session status.
- Implement session closing.
- Implement controlled session reopening.
- Record reopening reasons.
- Maintain audit history.

Deliverables:

- Session management.
- Session locking.
- Controlled reopening.

## 11. Phase 9 — Attendance Management

Tasks:

- Mark Present and Absent.
- Validate player-session relationships.
- Prevent duplicate attendance.
- Restrict attendance changes to authorized Coaches.
- Lock attendance after session closure.
- Implement controlled corrections.
- Calculate attendance percentages.
- Test attendance calculations.

Deliverables:

- Attendance management.
- Attendance history.
- Accurate attendance percentage.

## 12. Phase 10 — Match Management

Tasks:

- Create matches.
- Select eligible players.
- Validate sport assignments.
- Validate attendance-based participation rules.
- Record individual player scores.
- Implement sport-specific score validation.
- Complete matches.
- Maintain match history.
- Audit controlled corrections.

Deliverables:

- Match management.
- Player performance records.
- Match history.

## 13. Phase 11 — Readiness Engine

Tasks:

- Calculate attendance percentage.
- Count completed matches.
- Implement the 75% attendance condition.
- Implement the minimum two-match condition.
- Calculate Ready and Not Ready status.
- Prevent manual readiness modification.
- Implement readiness filters.
- Test all readiness conditions.

Deliverables:

- Automatic readiness calculation.
- Reliable Ready-player listing.

## 14. Phase 12 — Role-Based Dashboards

### Head Coach Dashboard

- Academy overview.
- Sports and Coach management.
- Player management.
- Session management.
- Attendance overview.
- Match records.
- Readiness overview.

### Coach Dashboard

- Assigned sports.
- Assigned players.
- Practice sessions.
- Attendance management.
- Match management.
- Player performance.

### Scout Dashboard

- Ready-player listing only.
- Permitted player information.
- Player performance overview.

### Player Dashboard

- Own profile.
- Own attendance.
- Own match history.
- Own scores.
- Own readiness status.

Deliverables:

- Four role-specific experiences.
- Responsive dashboards.

## 15. Phase 13 — Analytics and Reporting

Tasks:

- Academy statistics.
- Attendance analytics.
- Match analytics.
- Player performance analytics.
- Readiness analytics.
- Date and sport filters.
- Responsive charts.
- Printable reports.
- PDF exports.

Deliverables:

- Analytics dashboard.
- Reporting functionality.

## 16. Phase 14 — Enquiry Management

Tasks:

- Public enquiry form.
- Input validation.
- Spam and abuse protection.
- Enquiry listing.
- Enquiry status management.
- Contact information handling.

Deliverables:

- Enquiry submission.
- Enquiry management dashboard.

## 17. Phase 15 — Quality Assurance

Tasks:

- Unit testing.
- Integration testing.
- End-to-end testing.
- Authentication testing.
- Authorization testing.
- Database validation testing.
- API security testing.
- Mobile responsiveness testing.
- Accessibility checks.
- Performance testing.
- Production build verification.

Deliverables:

- Tested application.
- Resolved critical bugs.
- Verified security controls.

## 18. Phase 16 — Deployment

Tasks:

- Prepare production configuration.
- Configure Vercel.
- Configure MongoDB Atlas production access.
- Set environment variables.
- Verify GitHub integration.
- Deploy application.
- Test production APIs.
- Test login and role permissions.
- Verify mobile experience.
- Monitor production errors.

Deliverables:

- Live Academy Desk application.
- Public production URL.

## 19. Future Development Phases

These modules will be considered after the core application is stable.

### Fitness and Diet

- Daily step tracking.
- Diet plans.
- Fitness progress.
- Fitness reports.

### AI Assistant

- Academy information assistant.
- Player performance queries.
- Analytics assistance.

### Machine Learning

- Player performance analysis.
- Performance trend identification.
- Predictive insights.
- Python-based AI/ML service integration when required.

### Advanced Reporting

- Advanced analytics.
- PDF reports.
- Printable dashboards.
- Custom report filters.

## 20. Vibe Coding Workflow

Every development task must follow this workflow:

1. Understand the requirement.
2. Review relevant project documentation.
3. Inspect existing code.
4. Prepare a small implementation plan.
5. Write a clear coding-agent prompt.
6. Review the proposed changes.
7. Implement the task.
8. Run relevant tests.
9. Review security and code quality.
10. Fix identified issues.
11. Update documentation.
12. Commit stable changes.

AI-generated code must never be accepted without review and testing.

## 21. Definition of Done

A feature is complete only when:

- Requirements are satisfied.
- Code follows project architecture.
- TypeScript checks pass.
- Lint checks pass.
- Relevant tests pass.
- Authorization is verified.
- Mobile responsiveness is verified.
- Error handling is implemented.
- Documentation is updated.
- No known critical security issue remains.

## 22. Development Priority

Priority order:

1. Project foundation.
2. Database.
3. Authentication.
4. Authorization.
5. Responsive UI foundation.
6. Academy and sports.
7. Players.
8. Sessions.
9. Attendance.
10. Matches.
11. Readiness.
12. Dashboards.
13. Analytics and reporting.
14. Enquiries.
15. Quality assurance.
16. Deployment.

---

**Document Status:** Initial Development Roadmap  
**Project:** Academy Desk