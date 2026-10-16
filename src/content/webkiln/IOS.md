# iOS and iPadOS

Webkiln's iOS source backend uses the system WKWebView in a native UIKit overlay. It requires Unreal Engine 5.7 or newer and iOS 15 or later at the plugin level. Your Unreal version may require a newer deployment target; use the higher requirement from [Epic's iOS development requirements](https://dev.epicgames.com/documentation/en-us/unreal-engine/ios-ipados-and-tvos-development-requirements-for-unreal-engine).

[Contact JG Games](mailto:contact@jggames.dev) for the mobile source package. Windows trial binaries cannot build an iOS target.

## Current limitations

The iOS package is a source integration with compilation and simulator evidence. Physical-device behaviour and App Store distribution remain unverified. Plan the UI around these backend limits before porting a desktop layout:

| Area | Limitation and practical effect |
| --- | --- |
| Rendering and layering | WKWebView sits above Unreal's rendered UI and supplies no browser texture. It cannot appear on a 3D widget screen, enter an atlas, or be interleaved arbitrarily with Slate widgets. |
| Clipping and touch | Only rectangular viewport clipping is available. Transparent HTML pixels do not automatically pass touches to the game. Supply and update explicit interactive rectangles for a HUD that shares the screen with gameplay. |
| World labels | Projected DOM labels are screen overlays without scene-depth occlusion. They can appear over walls; game code must decide when to hide them. |
| Unreal textures in HTML | The desktop texture-composition path is unavailable. The FPS sample's portrait images use a separate readback workaround, described below. |
| Input | UIKit and WKWebView own native touch, keyboard and text composition. Unreal's pointer/key/text injection paths do not drive the native browser. Device keyboard, focus and safe-area behaviour still need testing. |
| Audio | HTML audio is not captured into Unreal submixes. Use registered Unreal sounds when the game needs to control sound routing. |
| Web content | The backend accepts registered local resources, rejects external requests and does not create popup windows. Package scripts, fonts and other dependencies locally. |
| Browser storage | The web view uses a nonpersistent data store. Do not depend on browser storage surviving a new view or app session; save durable game state in Unreal and access it through the bridge. |

The shared bridge does not imply desktop rendering parity. Use the [mobile capability queries](Mobile.md#capabilities) to select the presentation path.

## Set up your project

1. Configure Unreal's iOS toolchain on a Mac with the matching Xcode and SDK. Set the app's bundle identifier, signing team and provisioning for your target device.
2. Install the complete mobile source plugin at `YourProject/Plugins/Webkiln` and enable it. The backend links UIKit and WebKit; it does not require a CEF download.
3. Register the packaged HTML folder under **Trusted Local Mounts**. Follow [Getting started](QuickStart.md) to open `gameui://app/index.html` and bind the view to a screen-space Webkiln widget.
4. Build and package the iOS game through Unreal. Include the local UI folder as described in [Packaging](Packaging.md), then install the signed app on your test iPhone or iPad.

The shared `gameUI` request, event and readiness APIs work with this backend. Local module imports and fetch requests were exercised in the simulator. Keep UI dependencies in the registered folders: external requests are rejected by the iOS resource policy.

## Layout and touch input

The browser appears above Unreal's rendered widgets. It follows the host widget's position, scale, rotation, shear, opacity and rectangular viewport clipping. Webkiln disables UIKit's automatic scroll-view insets because Slate already positions the browser viewport; this keeps visible controls aligned with browser-local hit regions. UIKit owns touch input, scrolling and the keyboard. The overlay hides when its widget stops being painted or is destroyed.

By default the visible browser rectangle accepts touches. To let the game receive touches outside specific controls, supply browser-local rectangles as `[x, y, width, height]`, normalised to `0..1`:

```js
await gameUI.setInteractiveRegions([[0.1, 0.2, 0.3, 0.4]]);
await gameUI.setInteractiveRegions([]); // All touches go through to Unreal.
await gameUI.clearInteractiveRegions(); // Restore whole-browser input.
```

The list accepts up to 128 rectangles, each within the browser. Keep it current when controls move. The backend applies the native transform and clipping when checking a touch. The corresponding view methods are `SetNativeInteractiveRegions()` and `ClearNativeInteractiveRegions()`.

## Textures, labels and audio

iOS supplies no browser texture to Unreal. Texture elements, atlas capture, 3D widget screens, arbitrary interleaving with Slate widgets, shaped clipping and transparent-pixel touch testing are unavailable. Use screen-space HTML for the HUD and [projected DOM labels](Mobile.md#projected-world-labels) for world labels.

The FPS sample's live portraits copy scene-capture pixels through asynchronous GPU readback, encode them as JPEG images and send them to the page through the bridge. This is a sample-specific image path, not direct texture composition. It adds readback, image-encoding and message traffic; measure update latency and frame cost on target devices before using it for larger or more frequent captures. Simulator playback establishes no physical-device performance budget.

Browser audio plays through WebKit rather than an Unreal submix. [Registered Unreal sounds](Mobile.md#sound) remain available through the shared audio commands.

Local HTML audio and video require a user gesture by default; use `playsinline` for inline video. Local media supports byte ranges for seeking. Data/blob media and streaming manifests such as HLS and DASH are excluded; Picture in Picture and AirPlay are disabled. Native fullscreen media can cover the trial banner. Codec support, seeking and playback need physical-device checks.

## Verification and remaining checks

The iOS integration handoff includes passing Unreal iOS Development and Shipping plugin builds with SDK 26.5 and a plugin deployment target of iOS 15. A separate iOS 26.5 simulator test passed the production bootstrap, origin authentication, module imports, local fetch and external-request rejection. These are the handoff's Apple-host results; the 1.84 release packaging on Windows did not repeat native Apple builds.

The custom Unreal 5.7.4 FPS sample also built and staged as an unsigned arm64 device app and ran in the simulator. Simulator checks exercised native Pause/Resume, movement and aiming, projected health labels and asynchronous scene-capture portraits. These sample adaptations do not add browser textures or depth-occluded world surfaces to the iOS backend. The matching custom engine requires the supplied iOS compiler, Simulator linking, texture-cooking and Metal readback fixes.

Unsigned device staging establishes that an arm64 app was produced, not that it was signed, installed or run on an iPhone/iPad. The sample results apply to that custom engine configuration; compatibility with an unmodified stock engine has not been established by those runs. Unreal 5.8 source packages are available, but native Unreal 5.8 iOS compilation and runtime validation have not been completed.

No physical iPhone/iPad installation was performed. The remaining device checks include layout and safe areas, keyboard/focus/IME, simultaneous gameplay and HTML touches, media and audio behaviour, background/foreground transitions, portrait update cost and sustained performance. Signing, provisioning and App Store distribution also remain unverified. The iOS release is supplied as source; no mobile trial binaries or playable demo downloads are published.
