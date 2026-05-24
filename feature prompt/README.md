# Feature Prompts

Each file in this folder describes ONE feature of either `ResidentApp` (React Native + Expo) or `adminApp` (React + Vite). The prompts are written so they can be handed to a developer (or an AI coding assistant) to implement that single feature from scratch against the shared `NagaRescueBackend` API.

Numbering resets per app.

## ResidentApp

| # | Feature |
|---|---|
| 001 | [Login & session bootstrap](001_residentApp_login.md) |
| 002 | [Registration step 1 — role selection](002_residentApp_registration_role_selection.md) |
| 003 | [Member code entry (type / QR scan)](003_residentApp_member_code_qr_scan.md) |
| 004 | [Signup — personal details](004_residentApp_signup_personal_details.md) |
| 005 | [Signup — address + GPS](005_residentApp_signup_address_location.md) |
| 006 | [Upload proof of residency](006_residentApp_upload_documents.md) |
| 007 | [Add household members sub-flow](007_residentApp_household_members_setup.md) |
| 008 | [Account credentials & backend submit](008_residentApp_account_creation_credentials.md) |
| 009 | [OTP verification](009_residentApp_otp_verification.md) |
| 010 | [Pending verification holding screen](010_residentApp_pending_verification.md) |
| 011 | [Home + SOS trigger](011_residentApp_home_sos.md) |
| 012 | [Locator map](012_residentApp_locator_map.md) |
| 013 | [Evacuation routes & centers](013_residentApp_evacuation_routes.md) |
| 014 | [Profile & household management](014_residentApp_profile_household_management.md) |
| 015 | [Push notifications](015_residentApp_push_notifications.md) |
| 016 | [Session store, root layout & navbar](016_residentApp_session_and_navigation.md) |
| 017 | [Safety Confirm Gate (Phase 2 of SOS)](017_residentApp_safety_confirm_gate.md) |

## adminApp

| # | Feature |
|---|---|
| 001 | [Super admin login](001_adminApp_login_super_admin.md) |
| 002 | [Auth context, route guard, layout & sidebar](002_adminApp_auth_layout_and_routing.md) |
| 003 | [API client, endpoints & hooks](003_adminApp_api_client.md) |
| 004 | [Dashboard overview (KPIs)](004_adminApp_dashboard_overview.md) |
| 005 | [Resident accounts management](005_adminApp_resident_accounts_management.md) |
| 006 | [Bulk approve](006_adminApp_bulk_approve.md) |
| 007 | [Reset password modal](007_adminApp_password_reset.md) |
| 008 | [Residents directory](008_adminApp_residents_directory.md) |
| 009 | [Residents CSV export](009_adminApp_residents_csv_export.md) |
| 010 | [SOS records view](010_adminApp_sos_records_view.md) |
| 011 | [UI components library](011_adminApp_ui_components_library.md) |
| 012 | [Residents-per-barangay analytics](012_adminApp_residents_per_barangay_analytics.md) |

---

### How to use a prompt
Open the file for the feature you want to (re)build and feed it to your coding assistant alongside the repo. Each prompt is self-contained: it lists the screens / files involved, the backend endpoints, the data contracts, the validation rules, and acceptance criteria.
