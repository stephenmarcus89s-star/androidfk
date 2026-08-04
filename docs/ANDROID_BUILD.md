# Building the MirrorPro Android APK

There are three ways to build the APK. Pick whichever works for you.

---

## 🤖 Option 1: GitHub Actions Auto-Build (Easiest)

**Best for:** No local Android setup required.

The repo includes a GitHub Actions workflow at `.github/workflows/build-apk.yml` that automatically builds an APK on every push to `main` (or `master`).

### Steps

1. **Push your code to GitHub** (see Git Push section below)
2. Go to your repo on GitHub: https://github.com/stephenmarcus89s-star/androidfk
3. Click the **Actions** tab
4. Watch the workflow run (takes ~5-7 minutes)
5. When it finishes, you have two ways to get the APK:
   - **As an artifact:** Click the run → scroll down to **Artifacts** → download `mirrorpro-apk.zip` → unzip → you have the APK
   - **As a release:** The workflow auto-creates a GitHub Release tagged `apk-<run-number>` with the APK attached

### Updating the BASE_URL

Before the APK is useful, you need to point it at your deployed backend.

1. Edit `android/app/src/main/java/com/mirrorpro/appupdate/di/NetworkModule.kt`
2. Find line ~28:
   ```kotlin
   private const val BASE_URL = "http://10.0.2.2:10000/"
   ```
3. Change to your Render URL:
   ```kotlin
   private const val BASE_URL = "https://mirrorpro-xxxx.onrender.com/"
   ```
4. Commit and push
5. GitHub Actions will rebuild the APK automatically

---

## 💻 Option 2: Build Locally with Android Studio

**Best for:** If you want to debug or modify the Android app.

### Prerequisites

- Android Studio (Hedgehog 2023.1.1 or newer)
- JDK 17 (Android Studio bundles this)
- Android SDK 34 (Android Studio will offer to install on first open)

### Steps

1. **Open the project:**
   - Android Studio → **Open** → select `android/` folder
   - Wait for Gradle sync to complete (first time takes ~5 min)

2. **Update BASE_URL:**
   - Open `app/src/main/java/com/mirrorpro/appupdate/di/NetworkModule.kt`
   - Change `BASE_URL` to your Render URL

3. **Build the APK:**
   - Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to finish
   - Click **locate** in the notification to find the APK

4. **APK location:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Running on a device/emulator

- **Emulator:** Click the green ▶️ Run button in Android Studio
- **Physical device:**
  1. Enable Developer Options on your phone (tap Build Number 7 times in Settings)
  2. Enable USB Debugging
  3. Connect via USB
  4. Click Run in Android Studio

### For Android emulator + local backend

If you're running the backend locally on `localhost:10000`, the emulator can't reach `localhost` directly. Use the special alias `10.0.2.2` instead — it maps to the host machine's localhost:

```kotlin
private const val BASE_URL = "http://10.0.2.2:10000/"
```

(This is the default in the source code.)

For a physical device on the same Wi-Fi as your dev machine, use your machine's LAN IP:

```kotlin
private const val BASE_URL = "http://192.168.1.50:10000/"
```

---

## 🔨 Option 3: Build Locally with Command Line (Gradle)

**Best for:** CI/CD or if you don't want Android Studio.

### Prerequisites

- JDK 17 installed
- Android SDK installed (with `ANDROID_HOME` env var set)
- Accept SDK licenses: `yes | sdkmanager --licenses`

### Steps

```bash
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# OR build release APK (signed with debug keystore by default)
./gradlew assembleRelease
```

APK output:
```
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/release/app-release.apk
```

---

## 🔐 Signing the APK

By default, the build uses the **debug keystore** (`~/.android/debug.keystore`). This is fine for personal use — the APK installs on any device that allows "Install unknown apps".

### For Play-Store-grade release signing

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore mirrorpro.keystore -alias mirrorpro \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Base64-encode it for GitHub Secrets:
   ```bash
   base64 -i mirrorpro.keystore | pbcopy   # macOS
   base64 -i mirrorpro.keystore -w 0        # Linux
   ```

3. In your GitHub repo → Settings → Secrets and variables → Actions → add:
   - `KEYSTORE_BASE64` — the base64 output from step 2
   - `KEYSTORE_PASSWORD` — the keystore password you chose
   - `KEY_ALIAS` — `mirrorpro`
   - `KEY_PASSWORD` — the key password you chose

4. Push to GitHub → the workflow will use your release keystore automatically

---

## 📲 Installing the APK on a Phone

1. **Transfer the APK to your phone:**
   - Download from GitHub Releases on your phone's browser, OR
   - Copy via USB, OR
   - Upload to Google Drive and download on phone

2. **Tap the APK file** in your phone's file manager

3. **Allow install from unknown sources** if prompted:
   - Android 8+: Settings → Apps → Special access → Install unknown apps → your file manager → Allow
   - The app will also prompt for this permission when you tap "Install Update" inside MirrorPro

4. **Tap Install**

---

## 🐛 Common Build Issues

### `SDK location not found`

Create `android/local.properties` with:
```
sdk.dir=/path/to/your/Android/Sdk
```
(Mac: `/Users/you/Library/Android/Sdk`, Linux: `/home/you/Android/Sdk`)

### `Failed to resolve: com.android.tools.build:gradle:8.5.2`

Make sure you have Android SDK Build-Tools 34 and Platform 34 installed via Android Studio's SDK Manager.

### `OutOfMemoryError` during build

Add to `android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Hilt/KSP errors

Make sure Kotlin 2.0.20 is being used. Check `gradle/libs.versions.toml` — the Kotlin and KSP versions must match exactly (KSP version is `2.0.20-1.0.25`).

### Build succeeds but APK won't install

You're probably trying to install a release-signed APK with a different signature than what's already on the phone. Uninstall the existing app first, then install the new APK.
