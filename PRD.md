# Product Requirements Document (PRD)
## Attendance Tracker - All-in-One College App

---

## 📋 Project Overview

A comprehensive, role-based attendance tracking system for college cohorts with dynamic scheduling, secure QR-based attendance verification, and intelligent shift management.

**Tech Stack:**
- Frontend: Next.js 14+ (App Router), TypeScript, TailwindCSS
- Backend: Express.js microservices, TypeScript
- Database: PostgreSQL
- Authentication: JWT
- File Storage: AWS S3 / Local storage
- Real-time: Socket.io (for QR refresh)

---

## 🎯 Project Phases (10 Phases)

---

## **PHASE 1: Project Setup & Architecture Foundation**

### Goals:
- Initialize monorepo structure
- Setup base microservices architecture
- Configure development environment
- Setup CI/CD pipeline basics

### Deliverables:

#### Folder Structure:
```
attendance-tracker/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # Reusable components
│   │   │   ├── lib/           # Utilities
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── types/         # TypeScript types
│   │   │   └── styles/        # Global styles
│   │   ├── public/
│   │   └── package.json
│   │
│   └── mobile/                 # Future mobile app (placeholder)
│
├── services/
│   ├── auth-service/          # Authentication microservice
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── user-service/          # User management
│   ├── attendance-service/    # Attendance logic
│   ├── schedule-service/      # Scheduling system
│   └── notification-service/  # Notifications (email/push)
│
├── packages/
│   ├── shared-types/          # Shared TypeScript types
│   ├── config/                # Shared configurations
│   └── utils/                 # Shared utilities
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/            # K8s configs (optional)
│   └── nginx/
│
├── docs/
│   ├── api/                   # API documentation
│   └── architecture/          # Architecture diagrams
│
├── .github/
│   └── workflows/             # CI/CD
│
├── docker-compose.yml
├── package.json               # Root package.json
├── turbo.json                 # Turborepo config
└── README.md
```

#### Tech Setup:
- Turborepo/Nx for monorepo management
- Docker & Docker Compose
- PostgreSQL with Prisma ORM
- ESLint + Prettier configurations
- Husky for git hooks

### Completion Checklist:
- [ ] Monorepo structure initialized
- [ ] All services have base Express.js setup
- [ ] Next.js app initialized with TypeScript
- [ ] PostgreSQL database running in Docker
- [ ] Prisma schema initialized
- [ ] Environment variables configured (.env.example)
- [ ] Git repository with proper .gitignore
- [ ] README with setup instructions
- [ ] Docker Compose running all services
- [ ] Basic health check endpoints for all services

---

## **PHASE 2: Authentication & Authorization System**

### Goals:
- Implement JWT-based authentication
- Setup role-based access control (RBAC)
- Create login flow with role redirection

### Deliverables:

#### Auth Service Structure:
```
services/auth-service/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   └── validator.util.ts
│   └── index.ts
```

#### Features:
- User registration (internal - by super admin)
- Login with email/password
- JWT token generation & refresh
- Role-based middleware
- Password hashing (bcrypt)
- Token blacklisting for logout

#### Database Schema (Prisma):
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  studentProfile  Student?
  mentorProfile   Mentor?
  adminProfile    Admin?
}

enum Role {
  SUPER_ADMIN
  ADMIN
  MENTOR
  STUDENT
}
```

#### Frontend (Next.js):
```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       └── ProtectedRoute.tsx
├── lib/
│   ├── auth.ts
│   └── api-client.ts
└── hooks/
    └── useAuth.ts
