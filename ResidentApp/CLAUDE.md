# CLAUDE.md — Resident App

This file gives Claude Code the context it needs to work effectively in this project.

---

## Project Overview

This is the **Resident** mobile application — one of four sub-apps in the **HCI-Frontend** monorepo. It is built with **React Native + Expo (SDK 54)** using **Expo Router** (file-based routing).

The app serves barangay residents and covers:
- Account registration with household role selection
- Household member management and QR-based member linking
- OTP verification on account creation
- SOS / emergency reporting
- Evacuation route guidance
- Barangay locator map
- Resident profile with barangay verification status

### Sibling apps in the monorepo

| Folder | Purpose |
|---|---|
| `resident/` | This app — for barangay residents |
| `responder/` | For barangay emergency responders |
| `bdrrmc/` | For BDRRMC administrators |
| `evac/` | Evacuation-specific sub-app |

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | UI framework |
| Expo | ~54.0.34 | Build toolchain |
| Expo Router | ~6.0.23 | File-based navigation |
| expo-camera | ~17.0.10 | QR code scanning |
| expo-image-picker | ~17.0.11 | Profile photo & document upload |
| expo-location | ~19.0.8 | GPS location |
| react-native-maps | 1.20.1 | Map view |
| react-native-qrcode-svg | ^6.3.21 | QR code generation (profile) |
| react-native-svg | 15.12.1 | SVG support for QR codes |
| @react-native-community/datetimepicker | ^8.4.4 | Birthdate pickers |
| @react-native-picker/picker | 2.11.1 | Dropdown pickers |

---

## Commands

```bash
# Start dev server (Expo Go)
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Install a new Expo-compatible package
npx expo install <package-name>
```

> Always use `npx expo install` (not `npm install`) for new packages so Expo can pin the correct compatible version.

---

## Project Structure

```
resident/
├── app/                    # Screens (Expo Router file-based routes)
│   ├── index.jsx           # Login screen (entry point)
│   ├── householdRole.jsx   # Step 1 of registration — role selection
│   ├── memberCode.jsx      # Household Member code entry / QR scan
│   ├── signup.jsx          # Personal details form
│   ├── uploadDocuments.jsx # Proof of residency upload
│   ├── addMembersPrompt.jsx# Yes/No — add household members?
│   ├── householdMember.jsx # Add a single household member
│   ├── householdConfirm.jsx# Review household member list
│   ├── register.jsx        # Account details (username, password, photo)
│   ├── otp.jsx             # OTP verification (6-digit)
│   ├── home.jsx            # Home / SOS screen (post-login)
│   ├── locator.jsx         # Map + barangay locator
│   ├── evacuation.jsx      # Evacuation routes
│   └── profile.jsx         # Resident profile + household management
│
├── components/
│   ├── navbar.jsx          # Bottom navigation bar (Locator | SOS | Evacuation)
│   └── header.jsx          # Top header bar
│
├── styles/                 # One stylesheet per screen (mirrors app/)
│   ├── index.js
│   ├── signup.js           # Also used by householdMember.jsx
│   ├── householdRole.js    # Also used by memberCode.jsx and addMembersPrompt.jsx
│   ├── householdConfirm.js
│   ├── register.js
│   ├── otp.js
│   ├── profile.js
│   └── ...
│
├── assets/
│   ├── img/                # BADGE.png, LOGO.png, LANDING.jpg, NAVBAR.png
│   └── icons/              # All icon PNGs (back, edit, delete, user, etc.)
│
├── package.json
└── CLAUDE.md               # This file
```

---

## Registration Flow

### Household Head / Tenant / Boarder
```
index (Register) → householdRole → signup → uploadDocuments
  → addMembersPrompt → (householdMember → householdConfirm)?
  → register → otp → home
```

### Household Member (uses QR or Member Code)
```
index (Register) → householdRole → memberCode (type OR scan QR)
  → signup → register → otp → home
```

> Household Members skip document upload and the add-members prompt entirely. This is controlled by passing `{ isMember: 'true' }` as a route param from `memberCode.jsx` to `signup.jsx`, which then routes to `/register` instead of `/uploadDocuments`.

---

## Key Patterns & Conventions

