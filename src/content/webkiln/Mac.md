# macOS

Webkiln on Mac uses CEF with Metal texture composition. The current implementation targets Apple Silicon (`arm64`). The verified build used a custom Unreal 5.7 AngelScript engine on an Apple M4; Intel and universal plugin binaries have not been validated.

Mac requires a source package containing its CEF framework, static wrapper and helper apps. [Contact JG Games](mailto:contact@jggames.dev) for the package and engine integration requirements. The Windows trial zip contains no Mac runtime.

## Set up your project

1. Install Xcode and the SDK required by your Unreal version. [Epic's macOS requirements](https://dev.epicgames.com/documentation/en-us/unreal-engine/macos-development-requirements-for-unreal-engine) list the matching versions.
2. Extract the complete Mac source package into `YourProject/Plugins/Webkiln` on the Mac, preserving framework symlinks and executable permissions.
3. Enable Webkiln, select Metal and compile your project for `arm64`.
4. Follow [Getting started](QuickStart.md) to register the local HTML folder and place a Webkiln widget on the HUD. The `gameUI` bridge and desktop texture APIs use the same interface as Windows.
5. Package a Development build for Mac, including the trusted local UI folders described in [Packaging](Packaging.md).

The host engine must supply `isHandlingSendEvent` and `setHandlingSendEvent:` on its Mac `UEApplication`, tracking Cocoa event dispatch. Webkiln checks these methods during browser initialisation. A log saying `Webkiln requires the Mac Launch UEApplication event-dispatch integration` means that engine integration is missing. Supply the engine version and log when requesting the matching integration; the current validation does not establish compatibility with every stock engine release.

## Rendering and input

CEF renders into an IOSurface. Webkiln copies that frame on the game's Metal device into the Unreal texture used by Slate. Screen-space widgets, texture composition and atlas-based world labels use the desktop path. Retina scaling and resize requests are handled by the Mac backend.

Mac keyboard events are translated from Cocoa, including Command and Control. International layouts and IME input still need broader validation.

## Package the complete app

The game bundle contains `Chromium Embedded Framework.framework` and five helper apps directly under `Contents/Frameworks`: the base `WebkilnSubprocess` and its Renderer, GPU, Plugin and Alerts variants. Keep the framework links, each helper's resources and its runtime manifest intact.

Use your application's normal Apple signing and distribution process for the complete bundle and all nested code. Local ad-hoc signatures were verified during development; they do not establish notarisation or public distribution readiness.

A useful final check is:

```bash
codesign --verify --deep --strict --verbose=2 "YourGame.app"
```

## Verification

The Unreal Mac module compiled and linked, and a game completed Shipping compilation, cooking, staging and static app validation. The independent CEF/Metal test passed 1,077 accelerated frames, five resize phases and a bridge round trip with zero software frames or copy failures. These checks cover the tested Apple Silicon configuration; they do not certify all Mac hardware or engine versions.
