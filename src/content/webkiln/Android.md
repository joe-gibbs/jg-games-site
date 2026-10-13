# Android

Webkiln's Android source backend uses the device's Android WebView and presents its pixels as an Unreal Vulkan texture. It requires Unreal Engine 5.7 or newer, Android API 26 or later at the backend level, and a device that meets your engine's Vulkan requirements. Hardware-buffer import and foreign queue ownership support are required.

[Contact JG Games](mailto:contact@jggames.dev) for the mobile source package. The public Windows trial zip cannot compile an Android target.

## Set up your project

1. Configure Android Studio, the SDK, NDK and Java versions specified in [Epic's Android development requirements](https://dev.epicgames.com/documentation/en-us/unreal-engine/android-development-requirements-for-unreal-engine). Match the toolchain to your Unreal version.
2. Install the complete source plugin under `YourProject/Plugins/Webkiln` and enable it.
3. In Unreal's Android project settings, enable Vulkan and select the architecture for your device. The ARM64 module has compiled; the full packaged runtime check used an x86-64 emulator.
4. Follow [Getting started](QuickStart.md) to register a local UI folder, open `gameui://app/index.html` and attach its view to a Webkiln widget.
5. Stage the trusted UI folders, package a Development APK and install it on the test device. Check the UI and bridge in the packaged app before making a Shipping build.

Keep `Source/Webkiln/Android/Webkiln_UPL.xml` and the adjacent Java directory in the source package. Unreal uses this UPL file to include the Java classes and enable hardware-accelerated WebView rendering. No CEF runtime is packaged on Android.

## Rendering, input and local pages

The backend transfers hardware buffers into Vulkan without a full-frame CPU copy. There is no software browser-frame transfer option on Android. A small atlas marker is read for synchronisation; UI presentation still shares GPU time with the game.

Touch, scrolling and keyboard input use the Android backend. The installed system WebView determines browser feature and codec support, so include its version in device reports.

Each registered local mount is mapped to its own virtual HTTPS origin internally. Continue using `gameui://` entry points and the `gameUI` bridge in application code. Root-relative assets are preserved; use relative module URLs. Explicit custom-scheme module specifiers need device checks.

For world labels and audio, see [Mobile APIs](Mobile.md). Browser audio plays through WebView; game-registered sounds play through Unreal.

## Verification and device checks

A packaged Unreal 5.7.4 Development game passed on an API 34 x86-64 Vulkan emulator: accelerated colour and alpha readback, native keyboard input, bridge requests, registered sound commands, resize and close. The independent backend test also covered local resources, reload and background/resume.

Physical Adreno/Mali devices, ARM64 packaged runtime and Shipping configuration remain unverified. Check orientation, DPI, touch drags, text entry, Activity transitions, repeated view creation/closure and media on each target device. For a failure report, include the Unreal log, device/GPU, Android and WebView versions, architecture and whether Vulkan was active.