### Styling
- Each screen has a matching stylesheet in `styles/` (e.g., `app/signup.jsx` → `styles/signup.js`).
- Some screens share a stylesheet: `memberCode.jsx` and `addMembersPrompt.jsx` import `styles/householdRole.js`.
- `styles/signup.js` is also imported by `householdMember.jsx`.
- Colors: primary blue `#3FA9F5`, dark blue `#2F7FB8`, error red `#D32F2F`.
- Backgrounds: all auth/registration screens use `assets/img/LANDING.jpg` as an `ImageBackground`.
- Post-login screens (home, profile, locator, evacuation) use a plain white `backgroundColor`.

### Navigation
- Uses `expo-router` (`useRouter`, `router.push`, `router.replace`, `router.back`).
- Pass data between screens via route params: `router.push({ pathname: '/screen', params: { key: 'value' } })` and read with `useLocalSearchParams()`.
- `router.replace` is used after OTP verification so the user cannot go back to the OTP screen.

### Back Buttons
- All registration/auth screens have an absolute-positioned Back button (top-left, `top: 50, left: 20, zIndex: 10`) using `assets/icons/back.png`.
- The `householdConfirm.jsx` screen uses a blue-tinted back button (`tintColor: '#3FA9F5'`); all other screens use a black back button.

### Forms & Validation
- Inline validation with a `errors` state object (`{ fieldName: true }`).
- Borders turn red on error via `styles.inputError`.
- Validation runs on submit; fields clear their error state as the user types (`handleChange` pattern).
- Contact number fields strip non-numeric characters via `.replace(/[^0-9]/g, '')` and cap at 11 digits.

### QR Code System
- **Generation**: `react-native-qrcode-svg` — used in `profile.jsx` to display a QR per household member. Each member has a `memberCode` string (e.g., `BO - 123456`).
- **Scanning**: `expo-camera` (`CameraView` + `onBarcodeScanned`) — used in `memberCode.jsx` to let a new Household Member scan the QR from the head's profile.

### Profile Indicators
- `user.isVerified` (boolean) — controls the "Verified by Barangay" (green) / "Pending Verification" (orange) badge shown below the user's name.
- `member.hasAccount` (boolean) — controls the "Has Account" (green) / "No Account" (gray) pill badge shown on each member card. New members added via the modal default to `hasAccount: false`.

---

## Household Role Logic

| Role | Can add members? | Needs Member Code? | Upload documents? |
|---|---|---|---|
| Household Head | Yes | No | Yes |
| Tenant / Renter | No (skips prompt) | No | Yes |
| Boarder | No (skips prompt) | No | Yes |
| Household Member | No | Yes (QR or typed) | No |

---

## Assets Reference

### Images (`assets/img/`)
| File | Used for |
|---|---|
| `LANDING.jpg` | Background on all auth/registration screens |
| `LOGO.png` | Used on `register.jsx` (Account Details) |
| `BADGE.png` | Used on all other registration screens |
| `NAVBAR.png` | Navigation bar background |

### Icons (`assets/icons/`)
Key icons used across the app:

| File | Usage |
|---|---|
| `back.png` | Back button on all registration screens |
| `user-outline.png` | Username field icon, profile placeholder |
| `password-outline.png` | Password field icon |
| `edit.png` | Edit buttons on profile/confirm screens |
| `delete-outline.png` | Delete buttons on member cards |
| `add.png` | Add Member button on profile |
| `logout-rounded.png` | Logout button on profile |
| `sos-active.png` | SOS / center navbar tab |
| `location-normal.png` | Locator navbar tab |
| `house-normal.png` | Evacuation navbar tab |

---

## DO / DON'T

**Do:**
- Use `npx expo install` for all new dependencies.
- Mirror any new screen in `app/` with a matching stylesheet in `styles/`.
- Keep back button style consistent: `position: 'absolute', top: 50, left: 20, zIndex: 10`.
- Use `router.replace` (not `router.push`) when navigating after OTP — prevents back-navigation to sensitive screens.
- Add `hasAccount: false` to any new member object created programmatically.

**Don't:**
- Don't use `npm install` for Expo packages — version mismatches break the build.
- Don't add global state management (no Redux/Context) — pass data via route params.
- Don't modify `styles/signup.js` radio button / form styles carelessly — they are shared with `householdMember.jsx`.
- Don't hardcode phone numbers or member codes — those are mock values pending backend integration.
- Don't use `@expo/vector-icons` — it is not installed. Use PNG icons from `assets/icons/` or text-based fallbacks.
