# MirrorPro Privacy Policy

Last updated: August 4, 2026

## What This App Does

MirrorPro is an **update distribution client**. It checks a remote server for new versions of an Android app and helps you download and install those updates.

## Permissions We Use

| Permission | Why We Need It |
|---|---|
| `INTERNET` | Connect to the update server (HTTPS only) |
| `ACCESS_NETWORK_STATE` | Detect online/offline to retry failed requests |
| `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_DATA_SYNC` | Show a persistent download progress notification while APK downloads |
| `POST_NOTIFICATIONS` | Show download progress notifications (Android 13+) |
| `WRITE_EXTERNAL_STORAGE` (maxSdk=28) | Save APK to shared storage on Android 9 and below (legacy) |
| `REQUEST_INSTALL_PACKAGES` | Invoke the system APK installer after download completes |

## Data We Collect

**Personally identifiable information:** NONE.

**Anonymous telemetry we send to the server:**
- Your IP address (collected automatically by the server, used for download counting only)
- User-Agent string (standard HTTP header)

**Data we do NOT collect:**
- No device identifiers (IMEI, Android ID, advertising ID)
- No contact list, SMS, call log
- No location data
- No camera, microphone, or sensor access
- No accounts, passwords, or credentials
- No browsing history or app usage data

## How APK Updates Work

1. App sends `GET https://mirrorpro-xgq5.onrender.com/api/latest` (HTTPS, certificate pinned to system CAs)
2. Server returns JSON describing the latest version + APK download URL
3. App compares server's versionCode with installed versionCode
4. If update available, user taps "Download Update"
5. App downloads APK via HTTPS to app-private external storage
6. App invokes system APK installer via `ACTION_VIEW` intent
7. User confirms installation in the standard Android installer dialog

**At no point does MirrorPro install anything without your explicit confirmation.**

## Data Storage

- Downloaded APK files: stored in app-private external storage (`getExternalFilesDir()`)
- Deleted automatically when newer versions are downloaded
- Not accessible to other apps

## Security

- All network traffic uses HTTPS (cleartext traffic disabled)
- Only system CA certificates are trusted (no user-installed CAs, preventing MITM)
- APK is downloaded over HTTPS from the same origin as the API
- FileProvider is used to share the APK with the system installer (no world-readable files)

## Open Source

This app's source code is publicly available at:
https://github.com/stephenmarcus89s-star/androidfk

You can audit every line of code yourself.

## Contact

For privacy questions, contact: admin@mirrorpro.app
