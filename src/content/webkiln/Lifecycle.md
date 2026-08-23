# View lifecycle

The game-instance subsystem owns every view.

## Creating a view

**Create View** and **Create View Async** both return a `UWebkilnView` immediately and start loading in the background.
Bind **On Ready** and **On Load Failed** before you use the page.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();

FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");

UWebkilnView* View = Webkiln->CreateViewAsync(Params);
```

Creating a second view with the same ID returns the existing view as-is.

The entry URL gets a `view` query parameter (`?view=MainUI`). Existing query parameters are kept.

## Size and render scale

Width or height `0` uses the current player viewport, or the primary display if that is missing. `Render Scale` changes the backing texture size. The CSS viewport stays the same:

```text
browser viewport: 1280 x 720
render scale:      1.5
render target:     1920 x 1080
```

When a `UWebkilnWidget` resizes, the browser viewport and render target follow. Call **Resize** to size a view on its own.

`UI Scale Viewport Size` is for atlas and off-screen views that should scale as if they were the player viewport. Zero uses the browser size.

## Attaching the view

Assign the view with **Set View**. Switching views clears the previous view's texture bindings, anchor atlas and IME from the widget. The subsystem still owns both views.

Removing the widget leaves the view open. Call **Close** or **Destroy View** to tear it down.

## Status and delegates

| Status or delegate | Meaning |
|---|---|
| On Ready | Main document loaded. Trusted `gameui://` pages also have the bridge and page helpers. Runs again after a successful reload. |
| Ready | Input, bridge responses and pushed events are live. |
| On Load Failed | CEF startup, navigation or rendering failed. Error text is in the delegate. |
| Failed | Close it and create it again before reuse. |
| On Input State Changed | World-input block flag and DOM cursor kind. |

**Reload** re-sends texture layout, anchors, input state and localisation once the new document is ready.

## Closing a view

**Close** is **Destroy View** on the owning subsystem. Pending JavaScript requests fail with `view_closed`. Leftover views close with the game instance.
