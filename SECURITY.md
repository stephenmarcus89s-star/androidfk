# MirrorPro Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

## Security Features

### Network Security
- **HTTPS-only:** All network traffic uses TLS (cleartext traffic disabled via `android:usesCleartextTraffic="false"`)
- **System CAs only:** User-installed CA certificates are NOT trusted (prevents MITM attacks)
- **Domain pinning:** Production backend domain (`*.onrender.com`) is explicitly declared in `network_security_config.xml`

### APK Signing
- Release builds are signed with a **4096-bit RSA key** using **SHA256withRSA**
- Signing schemes: v2 + v3 + v4 (Android 7+ / 9+ / 11+)
- Keystore is stored as a GitHub Secret (encrypted at rest with libsodium)

### Permissions
This app requests the minimum permissions required for its function:

| Permission | Justification |
|---|---|
| `INTERNET` | Fetch update info + download APK (HTTPS only) |
| `ACCESS_NETWORK_STATE` | Detect online/offline state |
| `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_DATA_SYNC` | Show download progress notification |
| `POST_NOTIFICATIONS` | Android 13+ notification permission |
| `WRITE_EXTERNAL_STORAGE` (maxSdk=28) | Legacy storage on Android 9 and below only |
| `REQUEST_INSTALL_PACKAGES` | **Required** — invokes system APK installer to install updates |

**No location, contacts, SMS, camera, microphone, or sensor permissions are requested.**

### Data Collection
- **PII collected:** NONE
- **Telemetry sent to server:** IP address (for download counting), User-Agent (standard HTTP header)
- **Data stored on device:** Downloaded APK files in app-private storage, auto-deleted on newer download

### Source Code
This app is **100% open source**. Every line of code is auditable at:
https://github.com/stephenmarcus89s-star/androidfk

### Privacy Policy
The in-app privacy policy is bundled with the app at `app/src/main/res/raw/privacy_policy.md` and viewable via the Privacy Tip icon in the top bar.

## Why Google Play Protect May Warn You

Google Play Protect may show a warning when installing this app because:

1. **`REQUEST_INSTALL_PACKAGES` permission** — This is the core feature of the app (it installs APK updates). Play Protect flags any app with this permission because malware also uses it. **This is a false positive.**

2. **Not from Play Store** — Apps distributed outside the Play Store receive extra scrutiny.

3. **Self-signed certificate** — The release keystore is self-signed (standard for non-Play-Store distribution).

### How to Install
1. Tap **"More details"** on the Play Protect warning
2. Tap **"Install anyway"**
3. The app will install normally

**This app is safe.** You can verify by reading the source code at the URL above.

## Reporting a Vulnerability

If you discover a security vulnerability, please email: `admin@mirrorpro.app`

We will respond within 48 hours and credit you in the fix release.
