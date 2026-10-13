# Mobile APIs

[Android](Android.md) and [iOS/iPadOS](IOS.md) use system web engines with the shared `gameUI` bridge. Their platform pages cover installation, packaging and verification. This page covers the APIs for a UI that runs on both.

## Capabilities

| Capability | Android | iOS |
| --- | --- | --- |
| Browser | Android WebView | WKWebView |
| Presentation | Unreal texture through Vulkan | Native overlay above the game |
| Texture composition and atlas capture | Implemented; physical-device checks pending | Unavailable |
| Projected DOM world labels | Opt in | Default |
| Registered Unreal sound commands | Available | Available |
| Browser audio capture into Unreal submixes | Unavailable | Unavailable |

Query `UsesNativeOverlay()`, `SupportsTextureComposition()`, `UsesProjectedAnchors()` and `SupportsUnrealAudioRouting()` on the view when choosing how to display the UI. The audio query describes capturing browser audio; registered Unreal sounds are a separate feature.

The request, event and readiness APIs use the same game-side handlers on each platform. Register local HTML and assets through **Trusted Local Mounts**, then use `gameui://app/index.html` as the entry point. Mobile remote browsing is not enabled by this implementation.

## Projected world labels

Projected anchors display labels inside the main page using Unreal's projected position, scale, opacity and visibility. Use **Set Anchor Placement** / **Set Anchor Placements** and **Bind Anchor to Component**, with `<webkiln-anchor source="key">` or `data-webkiln-anchor="key"` elements in the page.

On iOS this mode is always enabled. On Android and desktop, set `FWebkilnViewInitParams::bUseProjectedAnchors` when creating the view. `UsesProjectedAnchors()` reports the selected mode.

Place labels under a page root without a CSS transform so their fixed coordinates refer to the viewport. They need no atlas view and have no scene-depth occlusion. Add the `interactive` attribute to labels that accept input. On iOS, include those labels in the native interactive rectangles when using explicit touch regions; see [iOS input](IOS.md#layout-and-touch-input).

## Sound

Register a game-owned `USoundBase` on the view with `RegisterSound(Name, Sound)`. A trusted page can play that registered name:

```js
const handle = await gameUI.audio.play('click', {volume: 0.5, pitch: 1});
await gameUI.audio.update(handle, {volume: 0.25, paused: true});
await gameUI.audio.update(handle, {paused: false});
await gameUI.audio.stop(handle);
```

`play()` resolves to a handle string. SoundClass, submix routing and looping come from the registered asset. Page requests cannot load arbitrary asset paths or URLs. Reloading or closing the view stops its active sounds.

The Android emulator verified these commands and sample consumption. Physical sound-asset routing and iOS playback still need device checks. Ordinary HTML audio/video uses the system browser's audio path; see the platform pages for media restrictions.
