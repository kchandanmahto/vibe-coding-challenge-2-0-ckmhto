# ðŸ† Academy Desk

### Smart Sports Academy Management System

**One Platform. Every Sport. Smarter Academy Management.**

## 🌐 Live Deployment

**Vercel URL:** https://vibe-coding-challenge-2-0-ckmhto-so.vercel.app/

**Login:** https://vibe-coding-challenge-2-0-ckmhto-so.vercel.app/login

Academy Desk is a modern, responsive sports academy management platform built to simplify and organize daily academy operations.

It provides dedicated workspaces for Head Coaches, Coaches, Players, and Scouts, helping them manage training sessions, attendance, matches, player performance, and academy activities from one centralized platform.

Developed for **Dumka Sports Academy**, Academy Desk aims to make sports management more organized, accessible, and efficient.

---

## ðŸŒŸ Key Features

### ðŸ« Academy Management
- Centralized sports academy management.
- Role-based dashboards and access control.
- Head Coach and Coach management.
- Player and Scout management.
- Multiple sports and training program management.

### ðŸ“… Practice & Attendance
- Create and manage practice sessions.
- Record player attendance.
- Maintain attendance history.
- Monitor daily training activities.

### ðŸ… Match & Performance Management
- Maintain match records.
- Track player scores and performance.
- Monitor player participation.
- Calculate player readiness using available records.

### ðŸ‘¥ Role-Based Workspaces

| Role | Responsibilities |
|---|---|
| Head Coach | Academy overview, coach management and sports operations |
| Coach | Training sessions, attendance and player performance |
| Player | Personal profile, attendance and performance records |
| Scout | Player discovery and performance review |

### ðŸ“± Modern User Experience
- Responsive interface for mobile, tablet and desktop.
- Modern and clean design.
- Dedicated dashboards for different user roles.
- Secure authentication and protected access.

---

## ðŸ” Hackathon Demo Login

**All hackathon participants and judges can use these demo accounts to explore the application.**

Demo URL:

`https://vibe-coding-challenge-2-0-ckmhto-so.vercel.app/login`

For the deployed demo, use the website's `/login` route.

### 1. Head Coach

| Field | Demo Credentials |
|---|---|
| Role | Head Coach |
| Email | `pvtkcmog@gmail.com` |
| Password | `chandanmahtobartuwa123` |

### 2. Coach

| Field | Demo Credentials |
|---|---|
| Role | Coach |
| Name | Test Coach |
| Email | `coach.test@academy.local` |
| Password | `CoachTest@2026Secure` |

### 3. Scout

| Field | Demo Credentials |
|---|---|
| Role | Scout |
| Name | Test Scout |
| Email | `scout.test@academy.local` |
| Password | `ScoutTest@2026Secure` |

### 4. Player

| Field | Demo Credentials |
|---|---|
| Role | Player |
| Name | Test Player |
| Email | `player.test@academy.local` |
| Password | `PlayerTest@2026Secure` |
| Player Code | `PLY-TEST-001` |

**Demo Access Instructions**
1. Open the Academy Desk website.
2. Navigate to the Login page.
3. Select or use the appropriate login flow for your role.
4. Enter the corresponding demo credentials.
5. Explore the available dashboard and features.

**Important:** These are shared demo credentials intended for the hackathon environment. Use only test data. Do not use these passwords for personal or production accounts. Rotate the credentials after the event. If this repository is public, anyone who can view it can also see these credentials.

---

## ðŸ› ï¸ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application framework |
| TypeScript | Type-safe development |
| Tailwind CSS | Responsive UI design |
| MongoDB Atlas | Database |
| Mongoose | Database modeling |
| Auth.js | Authentication |
| Zod | Data validation |
| Next.js Route Handlers | Backend API development |

---

## âš™ï¸ Installation & Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account or configured MongoDB database
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/kchandanmahto/vibe-coding-challenge-2-0-ckmhto.git
cd academy-desk
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory.

Add your application's required configuration:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_auth_secret

HEAD_COACH_EMAIL=your_head_coach_email
HEAD_COACH_INITIAL_PASSWORD=your_initial_password

TEST_COACH_NAME=Test Coach
TEST_COACH_EMAIL=coach.test@academy.local
TEST_COACH_PASSWORD=your_coach_password

TEST_SCOUT_NAME=Test Scout
TEST_SCOUT_EMAIL=scout.test@academy.local
TEST_SCOUT_PASSWORD=your_scout_password

TEST_PLAYER_NAME=Test Player
TEST_PLAYER_EMAIL=player.test@academy.local
TEST_PLAYER_PASSWORD=your_player_password
TEST_PLAYER_CODE=PLY-TEST-001
```

Use the exact environment variable names expected by your application code. Keep `.env.local` private and never commit real environment secrets.

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open the Application

Visit:

[http://localhost:3000](http://localhost:3000)

---

## ðŸ“ Project Structure

```text
academy-desk/
â”‚
â”œâ”€â”€ public/
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ models/
â”‚   â””â”€â”€ types/
â”‚
â”œâ”€â”€ .env.local
â”œâ”€â”€ .gitignore
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â””â”€â”€ README.md
```

*The structure above is a high-level overview. Refer to the repository for the complete implementation.*

---

## ðŸ”’ Security & Access Control

- Role-based access to application features.
- Protected application routes.
- Environment-based configuration.
- Server-side validation.
- Secure password handling.

Demo accounts are provided for hackathon evaluation and testing.

---

## ðŸŽ¯ Project Vision

Our vision is to make sports academy management easier through technology.

Academy Desk brings academy operations, training activities, attendance, and player performance into one connected platform.

We aim to help sports academies focus more on player development and less on manual administration.

---

## ðŸš§ Project Status

**Under Active Development ðŸš€**

Academy Desk is being continuously improved. Features, workflows, and user experiences are evolving as development progresses.

---


**Built with â¤ï¸ for the future of sports management.**

Â© 2026 Academy Desk. All rights reserved.
