# Trusty Check

Build a Hospital Verification Bot web dashboard with the following specs:

## Core Concept
A multi-mode hospital verification system powered by ONNX ML inference. 
It should work as an embeddable widget usable in Discord bots, hospital 
portals, and standalone web apps.

## Three Verification Modes

### 🟢 EASY MODE — Basic Identity Verification
- Input fields: Patient Name, Hospital ID, Date of Birth, Phone Number
- Runs a lightweight ONNX classification model to validate ID format + 
  cross-check consistency
- Output: VERIFIED / UNVERIFIED badge with confidence score (0-100%)
- Response time target: < 1 second
- Use case: Reception desk, visitor entry, appointment check-in

### 🟡 MODERATE MODE — Credential & Document Verification
- Input fields: Staff ID, Role (Doctor/Nurse/Admin), Department, 
  License Number, Upload: Document image (base64)
- Runs an ONNX document authenticity model on the uploaded credential
- Output: Credential status (Valid/Expired/Suspicious), issuing authority, 
  expiry date extracted, trust score
- Response time target: 2-3 seconds
- Use case: Staff onboarding, pharmacy access, lab entry

### 🔴 HIGH SECURITY MODE — Deep ML Verification
- Input fields: Patient/Staff ID, Behavioral pattern data (encoded as 
  float array), Biometric hash, Ritual Chain wallet address (optional)
- Runs a full ONNX neural network inference via Ritual Chain precompile 
  (0x0800) — show this as the verification backend in the UI
- Shows: Risk classification (LOW / MEDIUM / HIGH / CRITICAL), 
  anomaly flags, verification timestamp, on-chain tx hash (mocked)
- Output card shows which ONNX model was used, model version/commit hash 
  (like hf/owner/repo/file.onnx@<hash>), inference latency
- Response time target: 3-5 seconds with animated loader
- Use case: ICU access, controlled substance dispensing, surgery clearance

## UI/UX Requirements
- Dark professional medical theme (deep navy + white + accent colors: 
  green for easy, amber for moderate, red for high)
- Mode selector at top — tabs or segmented control
- Each mode has its own form that animates in
- Results appear as a verification card below the form with:
  - Large status badge (VERIFIED / FAILED / REVIEW REQUIRED)
  - Confidence/trust score as a circular progress indicator
  - Details panel (collapsible)
  - Copy result as JSON button
  - Share/export button

## Multi-Platform Embed Support
- Add a section at bottom: "Embed This Bot"
- Show 3 embed options with copy-ready code snippets:
  1. Discord Bot Command — slash command format `/verify [mode] [id]`
  2. iFrame embed code for hospital portal
  3. REST API endpoint format (POST /api/verify with JSON body)
- Each snippet has a copy button

## Technical Details
- Use React + Tailwind
- ONNX inference should be simulated/mocked realistically 
  (show model loading → inference → result lifecycle)
- Add a small "Powered by Ritual ONNX Precompile 0x0800" badge on 
  High Security mode
- Verification history log at bottom (last 5 verifications, 
  clearable, stored in component state)
- Mobile responsive

## Mock Data
- Easy: accept any input, randomly resolve to 85-99% confidence VERIFIED 
  (occasionally 60-70% REVIEW REQUIRED)
- Moderate: if license number starts with "EXP" → show Expired, 
  otherwise Valid
- High: if biometric hash length < 10 chars → HIGH RISK, 
  otherwise LOW/MEDIUM randomly

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f501f4fc-e535-4f1c-a115-00bcb881472e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
