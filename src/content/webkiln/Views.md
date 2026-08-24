# Views

A view is one HTML page - Chromium, a render texture, and captured audio. The game-instance subsystem (`UWebkilnSubsystem`) owns every view. A [`UWebkilnWidget`](HUD.md) is what you actually put on screen.

To put one on the HUD, see [Getting started](QuickStart.md). The widget itself is in [HUD](HUD.md).

## Create a view

Both **Create View** and **Create View Async** give you a `UWebkilnView` immediately and start loading in the background. Bind **On Document Ready**, **On Ready** and **On Load Failed** before you use the page.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();

FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");

UWebkilnView* View = Webkiln->CreateViewAsync(Params);
```

If you create a second view with the same ID, you get the existing one back.

The entry URL gets a `view` query parameter (`?view=MainUI`). Existing query parameters are kept.

## Init params

`FWebkilnViewInitParams`:

| Field | Meaning |
|---|---|
| View Id | Used to find and destroy the view. |
| Entry Point | Page URL, for example `gameui://app/index.html`. |
| Width, Height | Zero uses the current player viewport dimension. |
| Render Scale | Multiplier for the backing texture size. |
| UI Scale Viewport Size | For [atlas](HtmlElements.md#screen-and-world-anchors) / off-screen views. Zero uses the browser size. |
| Transparent | Alpha background. |
| Use Default Transparency | Uses the [project setting](Settings.md#runtime) instead of the value above. |
| Frame Rate | Zero uses the [project default](Settings.md#runtime). |
| Create Render Target | The texture that Slate and UMG present. |
| Localisation String Table | String Table asset given to the page. See [HTML elements](HtmlElements.md#unreal-localisation). |
| Localisation String Table Id | Native String Table, used instead of an asset. |
| Route Browser Audio to Unreal | Captures Chromium audio into the Unreal mixer. See [HTML elements](HtmlElements.md#browser-audio). |
| Browser Audio Volume | Initial Unreal-side multiplier. |
| Browser Audio Is UI Sound | Unreal UI-sound pause and mixing rules. |
| Browser Audio Sound Class | Mix and pause class. |
| Browser Audio Submix | Effects graph. |

## Size and render scale

Width or height `0` uses the player viewport, or the primary display if that isn't there. **Render Scale** changes the backing texture size. The CSS viewport stays the same:

```text
browser viewport: 1280 x 720
render scale:      1.5
render target:     1920 x 1080
```

When a `UWebkilnWidget` resizes, the browser viewport and render target follow. Call **Resize** if you need to size a view that hasn't got a widget.

`UI Scale Viewport Size` is for atlas and off-screen views that should scale as if they were the player viewport. Zero uses the browser size.

## Attach the view

Assign the view with **Set View**. Switching views clears [texture bindings](HtmlElements.md#unreal-textures) this widget applied to the previous view, and cancels [IME](Input.md#keyboard) if a composition is in progress. The widget then applies its textures, [anchor atlas](HtmlElements.md#screen-and-world-anchors) and string table to the new view. The previous view keeps whatever atlas it already had. The subsystem still owns both views.

Taking the widget off doesn't close the view. Call **Close** or **Destroy View** for that.

## Status and delegates

| Status or delegate | Meaning |
|---|---|
| On Document Ready | Main document loaded. [`gameUI`](TalkToTheGame.md) and [page helpers](HtmlElements.md) are injected. `webkiln:runtime-ready` is dispatched on `gameui://` pages. |
| Document Ready | The page can `gameUI.request`. Pushed events from Unreal are held. The widget still paints a black cover. |
| On Ready | The page called `gameUI.markReady()`. Remote pages fire this after load. After a reload the page must call `markReady` again. |
| Ready | The cover fades. Queued Unreal events flush. [Input](Input.md) is separate - it follows DOM hit testing, not this status. |
| On Load Failed | CEF startup, navigation or rendering failed. Error text is in the delegate. |
| Failed | Close it and create it again before reuse. Creating the same ID again returns this failed view. |
| On Console Message | JavaScript `console` output from this view. |
| On Closed | Browser and native resources have closed. |
| On Input State Changed | World-input block flag and DOM cursor kind. See [Input](Input.md). |

**Reload** sends [texture](HtmlElements.md#unreal-textures) layout, [anchors](HtmlElements.md#screen-and-world-anchors), [input](Input.md) state and [localisation](HtmlElements.md#unreal-localisation) again once the new document is ready. Call `markReady` again after that.

## Close a view

**Close** is **Destroy View** on the owning subsystem. Any JavaScript requests still in flight fail with `view_closed`. That's listed in [JavaScript bridge](Bridge.md#requests-from-javascript). Views that are still around close with the game instance.
