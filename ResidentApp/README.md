# 🚨 NAGARESCUE
### A Web Application for Rescue, Evacuation, and Resource Management of Naga City

> Bridging the gap between residents, responders, and emergency coordinators — when every second counts.

---

## 📌 Project Description

**NAGARESCUE** is an integrated digital platform developed for the **City Disaster Risk Reduction and Management Office (CDRRMO) of Naga City**. It was born from the lessons of Typhoon Kristine (October 2024), which exposed critical weaknesses in Naga's disaster response infrastructure — overwhelmed hotlines, untraceable radio calls, and manual logbooks that could not scale.

The system replaces fragmented emergency workflows with a **synchronized four-part network**:

| Module | Users | Purpose |
|---|---|---|
| **Resident App** | Citizens | GPS-tagged SOS signaling and rescue requests |
| **ComCen Portal** | CDRRMO Operators | Mission management and SARU unit dispatch |
| **Responder App** | SARU / BDRRMC Rescuers | Precision navigation and real-time tracking |
| **Evacuation Center Interface** | Camp Managers | Digital headcount and report generation |

When a resident triggers an SOS, their **location and family profile** are instantly visible to the dispatcher, who can deploy the nearest unit with optimized routing — all without a single radio call or manual logbook entry.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Laravel (PHP) |
| **Database** | MySQL |
| **Realtime / Messaging** | Laravel Echo + Pusher (WebSockets) |
| **Geolocation & Mapping** | Google Maps API / Leaflet.js |
| **Offline Support** | Service Workers / PWA |
| **Authentication** | Laravel Sanctum |
| **Version Control** | Git + GitHub |

---

## ⚙️ Installation Guide

Follow these steps to set up the development environment on your local machine.

### Prerequisites

Make sure the following are installed:
- [PHP](https://www.php.net/) >= 8.1
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) >= 18.x and npm
- [MySQL](https://www.mysql.com/) >= 8.0
- [Git](https://git-scm.com/)

### Step 1 — Clone the Repository

```bash
cd nagarescue
```

### Step 2 — Install PHP Dependencies

```bash
composer install
```

### Step 3 — Install Node Dependencies

```bash
npm install
```

### Step 4 — Configure Environment Variables

```bash
cp .env.example .env
php artisan key:generate
```

Then open `.env` and update the following values:

```env
DB_DATABASE=nagarescue
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

PUSHER_APP_ID=your_pusher_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret

GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Step 5 — Run Database Migrations and Seeders

```bash
php artisan migrate --seed
```

### Step 6 — Build Frontend Assets

```bash
npm run dev
```

### Step 7 — Start the Development Server

```bash
php artisan serve
```

The application will be running at `http://localhost:8000`.

---

## 🌿 Branching Strategy

This project follows a **Gitflow-inspired branching model** to ensure clean, stable, and collaborative development.

```
main          ← Production-ready code only. Never push directly.
└── develop   ← Integration branch. All features merge here first.
    ├── feature/user-authentication
    ├── feature/sos-request-module
    ├── feature/saru-dispatch
    └── feature/evacuation-headcount
```

- **`main`** — Represents the live, deployable version of NAGARESCUE.
- **`develop`** — Primary integration branch. All completed feature branches are merged here via Pull Request.
- **`feature/*`** — Individual feature branches. Each developer works in their own branch and opens a PR to `develop` upon completion.

> ⚠️ **Branch Protection Rule:** Direct pushes to `main` and `develop` are disabled. All changes must go through a reviewed Pull Request.

---

## 👥 Contributors

| Name | Role |
|---|---|
| **Bryann Joshua T. Francisco** | Project Lead / Backend Developer |
| **Daryl Adrian J. Bo** | Frontend Developer |
| **Rachelle Ann C. Abada** | UI/UX Designer / Frontend Developer |
| **Gabriel David A. Diego** | Database Architect / Backend Developer |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

> *NAGARESCUE — Because in a disaster, the system should never be the bottleneck.*
