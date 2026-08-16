# View lifecycle

`UWebkilnSubsystem` belongs to the game instance. The subsystem owns each view that you create through it. The subsystem closes those views when the game instance is destroyed.

## Creating a view

**Create View** and **Create View Async** return a `UWebkilnView` immediately. Both start CEF loading. They do not block the game thread.
Bind **On Ready** and **On Load Failed** on the returned view before you use the page.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();

FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");

UWebkilnView* View = Webkiln->CreateViewAsync(Params);
```

View IDs are unique in one game instance. If you create another view with the same ID, Webkiln returns the existing view. Webkiln does not navigate, resize or replace that view. Use **Find View** when code must share a view.

Webkiln adds a `view` query parameter to the entry URL. For example, `gameui://app/index.html` becomes `gameui://app/index.html?view=MainUI`. Webkiln keeps existing query parameters.

## Size and render scale

A width or height of `0` uses the current player viewport dimension. If no player viewport exists, Webkiln uses the primary display dimension. `Render Scale` changes the backing texture size. It does not change the CSS viewport:

```text
browser viewport: 1280 x 720
render scale:      1.5
render target:     1920 x 1080
```

`UWebkilnWidget` checks its Slate geometry each tick. When the widget size changes, Webkiln resizes the browser viewport and the render target. This applies to windowed-mode resize, fullscreen transitions and DPI or layout changes. Use **Resize** when a view has no widget that resizes the view.

`UI Scale Viewport Size` is the player viewport in logical browser pixels. Webkiln publishes this value to the CSS scaling code. Zero uses the browser viewport. Atlas and off-screen views can supply the logical viewport of the visible player and keep a different browser size.

## Attaching the view

Create or place a `UWebkilnWidget`. Call **Set View**. Then add the widget to the viewport. When you assign a new view, Webkiln removes these items of the previous view from the widget:

- texture bindings
- anchor atlas
- IME connection

Webkiln then applies those items to the new view. The subsystem continues to own both views.

If you remove the widget, Webkiln does not close the view. Call **Close** on the view or **Destroy View** on the subsystem when you no longer need the view.

## Status and delegates

| Status or delegate | Meaning |
|---|---|
| Uninitialised | The view has not started. |
| Initialising | CEF creates or navigates the browser. |
| On Ready | The main document loaded. Trusted `gameui://` pages also have the bridge and Webkiln page helpers. The delegate fires again after a successful reload. |
| Ready | The page can receive input, bridge responses and pushed events. |
| On Load Failed | CEF startup, navigation or rendering failed. The delegate supplies the error text. |
| Failed | You cannot use the view until you close it and create it again. |
| Shutting Down | Native browser resources close. |
| On Closed | The native browser and its resources closed. |
| On Console Message | Supplies severity, message and source for a browser console message. |
| On Input State Changed | Supplies the current world-input block flag and DOM cursor kind. |
| On Test Result | Supplies the request ID, command, success flag and JSON result from an automation command. |

**Reload** navigates the current entry point again. During navigation the status returns to Initialising. For the new document, Webkiln publishes again:

- texture element layout
- anchor layout
- DOM input state
- localisation state

## Closing a view

**Close** calls **Destroy View** on the owning subsystem. **Destroy View** closes each matching view and removes it from the subsystem. Webkiln rejects each pending JavaScript request from that view with error code `view_closed`.

When the game instance shuts down, Webkiln closes all remaining views. Webkiln rejects their pending requests with the same code. If you close a widget only, view ownership does not change.
