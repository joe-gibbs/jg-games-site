# Mobile development candidate

Webkiln has experimental Android and iOS source backends for Unreal 5.7 and newer, separate from the released Windows downloads. A packaged Unreal 5.7.4 game passed an Android API 34 x86-64 emulator test using Vulkan: the bridge, native keyboard input, registered Unreal sound commands, accelerated color and transparency readback, resize and close. A separate native harness also passed local-resource, reload and background/resume checks. Physical Android devices remain unverified. The iOS implementation has portable policy and bridge tests, but has not been compiled with an Apple SDK or tested on an iPhone or iPad.

| Capability | Android | iOS |
| --- | --- | --- |
| Browser | System Android WebView | WKWebView |
| Presentation | GPU texture through Vulkan | Native UIKit overlay above the game |
| Minimum OS | Android 8 / API 26 | iOS 15 |
| Local pages and gameUI bridge | Implemented | Implemented |
| Unreal texture composition and atlas anchors | Emulator texture pass; device and anchor stress tests pending | Unavailable |
| Projected DOM world labels | Opt in | Default |
| Registered Unreal sound commands | Implemented | Implemented |
| Browser audio capture into Unreal submixes | Unavailable | Unavailable |

Use `UsesNativeOverlay()`, `SupportsTextureComposition()`, `UsesProjectedAnchors()` and `SupportsUnrealAudioRouting()` to choose platform behavior. The audio-routing query describes capture of browser audio; it does not disable the registered Unreal sound commands below. The existing `gameUI` request, event and readiness interfaces remain available. Pages must use registered local `gameui://` entry points; remote browsing is not enabled by this candidate.

## Android presentation

Android requires Vulkan and support for Android hardware-buffer imports. There is no full-frame software-copy fallback. Browser pixels stay on the GPU; atlas synchronization reads a small marker. Game rendering and UI still share GPU resources. The packaged Unreal emulator test verified three distinct accelerated texture frames, exact color and alpha, retention across resize and view shutdown. Physical GPU drivers, anchor stress, Activity transitions and shipping builds still need validation.

## iOS presentation and input

Place the browser in a screen-space widget. The UIKit overlay follows its affine placement, including rotation, scale and shear, opacity, and rectangular viewport clipping. Native WebKit owns rendering, scrolling, touch input and the keyboard. The overlay hides when its widget is no longer painted or is destroyed, and backgrounding or suspension dismisses the keyboard and requests media suspension.

iOS does not supply a browser texture to Unreal. Arbitrary stacking between Unreal widgets, shaped clipping, scene-depth composition, 3D widget surfaces and transparent-pixel touch testing remain unavailable.

By default, the whole visible browser rectangle accepts touches. For an iOS overlay, a page can specify up to 128 interactive rectangles in untransformed browser-local coordinates. Each `[x, y, width, height]` is normalized to `0..1` and must fit inside the browser. The native transform and clip are applied during hit testing; touches outside these regions pass to Unreal.

```js
await gameUI.setInteractiveRegions([[0.1, 0.2, 0.3, 0.4]]);
await gameUI.setInteractiveRegions([]); // Pass every touch through.
await gameUI.clearInteractiveRegions(); // Restore whole-browser input.
```

The corresponding view methods are `SetNativeInteractiveRegions()` and `ClearNativeInteractiveRegions()`. The JavaScript commands reject on platforms without a native overlay. Keep the regions in sync with page layout when controls move or resize.

## Projected world labels

Projected anchors place DOM labels in the main browser using Unreal's projected positions, scale, opacity and visibility. They reuse **Set Anchor Placement** / **Set Anchor Placements** and **Bind Anchor to Component**, with matching `<webkiln-anchor source="key">` or `data-webkiln-anchor="key"` elements in the main page. They do not require an anchor atlas view. Place projected labels under a page root without a CSS transform so their fixed coordinates refer to the viewport.

This mode is always enabled for iOS. Elsewhere, set `FWebkilnViewInitParams::bUseProjectedAnchors` when creating the view; `UsesProjectedAnchors()` reports the active mode. Labels remain browser content: their updates follow browser presentation, and they do not gain scene-depth occlusion or become 3D surfaces. Add the `interactive` attribute to labels that should accept input. On iOS, those labels also need suitable native interactive regions when explicit region mode is enabled.

## Sound and local media

Register a game-owned `USoundBase` asset with `RegisterSound(Name, Sound)` on the view. A trusted page can then play that registered name through Unreal audio:

```js
const handle = await gameUI.audio.play('click', {volume: 0.5, pitch: 1});
await gameUI.audio.update(handle, {volume: 0.25, paused: true});
await gameUI.audio.update(handle, {paused: false});
await gameUI.audio.stop(handle);
```

`play()` resolves to a handle string. SoundClass, submix routing and looping come from the registered asset. Page requests cannot load arbitrary asset paths or URLs. Reloading or closing the view stops its active sounds. Real playback and routing still require Unreal/device validation.

Ordinary local HTML audio/video is enabled, with a user gesture required by default. Use `playsinline` for inline video. Codec, container and system-engine support vary and require device checks. Browser media audio remains separate from Unreal audio: these mobile backends do not capture WebView/WKWebView audio into an Unreal submix.

On iOS, local media responses support byte ranges for seeking. The media policy excludes data/blob URLs and recognized streaming manifests such as HLS and DASH, whose native players can fetch segments outside the local resource handler. Picture in Picture and AirPlay are disabled. Native fullscreen video, and element fullscreen on iOS 15.4 or later, may cover the evaluation banner; the banner guarantee applies to the ordinary overlay. The backend uses documented WKWebView and UIKit APIs. Custom-scheme playback, seeking, network isolation and App Store review remain separate validation steps.

## Packaging

Install the complete source plugin under your project's `Plugins/Webkiln`. Android packaging includes the Java sources through Webkiln's UPL file. Keep trusted local resources in the packaged game as described in [Packaging](Packaging.md). Mobile uses the system web engine and does not stage a CEF runtime.

Android preserves root-relative asset paths using a separate virtual HTTPS origin per mount. Relative module URLs are recommended; explicit custom-scheme module URLs and iOS custom-scheme fetch/module behavior still require device validation.
