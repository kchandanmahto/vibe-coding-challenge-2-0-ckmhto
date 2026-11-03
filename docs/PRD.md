# Academy Desk — Product Requirements Document

**Project:** Academy Desk  
**Version:** 1.0  
**Status:** Planned  
**Platform:** Responsive Web Application

## 1. Project Overview

Academy Desk is a mobile-first sports academy management system designed to digitize player management, practice attendance, match records and player readiness tracking.

The system will initially support one sports academy with multiple sports and multiple coaches.

## 2. Project Objectives

- Replace manual notebook-based record keeping.
- Manage players, coaches and scouts.
- Track practice attendance.
- Record matches and player performance.
- Automatically calculate player readiness.
- Provide role-based dashboards.
- Make academy records accessible through mobile devices.

## 3. User Roles

### 3.1 Head Coach
- Access the complete academy.
- Create and manage Coach, Scout and Player accounts.
- Assign coaches to sports.
- Manage players, sessions, attendance and matches.
- View academy-wide analytics.
- Manage permissions and academy records.

### 3.2 Coach
- Access assigned sports and players.
- Register new players.
- Manage assigned players.
- Create and manage practice sessions.
- Mark attendance.
- Create matches and record player scores.
- View player readiness and performance.

### 3.3 Scout
- Log in to the application.
- View only players who meet Ready criteria.
- View permitted player performance information.
- Cannot modify academy records.

### 3.4 Player
- Log in to the application.
- View their own profile.
- View their own attendance.
- View their own match records and scores.
- View their readiness and performance.
- Cannot modify attendance, scores or performance records.

## 4. Authentication Requirements

- Email and password login.
- Google login.
- Secure password hashing.
- Forgot password functionality.
- Password reset through secure email link.
- Role-based authorization.
- Secure session management.
- Public player registration will not be available.

## 5. Core Functional Requirements

### 5.1 Academy Management
- Support one academy initially.
- Support multiple sports.
- Support multiple coaches.
- Assign coaches to specific sports.
- Head Coach has academy-wide access.

### 5.2 Player Management
- Coach creates player accounts.
- Store player name, age and sport.
- Maintain player profiles.
- Support player profile viewing and permitted personal-detail updates.
- Maintain player records securely.

### 5.3 Session Management
- Coach opens a practice session.
- Select session date and sport.
- Mark players Present or Absent.
- Close the session after attendance.
- Closed sessions become locked.
- Controlled reopening requires authorization and a reason.
- Maintain an audit history of changes.

### 5.4 Attendance Management
- Track attendance for every player.
- Calculate attendance percentage.
- Prevent duplicate attendance records.
- Only authorized Coaches can modify attendance.
- Players can only view their own attendance.

### 5.5 Match Management
- Create a match.
- Select participating players.
- Record individual player scores.
- Save match records.
- Players marked Absent from the relevant session must not be accepted as match participants under the academy's initial participation rule.
- Maintain match history.

### 5.6 Player Readiness

Attendance formula:

Attendance Percentage = (Present Sessions / Sessions Held) × 100

A player is Ready only when both conditions are satisfied:

1. Attendance percentage is at least 75%.
2. Player has participated in at least 2 matches.

Otherwise, the player is Not Ready.

Readiness should be calculated automatically using verified records.

### 5.7 Scout Access
- Scout can see only Ready players.
- Not Ready players must remain inaccessible to Scout.
- Access restrictions must be enforced on the server, not just hidden in the UI.

### 5.8 Player Dashboard
- Own profile.
- Own attendance percentage.
- Own match history.
- Own scores.
- Own readiness status.

## 6. User Interface Requirements

- Mobile-first responsive design.
- Support mobile, tablet and desktop.
- Simple and accessible navigation.
- Touch-friendly buttons and forms.
- Responsive tables and charts.
- Clear loading, empty and error states.
- Consistent design across all role-based dashboards.
- Optimized page performance.

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Language | TypeScript |
| Routing | Next.js App Router |
| Backend | Next.js Route Handlers |
| Database | MongoDB Atlas |
| Database Layer | Mongoose |
| Styling | Tailwind CSS |
| Validation | Zod |
| Authentication | Auth.js |
| Deployment | Vercel |
| Version Control | GitHub |

## 8. Non-Functional Requirements

### Security
- Server-side authorization.
- Secure password storage.
- Input validation.
- Protection against unauthorized access.
- Secure environment variable handling.
- Rate limiting for sensitive endpoints.
- Audit logs for important operations.

### Performance
- Fast loading on mobile networks.
- Optimized images and assets.
- Efficient database queries.
- Pagination for large records.

### Reliability
- Proper error handling.
- Database consistency.
- Backup and recovery planning.
- Automated testing.

### Maintainability
- Modular architecture.
- Reusable components.
- Clear documentation.
- Consistent coding standards.

## 9. Future Enhancements

These features are planned for future phases and are not part of the initial core implementation:

- Daily step tracking.
- Diet planning.
- Fitness progress tracking.
- Advanced analytics.
- AI assistant.
- Enquiry management.
- PDF analytics export.
- Printable reports.
- Machine Learning-based player performance insights.
- Python-based AI/ML services.

## 10. Out of Scope — Initial Version

- Payments.
- Video streaming.
- Native mobile application.
- Chat system.
- WhatsApp integration.
- Maps integration.

## 11. Deployment Requirements

- Public GitHub repository.
- Vercel deployment.
- MongoDB Atlas database.
- Environment variables configured securely.
- Working live URL.
- Production build verification.

## 12. Acceptance Criteria

The initial release will be considered ready when:

1. Coach can create and manage players.
2. Multiple sports and assigned coaches are supported.
3. Coach can create and close practice sessions.
4. Attendance is correctly recorded.
5. Absent players are rejected from match participation.
6. Match scores are correctly stored.
7. Readiness calculation follows the 75% and 2-match rules.
8. Scout sees only Ready players.
9. Player sees only their own records.
10. Authentication and permissions are tested.
11. Application works on mobile, tablet and desktop.
12. Production deployment works successfully.

---

**Document Status:** Initial Requirements Baseline  
**Project:** Academy Desk