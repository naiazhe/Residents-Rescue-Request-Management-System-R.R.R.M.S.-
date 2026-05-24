# 🚨 R.R.R.M.S
### Residents-Rescue-Request-Management-System
> A streamlined system for residents to request rescue assistance and for barangay operators to verify, track, and monitor rescue requests in real-time.

---

## 📌 System Overview

**R.R.R.M.S** (Residents-Rescue-Request-Management-System) is a focused digital platform designed to efficiently manage rescue requests during emergencies. The system connects residents who need assistance with barangay operators (admins) who can verify requests, assign resources, and track response status in real-time.

### 🎯 Core Functionalities

- **Resident Registration**: Citizens register with household details and verification documents
- **Rescue Request Submission**: Residents submit SOS requests with GPS location and emergency details
- **Admin Verification**: Barangay operators verify resident identities and request legitimacy
- **Request Status Tracking**: Real-time tracking of rescue request lifecycle
- **Admin Monitoring Dashboard**: Centralized view of all active and historical rescue requests
- **Approval Workflow**: Multi-step verification process before resource dispatch

---

## 🏗️ System Architecture

### Two-Actor System Flow

```
┌─────────────────────────────────────────────────────────┐
│       RESIDENTS-RESCUE-REQUEST-MANAGEMENT-SYSTEM        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐   ┌──────────────────────┐     │
│  │   RESIDENT SIDE     │   │    ADMIN SIDE        │     │
│  │                     │   │  (Barangay Operator) │     │
│  │  • Registration     │   │  • Verification      │     │
│  │  • Send Request     │ ↔ │  • Approval          │     │
│  │  • Track Status     │   │  • Monitoring        │     │
│  └─────────────────────┘   └──────────────────────┘     │
│              ↓                        ↓                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │     REST API (Node.js + Express Backend)        │    │
│  │  • Auth & Verification  • Request Processing    │    │
│  │  • Status Management    • Notifications         │    │
│  └─────────────────────────────────────────────────┘    │
│              ↓                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │        PostgreSQL Database                      │    │
│  │  • Users (Residents & Admins)                   │    │
│  │  • Rescue Requests & History                    │    │
│  │  • Verification Records                         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 System Components

### 1. **ResidentApp** (React Native + Expo)
Located in `./ResidentApp`

**Purpose**: Mobile application for residents to register, submit rescue requests, and track status in real-time.

**Key Workflows**:

#### Registration Flow
- User login / signup
- Personal details submission
- Address & GPS location capture
- Proof of residency upload
- Household members setup
- Account creation & credentials
- OTP verification
- Pending verification status

#### Request Management Flow
- SOS emergency request submission (with GPS location)
- Safety confirmation gate (Phase 2 of SOS)
- Real-time request status tracking
- Request history view
- Push notifications for updates

**Technology Stack**:
- React Native with Expo
- Expo Router for navigation
- Redux/Context API for state management
- Geolocation API & Google Maps integration
- Expo Push Notifications

---

### 2. **adminApp** (React + Vite)
Located in `./adminApp`

**Purpose**: Web portal for barangay operators to verify residents, manage requests, and monitor rescue operations.

**Key Workflows**:

#### Admin Authentication & Access
- Super admin login with role-based access
- Auth context & route guards
- Protected pages & sidebar navigation

#### Resident Verification & Management
- View all registered residents
- Verify resident details and documents
- Bulk approval of pending residents
- Resident directory & search
- Reset resident passwords
- CSV export of resident data

#### Rescue Request Monitoring
- Dashboard KPIs (pending requests, verified residents, etc.)
- View all SOS rescue requests
- Filter by status (pending, approved, completed, rejected)
- Request details with resident information
- Real-time status updates
- Export request records

#### Analytics & Reporting
- Residents-per-barangay distribution
- Request statistics by status
- CSV export functionality
- UI components library for consistency

**Technology Stack**:
- React 18.3
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (API calls)
- Recharts (data visualization)
- Lucide React (icons)

---

### 3. **NagaRescueBackend** (Node.js + Express)
Located in `./NagaRescueBackend`

**Purpose**: RESTful API backend handling core business logic for R.R.R.M.S.

**Key Responsibilities**:

#### User Management
- Resident registration & account creation
- Admin authentication & authorization
- JWT token management
- Password hashing with bcrypt

#### Rescue Request Processing
- Accept and store rescue requests with GPS data
- Update request status through approval workflow
- Validation of resident identity before dispatch
- Real-time status notifications

#### Verification & Approval
- Store resident verification documents
- Approve/reject resident accounts
- Bulk approval operations
- OTP generation and validation

#### Data & Analytics
- Retrieve request history
- Generate analytics data
- CSV export preparation
- Real-time data updates

**Technology Stack**:
- Node.js
- Express.js 5.x
- PostgreSQL database
- JWT authentication
- Bcrypt (password hashing)
- Expo Server SDK (push notifications)
- CORS support

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.x (with npm or yarn)
- **PostgreSQL** >= 12.x
- **Git**
- **Expo CLI** (for ResidentApp development): `npm install -g expo-cli`

### Installation Steps

#### 1. Clone & Navigate to Project
```bash
cd residentWithAdmin
```

#### 2. Backend Setup (NagaRescueBackend)
```bash
cd NagaRescueBackend

