# iOS and iPadOS

Webkiln's iOS source backend uses the system WKWebView in a native UIKit overlay. It requires Unreal Engine 5.7 or newer and iOS 15 or later at the plugin level. Your Unreal version may require a newer deployment target; use the higher requirement from [Epic's iOS development requirements](https://dev.epicgames.com/documentation/en-us/unreal-engine/ios-ipados-and-tvos-development-requirements-for-unreal-engine).

[Contact JG Games](mailto:contact@jggames.dev) for the mobile source package. Windows trial binaries cannot build an iOS target.

## Set up your project

1. Configure Unreal's iOS toolchain on a Mac with the matching Xcode and SDK. Set the app's bundle identifier, signing team and provisioning for your target device.
2. Install the complete mobile source plugin at `YourProject/Plugins/Webkiln` and enable it. The backend links UIKit and WebKit; it does not require a CEF download.
3. Register the packaged HTML folder under **Trusted Local Mounts**. Follow [Getting started](QuickStart.md) to open `gameui://app/index.html` and bind the view to a screen-space Webkiln widget.
4. Build and package the iOS game through Unreal. Include the local UI folder as described in [Packaging](Packaging.md), then install the signed app on your test iPhone or iPad.

The shared `gameUI` request, event and readiness APIs work with this backend. Local module imports and fetch requests were exercised in the simulator. Keep UI dependencies in the registered folders: external requests are rejected by the iOS resource policy.

## Layout and touch input

The browser appears above Unreal's rendered widgets. It follows the host widget's position, scale, rotation, shear, opacity and rectangular viewport clipping. UIKit owns touch input, scrolling and the keyboard. The overlay hides when its widget stops being painted or is destroyed.

By default the visible browser rectangle accepts touches. To let the game receive touches outside specific controls, supply browser-local rectangles as `[x, y, width, height]`, normalised to `0..1`:

```js
await gameUI.setInteractiveRegions([[0.1, 0.2, 0.3, 0.4]]);
await gameUI.setInteractiveRegions([]); // All touches go through to Unreal.
await gameUI.clearInteractiveRegions(); // Restore whole-browser input.
```

The list accepts up to 128 rectangles, each within the browser. Keep it current when controls move. The backend applies the native transform and clipping when checking a touch. The corresponding view methods are `SetNativeInteractiveRegions()` and `ClearNativeInteractiveRegions()`.

## Textures, labels and audio

iOS supplies no browser texture to Unreal. Texture elements, atlas capture, 3D widget screens, arbitrary interleaving with Slate widgets, shaped clipping and transparent-pixel touch testing are unavailable. Use screen-space HTML for the HUD and [projected DOM labels](Mobile.md#projected-world-labels) for world labels.

Browser audio plays through WebKit rather than an Unreal submix. [Registered Unreal sounds](Mobile.md#sound) remain available through the shared audio commands.

Local HTML audio and video require a user gesture by default; use `playsinline` for inline video. Local media supports byte ranges for seeking. Data/blob media and streaming manifests such as HLS and DASH are excluded; Picture in Picture and AirPlay are disabled. Native fullscreen media can cover the trial banner. Codec support, seeking and playback need physical-device checks.

## Verification

Full Unreal iOS Development and Shipping plugin builds passed with SDK 26.5 and a plugin deployment target of iOS 15. A separate iOS 26.5 simulator test passed the production bootstrap, origin authentication, module imports, local fetch and external-request rejection.

This is not a packaged Unreal game or physical iPhone/iPad result. Device layout, safe areas, keyboard, media, background/foreground transitions and App Store distribution remain to be validated.