```

#### UI Components:
- Login page (orange theme)
- Role-based dashboard redirects
- Protected route wrapper
- Auth context provider

### Completion Checklist:
- [ ] Auth service endpoints working (/login, /refresh, /logout)
- [ ] JWT generation & validation implemented
- [ ] Password hashing implemented
- [ ] Role-based middleware created
- [ ] Login page designed and functional
- [ ] Auth context/provider in Next.js
- [ ] Role-based redirects working
- [ ] Protected routes implemented
- [ ] Token refresh mechanism working
- [ ] Auth API tests written (>80% coverage)

---

## **PHASE 3: User Service & Super Admin Dashboard**

### Goals:
- Create user management service
- Build Super Admin dashboard
- Implement cohort creation
- Admin assignment to cohorts

### Deliverables:

#### User Service Structure:
```
services/user-service/
├── src/
│   ├── controllers/
│   │   ├── cohort.controller.ts
│   │   ├── admin.controller.ts
│   │   └── user.controller.ts
│   ├── models/
│   │   ├── cohort.model.ts
│   │   └── admin.model.ts
│   ├── routes/
│   │   ├── cohort.routes.ts
│   │   └── admin.routes.ts
│   └── index.ts
```

#### Database Schema:
```prisma
model Cohort {
  id          String   @id @default(uuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  admins      Admin[]
  batches     Batch[]
  students    Student[]
}

model Admin {
  id        String   @id @default(uuid())
  userId    String   @unique
  cohortId  String
  
  user      User     @relation(fields: [userId], references: [id])
  cohort    Cohort   @relation(fields: [cohortId], references: [id])
  
  createdAt DateTime @default(now())
}
```

#### Frontend Structure:
```
apps/web/src/app/
├── (dashboard)/
│   ├── super-admin/
│   │   ├── page.tsx              # Overview
│   │   ├── cohorts/
│   │   │   ├── page.tsx          # Cohort list
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Cohort details
│   │   └── layout.tsx
│   └── layout.tsx
└── components/
    └── super-admin/
        ├── CohortCard.tsx
        ├── CreateCohortModal.tsx
        ├── AssignAdminModal.tsx
        ├── StatsCard.tsx
        └── AdminTable.tsx
```

#### Features:
- Create/Edit/Delete cohorts
- Assign admins to cohorts
- View system statistics
- Manage admin users

#### UI Components:
- Dashboard cards (stats)
- Cohort creation modal
- Admin assignment interface
- Data tables with search/filter

### Completion Checklist:
- [ ] User service endpoints functional
- [ ] Cohort CRUD operations working
- [ ] Admin assignment logic implemented
- [ ] Super Admin dashboard designed
- [ ] Cohort creation UI completed
- [ ] Admin assignment UI completed
- [ ] System stats cards implemented
- [ ] Role verification (only super admin access)
- [ ] API integration tests written
- [ ] UI responsive on mobile

---

## **PHASE 4: Student Management & Batch System**

### Goals:
- Build student management functionality
- CSV/Excel upload feature
- Auto-batch allocation logic
- Shift management

### Deliverables:

#### Database Schema:
```prisma
model Student {
  id        String   @id @default(uuid())
  userId    String   @unique
  regno     String   @unique
  shift     Shift
  batchId   String?
  cohortId  String
  
  user      User       @relation(fields: [userId], references: [id])
  batch     Batch?     @relation(fields: [batchId], references: [id])
  cohort    Cohort     @relation(fields: [cohortId], references: [id])
  attendance Attendance[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Shift {
  MORNING
  AFTERNOON
}

model Batch {
  id        String   @id @default(uuid())
  name      String
  cohortId  String
  
  cohort    Cohort   @relation(fields: [cohortId], references: [id])
  students  Student[]
  schedules Schedule[]
  
  createdAt DateTime @default(now())
}
```

#### Service Structure:
```
services/user-service/src/
├── controllers/
│   ├── student.controller.ts
│   └── batch.controller.ts
├── utils/
│   ├── csv-parser.util.ts
│   └── batch-allocator.util.ts
└── validators/
    └── student.validator.ts
```

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/admin/
├── students/
│   ├── page.tsx              # Student list
│   ├── upload/
│   │   └── page.tsx          # CSV upload
│   └── [id]/
│       └── page.tsx          # Student details
└── batches/
    ├── page.tsx              # Batch list
    └── [id]/
        └── page.tsx          # Batch details

components/admin/
├── StudentTable.tsx
├── CSVUploader.tsx
├── BatchAssignment.tsx
├── ShiftBadge.tsx
└── StudentForm.tsx
```

#### Features:
- CSV/Excel file upload (drag & drop)
- Parse student data (Name, Email, Regno, Shift)
- Bulk student creation
- Auto-batch allocation based on schedule
- Manual batch assignment
- Student CRUD operations

#### CSV Format Example:
```csv
Name,Email,Regno,Shift
John Doe,john@example.com,2021001,MORNING
Jane Smith,jane@example.com,2021002,AFTERNOON
```

### Completion Checklist:
- [ ] Student CRUD endpoints working
- [ ] CSV parser implemented
- [ ] File upload functionality working
- [ ] Bulk student creation working
- [ ] Auto-batch allocation logic implemented
- [ ] Student list page with filters
- [ ] CSV upload UI completed (drag & drop)
- [ ] Batch assignment UI functional
- [ ] Shift badges and indicators working
- [ ] Validation for duplicate Regno/Email
- [ ] Error handling for invalid CSV
- [ ] Mobile responsive tables

---

## **PHASE 5: Scheduling System**

### Goals:
- Build dynamic scheduling system
- Implement shift logic
- Create weekly timetable structure
- Schedule visualization

### Deliverables:

#### Database Schema:
```prisma
model Schedule {
  id          String    @id @default(uuid())
  batchId     String
  dayOfWeek   DayOfWeek
  period      Int       # 1-8 (class periods)
  shift       Shift     # MORNING or AFTERNOON
  startTime   String    # "09:00"
  endTime     String    # "10:00"
  mentorId    String?
  
  batch       Batch     @relation(fields: [batchId], references: [id])
  mentor      Mentor?   @relation(fields: [mentorId], references: [id])
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([batchId, dayOfWeek, period])
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model Mentor {
  id        String     @id @default(uuid())
  userId    String     @unique
  cohortId  String
  
  user      User       @relation(fields: [userId], references: [id])
  schedules Schedule[]
  
  createdAt DateTime   @default(now())
}
```

#### Service Structure:
```
services/schedule-service/
├── src/
│   ├── controllers/
│   │   ├── schedule.controller.ts
│   │   └── timetable.controller.ts
│   ├── utils/
│   │   ├── eligibility-checker.util.ts
│   │   └── schedule-validator.util.ts
│   └── routes/
│       └── schedule.routes.ts
```

#### Features:
- Create weekly schedules for batches
- Assign mentors to schedules
- Eligibility logic: Only morning shift students can attend afternoon cohort classes
- Conflict detection (same mentor, same time)
- Get student's daily schedule
- Get mentor's daily schedule

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/admin/
└── schedules/
    ├── page.tsx              # Schedule overview
    ├── create/
    │   └── page.tsx
    └── timetable/
        └── page.tsx          # Weekly view

components/schedule/
├── WeeklyTimetable.tsx
├── ScheduleCreator.tsx
├── PeriodSlot.tsx
├── MentorAssignmentDropdown.tsx
└── EligibilityIndicator.tsx
```

#### UI Features:
- Weekly grid timetable view
- Drag-and-drop schedule creation (optional)
- Color-coded shifts
- Mentor assignment UI
- Conflict warnings

### Completion Checklist:
- [ ] Schedule CRUD endpoints working
- [ ] Eligibility logic implemented
- [ ] Conflict detection working
- [ ] Get daily schedule by student
- [ ] Get daily schedule by mentor
- [ ] Timetable creation UI completed
- [ ] Weekly timetable view designed
- [ ] Mentor assignment dropdown working
- [ ] Shift-based color coding implemented
- [ ] Mobile responsive timetable
- [ ] Validation for schedule conflicts
- [ ] API tests for eligibility logic

---

## **PHASE 6: QR Code & Code Generation System**

### Goals:
- Implement dynamic QR code generation
- Build 30-second refresh mechanism
- Create manual code fallback
- Real-time code validation

### Deliverables:

#### Database Schema:
```prisma
model AttendanceCode {
  id            String    @id @default(uuid())
  studentId     String
  scheduleId    String
  code          String    @unique
  qrData        String
  codeType      CodeType
  expiresAt     DateTime
  isUsed        Boolean   @default(false)
  usedAt        DateTime?
  
  student       Student   @relation(fields: [studentId], references: [id])
  
  createdAt     DateTime  @default(now())
  
  @@index([code])
  @@index([studentId, scheduleId, createdAt])
}

enum CodeType {
  QR_CODE
  MANUAL_CODE
}
```

#### Service Structure:
```
services/attendance-service/
├── src/
│   ├── controllers/
│   │   ├── code-generator.controller.ts
│   │   └── code-validator.controller.ts
│   ├── utils/
│   │   ├── qr-generator.util.ts
│   │   ├── code-generator.util.ts
│   │   └── time-validator.util.ts
│   ├── websocket/
│   │   └── code-refresh.handler.ts
│   └── routes/
│       └── attendance-code.routes.ts
```

#### Features:
- Generate QR code with embedded data (studentId, scheduleId, timestamp)
- 30-second auto-refresh using Socket.io
- Generate manual 6-digit code
- Validate code is:
  - Not expired
  - Not already used
  - For correct day
  - For correct period
  - By eligible student

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/student/
└── attendance/
    ├── page.tsx              # QR display
    └── manual/
        └── page.tsx          # Manual code

components/student/
├── QRCodeDisplay.tsx
├── CodeRefreshTimer.tsx
├── ManualCodeDisplay.tsx
└── AttendanceStatus.tsx

lib/
└── socket-client.ts
```

#### QR Data Format (JWT):
```json
{
  "studentId": "uuid",
  "scheduleId": "uuid",
  "timestamp": 1234567890,
  "exp": 1234567920
}
```

#### Manual Code Format:
- 6-digit alphanumeric
- Valid for current period only
- One-time use

### Completion Checklist:
- [ ] QR code generation working
- [ ] QR contains encrypted student/schedule data
- [ ] 30-second refresh implemented (Socket.io)
- [ ] Manual code generation working
- [ ] Code validation endpoint functional
- [ ] QR display UI with timer
- [ ] Refresh animation implemented
- [ ] Manual code UI completed
- [ ] Socket connection stable
- [ ] Countdown timer visual (circular progress)
- [ ] Code expiry handled gracefully
- [ ] Mobile-optimized QR display

---

## **PHASE 7: Attendance Marking System**

### Goals:
- Build mentor attendance interface
- QR scanning functionality
- Manual code entry
- Attendance recording

### Deliverables:

#### Database Schema:
```prisma
model Attendance {
  id            String         @id @default(uuid())
  studentId     String
  scheduleId    String
  status        AttendanceStatus
  markedBy      String         # Mentor/Admin userId
  method        AttendanceMethod
  codeId        String?
  remarks       String?
  
  student       Student        @relation(fields: [studentId], references: [id])
  
  createdAt     DateTime       @default(now())
  
  @@unique([studentId, scheduleId])
  @@index([scheduleId, status])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum AttendanceMethod {
  QR_SCAN
  MANUAL_CODE
  ADMIN_OVERRIDE
}
```

#### Service Structure:
```
services/attendance-service/src/
├── controllers/
│   ├── attendance.controller.ts
│   └── scanner.controller.ts
├── utils/
│   ├── qr-decoder.util.ts
│   └── eligibility-validator.util.ts
└── routes/
    └── attendance.routes.ts
```

#### Features:
- QR scan endpoint (receives scanned data)
- Manual code entry endpoint
- Validate student eligibility
- Mark attendance (prevent duplicates)
- Get attendance list for a schedule
- Update attendance status
- Bulk attendance view

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/mentor/
└── attendance/
    ├── page.tsx              # Today's classes
    ├── scan/
    │   └── page.tsx          # QR scanner
    └── manual/
        └── page.tsx          # Manual entry

components/mentor/
├── QRScanner.tsx
├── ManualCodeInput.tsx
├── AttendanceList.tsx
├── StudentAttendanceCard.tsx
└── BatchSelector.tsx
```

#### QR Scanner:
- Use device camera
- Decode QR data
- Send to backend for validation
- Show success/error feedback

#### Manual Code Entry:
- Input field for 6-digit code
- Validate and mark attendance
- Display student name on success

### Completion Checklist:
- [ ] QR scan endpoint working
- [ ] Manual code endpoint working
- [ ] Attendance validation implemented
- [ ] Duplicate prevention working
- [ ] QR scanner UI functional (camera access)
- [ ] Manual code input UI completed
- [ ] Attendance list with filters
- [ ] Real-time attendance updates
- [ ] Success/error toast notifications
- [ ] Attendance stats for mentor
- [ ] Mobile camera permissions handled
- [ ] Edge cases handled (invalid QR, expired code)

---

## **PHASE 8: Student & Mentor Dashboards**

### Goals:
- Complete student dashboard
- Complete mentor dashboard
- Display daily schedules
- Show weekly timetables

### Deliverables:

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/
├── student/
│   ├── page.tsx              # Dashboard
│   ├── schedule/
│   │   ├── page.tsx          # Weekly timetable
│   │   └── today/
│   │       └── page.tsx      # Today's classes
│   └── attendance/
│       └── history/
│           └── page.tsx      # Attendance history
│
└── mentor/
    ├── page.tsx              # Dashboard
    ├── schedule/
    │   └── page.tsx          # Weekly schedule
    └── batches/
        └── [id]/
            └── page.tsx      # Batch details

components/
├── student/
│   ├── TodayClassCard.tsx
│   ├── WeeklyTimetableGrid.tsx
│   ├── MentorInfoCard.tsx
│   ├── EligibilityBadge.tsx
│   └── AttendanceHistory.tsx
│
└── mentor/
    ├── TodayBatchesCard.tsx
    ├── AttendanceSummary.tsx
    ├── ScheduleCalendar.tsx
    └── BatchStudentsList.tsx
```

#### Student Dashboard Features:
- Today's class card
  - Batch name
  - Mentor name
  - Time & period
  - Eligibility indicator
- QR code generator (prominent)
- Manual code generator (fallback)
- Weekly timetable view
- Attendance history

#### Mentor Dashboard Features:
- Today's assigned batches
- Attendance marking panel
- Live attendance list (Present/Absent)
- Schedule overview
- Quick stats (attendance rate)

#### UI Components:
- Glass-morphism cards
- Color-coded period slots
- Orange accent buttons
- Smooth transitions
- Loading skeletons

### Completion Checklist:
- [ ] Student dashboard designed
- [ ] Student today's class card
- [ ] Student weekly timetable
- [ ] Student attendance history
- [ ] Eligibility logic reflected in UI
- [ ] Mentor dashboard designed
- [ ] Mentor today's batches view
- [ ] Mentor attendance panel
- [ ] Live attendance status updates
- [ ] Mobile responsive dashboards
- [ ] Loading states implemented
- [ ] Empty states designed

---

## **PHASE 9: Admin Dashboard & Reports**

### Goals:
- Complete admin dashboard
- Build reporting features
- Analytics and insights
- Export functionality

### Deliverables:

#### Frontend Structure:
```
apps/web/src/app/(dashboard)/admin/
├── page.tsx                  # Dashboard overview
├── reports/
│   ├── page.tsx              # Reports list
│   ├── attendance/
│   │   └── page.tsx
│   └── students/
│       └── page.tsx
└── analytics/
    └── page.tsx

components/admin/
├── OverviewStats.tsx
├── AttendanceChart.tsx
├── StudentPerformanceTable.tsx
├── ExportButton.tsx
└── DateRangePicker.tsx
```

#### Features:
- System overview (total students, cohorts, batches)
- Attendance analytics
  - Overall attendance rate
  - Batch-wise attendance
  - Student-wise attendance
- Student performance tracking
- Export reports (CSV/PDF)
- Date range filters
- Search and filters

#### Reports:
1. **Daily Attendance Report**
   - Date, Batch, Total, Present, Absent
2. **Student Attendance Report**
   - Student name, Regno, Total classes, Attended, Percentage
3. **Batch Performance Report**
   - Batch name, Average attendance, Low performers

#### Service Enhancements:
```
services/attendance-service/src/
├── controllers/
│   └── reports.controller.ts
└── utils/
    ├── report-generator.util.ts
    └── export.util.ts
```

### Completion Checklist:
- [ ] Admin dashboard designed
- [ ] Overview stats cards implemented
- [ ] Attendance reports working
- [ ] Student reports working
- [ ] Batch reports working
- [ ] Charts and graphs implemented
- [ ] Export to CSV working
- [ ] Export to PDF working (optional)
- [ ] Date range filters functional
- [ ] Search and filter working
- [ ] Mobile responsive tables
- [ ] Report generation performance optimized

---

## **PHASE 10: Testing, Optimization & Deployment**

### Goals:
- Comprehensive testing
- Performance optimization
- Security hardening
- Production deployment

### Deliverables:

#### Testing Structure:
```
apps/web/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── hooks/
└── e2e/
    └── tests/

services/auth-service/
└── tests/
    ├── unit/
    └── integration/

(Similar for all services)
```

#### Testing Coverage:
- **Unit Tests**: All utilities, helpers
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
  - Login flow
  - QR generation and scanning
  - Attendance marking
  - CSV upload
  - Report generation

#### Performance Optimizations:
- Lazy loading components
- Image optimization (Next.js Image)
- Code splitting
- Database query optimization (indexes)
- Caching (Redis for QR codes)
- CDN for static assets

#### Security:
- Rate limiting on APIs
- CORS configuration
- Input sanitization
- SQL injection prevention (Prisma)
- XSS protection
- HTTPS enforcement
- Environment variable security

#### Deployment Structure:
```
infrastructure/
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.auth
│   ├── Dockerfile.user
│   ├── Dockerfile.attendance
│   └── Dockerfile.schedule
├── kubernetes/
│   ├── deployments/
│   ├── services/
│   └── ingress/
└── nginx/
    └── nginx.conf
```

#### Deployment Checklist:
- [ ] Docker images built for all services
- [ ] Docker Compose production config
- [ ] Kubernetes manifests (if using K8s)
- [ ] Database migrations automated
- [ ] Environment variables configured
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Monitoring setup (optional: Prometheus, Grafana)
- [ ] Logging configured
- [ ] Backup strategy implemented
- [ ] SSL certificates configured
- [ ] Domain and DNS setup
- [ ] Load balancer configured

#### Documentation:
- API documentation (Swagger/OpenAPI)
- User guides (per role)
- Deployment guide
- Architecture diagrams
- Database schema documentation

### Completion Checklist:
- [ ] 80%+ test coverage achieved
- [ ] All E2E flows passing
- [ ] Performance benchmarks met (<3s page load)
- [ ] Security audit passed
- [ ] All services containerized
- [ ] Production deployment successful
- [ ] Monitoring and logging active
- [ ] Database backups automated
- [ ] Documentation complete
- [ ] User acceptance testing done
- [ ] Production smoke tests passed
- [ ] Post-deployment monitoring (1 week)

---

## 🎨 Design System (Consistent Across All Phases)

### Color Palette:
```css
--primary-orange: #FF6B00
--primary-black: #121212
--primary-white: #FFFFFF
--accent-grey: #F5F5F5
--accent-beige: #FAF7F2
--text-primary: #121212
--text-secondary: #6B7280
--success: #10B981
--error: #EF4444
--warning: #F59E0B
```

### Typography:
- Font: Inter / Poppings
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Small text: 12-14px

### Component Library (Build Once, Use Everywhere):
- Button (primary, secondary, ghost)
- Card (glass-morphism)
- Modal
- Table
- Badge
- Input
- Dropdown
- Toast/Notification
- Loading Spinner
- Empty State

---

## 🔐 Security Considerations (All Phases)

- **Authentication**: JWT with short expiry + refresh tokens
- **Authorization**: Middleware-based role checking
- **Data Validation**: Zod/Joi for input validation
- **Rate Limiting**: Prevent brute force
- **CORS**: Whitelist frontend domain
- **Encryption**: Sensitive data at rest
- **Audit Logs**: Track critical actions

---

## 📊 Success Metrics

- **Performance**: <3s page load, <500ms API response
- **Reliability**: 99.9% uptime
- **Security**: Zero critical vulnerabilities
- **Usability**: <5 clicks to mark attendance
- **Coverage**: 80%+ test coverage

---

## 🚀 Post-Launch (Optional Phase 11)

- Mobile app (React Native)
- Push notifications
- Offline mode
- Advanced analytics (ML-based insights)
- Parent portal
- Integration with college ERP

---

This PRD provides a clear, phase-wise breakdown with completion criteria, folder structures, and technical details. Each phase builds on the previous one, ensuring a systematic and scalable development process.