# Install dependencies
npm install

# Create .env file (see Environment Setup below)
cp .env.example .env

# Run database migrations (if applicable)
npm run migrate

# Seed admin account
npm run seed:admin

# Start backend server
npm run dev
# Runs on http://localhost:5000 (or configured port)
```

#### 3. Admin App Setup (adminApp)
```bash
cd adminApp

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API endpoint to backend
# Edit .env to set: VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
# Runs on http://localhost:5173
```

#### 4. Resident App Setup (ResidentApp)
```bash
cd ResidentApp

# Install dependencies
npm install

# Configure API endpoint
# Edit environment configuration to point to backend

# Start Expo development server
npx expo start

# Choose platform:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app
```

---

## 🔑 Environment Setup

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nagarescue
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_here

# Expo Notifications
EXPO_ACCESS_TOKEN=your_expo_token

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Admin App (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=NagaRescue Admin
```

### Resident App
Configure API endpoint in `app.json` or environment configuration files.

---

## 📚 Key API Endpoints

### Resident Registration & Authentication
- `POST /api/auth/register` - Resident registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/verify-otp` - OTP verification

### Rescue Request Management
- `POST /api/requests` - Submit new rescue request (GPS + details)
- `GET /api/requests` - Get user's requests (residents) or all requests (admin)
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id/status` - Update request status
- `GET /api/requests/:id/history` - Get request status history

### Resident Verification (Admin)
- `GET /api/residents` - List all residents with verification status
- `GET /api/residents/:id` - Get resident details
- `PUT /api/residents/:id/verify` - Approve resident verification
- `PUT /api/residents/:id/reject` - Reject resident verification
- `PUT /api/residents/:id/password-reset` - Reset resident password
- `POST /api/residents/bulk-approve` - Bulk approve residents

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Dashboard KPIs
- `GET /api/analytics/requests-by-status` - Request statistics
- `GET /api/analytics/residents-by-barangay` - Resident distribution
- `GET /api/export/residents` - Export residents as CSV
- `GET /api/export/requests` - Export requests as CSV

> Full API documentation available in the backend routes folder

---

## 🏃 Running the Application

### Development Mode

Start all three components in separate terminals:

**Terminal 1 - Backend**
```bash
cd NagaRescueBackend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Admin Portal**
```bash
cd adminApp
npm install
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - Resident Mobile App**
```bash
cd ResidentApp
npm install
npx expo start
# Scan QR with Expo Go or press 'i' (iOS) / 'a' (Android)
```

