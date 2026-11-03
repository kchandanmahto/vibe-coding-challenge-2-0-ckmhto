# Academy Desk — Database Schema

**Database:** MongoDB Atlas  
**ODM:** Mongoose  
**Version:** 1.0  
**Status:** Planned

## 1. Database Overview

Academy Desk will use MongoDB Atlas as its primary database.

The database will initially support one academy with multiple sports, coaches, scouts and players.

All database access will happen through server-side code.

## 2. Collection Overview

| Collection | Purpose |
|---|---|
| academies | Academy information |
| users | Login credentials and roles |
| sports | Sports offered by academy |
| coaches | Coach-specific information |
| scouts | Scout-specific information |
| players | Player profiles |
| sessions | Practice sessions |
| attendance | Player attendance records |
| matches | Match information |
| enquiries | Academy enquiries |
| audit_logs | Important activity history |

Authentication provider account records and sessions will also be managed according to the selected Auth.js adapter strategy.

## 3. Common Database Rules

- Every document will have a MongoDB ObjectId.
- Store timestamps using UTC dates.
- Use `createdAt` and `updatedAt` where applicable.
- Validate important fields using Mongoose and service-level validation.
- Add indexes for frequently queried fields.
- Use references for related documents.
- Never trust user-supplied IDs without checking authorization.
- Use atomic database operations where consistency requires them.

## 4. Academy Collection

Collection: `academies`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Academy ID |
| name | String | Academy name |
| address | String | Academy address |
| contactEmail | String | Official email |
| contactPhone | String | Contact number |
| status | String | Active or inactive |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Initially, only one academy will be created.

## 5. Users Collection

Collection: `users`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | User ID |
| academyId | ObjectId | Academy reference |
| name | String | User name |
| email | String | Unique login email |
| passwordHash | String | Hashed password, if using credentials |
| role | String | HEAD_COACH, COACH, SCOUT, PLAYER |
| status | String | ACTIVE, INACTIVE, SUSPENDED |
| emailVerified | Date | Email verification date |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Rules:

- Email must be unique.
- Passwords must never be stored in plain text.
- Google authentication accounts must be linked securely.
- Only authorized Coaches can create Player and Scout accounts.
- Public registration is disabled.

## 6. Sports Collection

Collection: `sports`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Sport ID |
| academyId | ObjectId | Academy reference |
| name | String | Sport name |
| description | String | Optional description |
| status | String | Active or inactive |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

A sport name should be unique within an academy.

## 7. Coaches Collection

Collection: `coaches`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Coach profile ID |
| userId | ObjectId | User reference |
| academyId | ObjectId | Academy reference |
| assignedSportIds | ObjectId[] | Assigned sports |
| isHeadCoach | Boolean | Academy-wide Coach flag |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Head Coach has academy-wide access.

Regular Coaches can manage only their assigned sports and authorized players.

## 8. Scouts Collection

Collection: `scouts`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Scout profile ID |
| userId | ObjectId | User reference |
| academyId | ObjectId | Academy reference |
| status | String | Active or inactive |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Scouts have read-only access to Ready players.

## 9. Players Collection

Collection: `players`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Player ID |
| userId | ObjectId | Login account reference |
| academyId | ObjectId | Academy reference |
| name | String | Player name |
| dateOfBirth | Date | Date of birth |
| age | Number | Derived age, if needed |
| gender | String | Optional gender information |
| phone | String | Contact number |
| address | String | Address |
| emergencyContact | Object | Emergency contact |
| photoUrl | String | Profile photo reference |
| sportIds | ObjectId[] | Enrolled sports |
| status | String | Active or inactive |
| createdBy | ObjectId | Creating Coach |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Rules:

- Coach creates player accounts.
- Players can update only approved personal profile fields.
- Players cannot change attendance, match scores or readiness records.
- Age should be calculated from date of birth rather than trusted as a manually maintained value.

## 10. Sessions Collection

Collection: `sessions`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Session ID |
| academyId | ObjectId | Academy reference |
| sportId | ObjectId | Sport reference |
| date | Date | Session date |
| status | String | OPEN or CLOSED |
| createdBy | ObjectId | Coach reference |
| closedBy | ObjectId | Coach reference |
| closedAt | Date | Closing time |
| reopenedAt | Date | Last reopening time |
| reopenReason | String | Mandatory reopening reason |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Rules:

- A session belongs to one sport.
- Duplicate sessions for the same sport and date should be prevented according to the academy's session policy.
- Closed sessions are locked.
- Only authorized Coaches can reopen a session.
- Reopening requires a reason and audit record.

## 11. Attendance Collection

Collection: `attendance`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Attendance ID |
| academyId | ObjectId | Academy reference |
| sessionId | ObjectId | Session reference |
| playerId | ObjectId | Player reference |
| sportId | ObjectId | Sport reference |
| status | String | PRESENT or ABSENT |
| markedBy | ObjectId | Coach reference |
| markedAt | Date | Marking time |
| updatedAt | Date | Last update |

Rules:

- One attendance record per player per session.
- A unique compound index should be created on `sessionId + playerId`.
- Attendance can only be changed by authorized Coaches while the session is open.
- Attendance percentage is calculated from eligible closed sessions.
- Duplicate attendance records must be rejected.

## 12. Matches Collection

Collection: `matches`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Match ID |
| academyId | ObjectId | Academy reference |
| sportId | ObjectId | Sport reference |
| title | String | Match title |
| matchDate | Date | Match date |
| opponent | String | Opponent name |
| participants | Array | Player participation and scores |
| status | String | DRAFT or COMPLETED |
| createdBy | ObjectId | Coach reference |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

Participant structure:

- playerId: ObjectId
- score: Number
- participationStatus: String

Rules:

- Only selected players can receive scores.
- Duplicate player entries are prohibited.
- Negative scores are prohibited.
- Sport-specific score validation will be implemented.
- Players must satisfy the initial attendance-based participation rule.
- Completed match records require controlled corrections and audit history.

## 13. Enquiries Collection

Collection: `enquiries`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Enquiry ID |
| academyId | ObjectId | Academy reference |
| name | String | Enquirer name |
| phone | String | Contact number |
| email | String | Email |
| sportId | ObjectId | Interested sport |
| message | String | Enquiry details |
| status | String | NEW, CONTACTED, CLOSED |
| createdAt | Date | Creation time |
| updatedAt | Date | Last update |

## 14. Audit Logs Collection

Collection: `audit_logs`

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Log ID |
| academyId | ObjectId | Academy reference |
| actorId | ObjectId | User performing action |
| action | String | Action type |
| entityType | String | Affected resource type |
| entityId | ObjectId | Affected resource ID |
| reason | String | Reason, where required |
| metadata | Object | Safe change metadata |
| createdAt | Date | Event time |

Important actions include:

- Attendance changes.
- Session reopening.
- Match corrections.
- Account creation and suspension.
- Permission changes.

Audit records must not contain passwords, tokens or other secrets.

## 15. Important Database Indexes

Recommended indexes:

| Collection | Index |
|---|---|
| users | Unique email |
| sports | academyId + name |
| coaches | userId + academyId |
| scouts | userId + academyId |
| players | userId + academyId |
| players | academyId + sportIds |
| sessions | academyId + sportId + date |
| attendance | Unique sessionId + playerId |
| attendance | playerId + status |
| matches | academyId + sportId + matchDate |
| enquiries | academyId + status |
| audit_logs | academyId + createdAt |

Index definitions must be validated against actual query patterns before production.

## 16. Readiness Calculation

Readiness should be calculated from verified database records, not stored as an independently editable player field.

Formula:

Attendance Percentage = (Present Closed Sessions / Eligible Closed Sessions) × 100

Ready conditions:

- Attendance percentage >= 75%.
- At least 2 completed matches with valid participation.

Both conditions must be true.

The same calculation logic must be used for Coach, Scout and Player views.

## 17. Data Integrity and Consistency

- Validate all references before writing.
- Enforce academy boundaries in database queries.
- Prevent duplicate attendance.
- Prevent invalid match participants.
- Use MongoDB transactions when multiple writes must succeed or fail together, subject to Atlas deployment support.
- Maintain audit logs for controlled changes.
- Avoid deleting historical attendance and match records without an approved retention policy.

## 18. Future Collections

The following collections may be introduced in future phases:

- diet_plans
- fitness_logs
- step_records
- ai_insights
- notification_logs
- report_exports

They are not part of the initial implementation.

---

**Document Status:** Initial Database Design  
**Project:** Academy Desk