---

## 🔄 Typical User Workflow

### Phase 1: Resident Registration
1. **Resident Opens App** → Navigates to login/signup
2. **Role Selection** → Chooses "Resident"
3. **Member Code Entry** → Scans QR or enters code
4. **Personal Details** → Enters name, contact info
5. **GPS Location** → App captures current location
6. **Document Upload** → Uploads proof of residency
7. **Household Setup** → Adds family members
8. **Credentials** → Creates username/password
9. **OTP Verification** → Confirms phone number
10. **Waiting Period** → Pending admin verification
11. **Approval** → Admin verifies documents & approves account

### Phase 2: Rescue Request Submission
1. **Emergency Occurs** → Resident opens app
2. **SOS Trigger** → Resident clicks emergency button
3. **Location Auto-Fill** → GPS location auto-captured
4. **Details Entry** → Describes emergency situation
5. **Request Submit** → Sends to backend with timestamp
6. **Safety Gate** → Confirms household safety status
7. **Status Tracking** → Real-time updates on request

### Phase 3: Admin Verification & Monitoring
1. **Dashboard View** → Admin sees KPIs & pending items
2. **Resident Verification** → Reviews new applications
3. **Document Check** → Validates uploaded documents
4. **Bulk Approve** → Approves multiple residents at once
5. **Request Monitoring** → Views incoming SOS requests
6. **Status Updates** → Updates request progress
7. **Export Data** → Generates CSV reports
8. **Analytics** → Views trends & distribution data

---

## 🧪 Testing

### Backend
```bash
cd NagaRescueBackend
npm test
```

### Admin App
```bash
cd adminApp
npm run build  # Test production build
```

---

## 📋 Feature Documentation

Each feature of R.R.R.M.S is fully documented in the `feature prompt` folder:

### Resident App Features (Registration & Request Submission)
| # | Feature | Purpose |
|---|---------|---------|
| 001 | Resident Login | Session bootstrap and authentication |
| 002 | Registration - Role Selection | User type selection (resident vs operator) |
| 003 | Member Code Entry (QR/Manual) | Identity verification via code scanning |
| 004 | Personal Details Submission | Capture resident info (name, contact, age) |
| 005 | Address & GPS Location | Location capture for emergency response |
| 006 | Upload Proof of Residency | Document verification (ID, utility bill, etc.) |
| 007 | Add Household Members | Register family members in household |
| 008 | Account Credentials Creation | Create login credentials for approved residents |
| 009 | OTP Verification | Two-factor authentication |
| 010 | Pending Verification Screen | Wait for admin approval |
| 011 | Home + SOS Trigger | Submit rescue request with GPS location |
| 017 | Safety Confirm Gate | Phase 2 - confirm safety status after request |

### Admin App Features (Verification & Monitoring)
| # | Feature | Purpose |
|---|---------|---------|
| 001 | Super Admin Login | Admin authentication |
| 002 | Auth Context & Routing | Role-based access control & navigation |
| 003 | API Client & Hooks | Centralized API communication |
| 004 | Dashboard Overview | KPIs - pending requests, verified residents, stats |
| 005 | Resident Account Management | View, verify, approve/reject residents |
| 006 | Bulk Approve Residents | Mass approval of pending residents |
| 007 | Password Reset | Reset resident account passwords |
| 008 | Residents Directory | Search and filter residents |
| 009 | Residents CSV Export | Export resident data for reporting |
| 010 | SOS Records View | Monitor active & historical rescue requests |
| 011 | UI Components Library | Reusable admin interface components |
| 012 | Residents-per-Barangay Analytics | Distribution analysis by barangay |

See individual prompt files for detailed specifications and implementation details.

---

**Last Updated**: May 2026  
**Version**: 1.0.0 - R.R.R.M.S  
**System**: Residents-Rescue-Request-Management-System
