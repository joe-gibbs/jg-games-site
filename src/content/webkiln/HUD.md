# HUD

For a HUD, you add a `UWebkilnWidget` to the viewport which draws the [view](Views.md)'s texture.

## Create the widget

1. Create a view with **Create View** or **Create View Async**. [Getting started](QuickStart.md) covers this.
2. Create a **Webkiln Widget** (`UWebkilnWidget`).
3. **Set View** on the widget.
4. **Add to Viewport**.

You can also drop `UWebkilnWidget` inside your own UMG widget and add that instead.

![UMG designer with a Webkiln Widget filling a PlayerHUD widget](/webkiln/docs/hud-umg.png)

![HUD drawn over the game](/webkiln/docs/hud-play.jpg)

Taking the widget off the viewport doesn't close the view. See [Views](Views.md#close-a-view).

## Size and transparency

For a transparent background, set **Transparent** on the [view init params](Views.md#init-params), or **Use Default Transparency** and the **Default Transparent** [project setting](Settings.md#runtime).

[Unreal textures](Textures.md), [localisation](Localisation.md) and [browser audio](Audio.md) have their own pages. Anchors are in [World-space UI](WorldSpace.md). Clicks versus the world are in [Click-through](ClickThrough.md). Keyboard and gamepad are in [Input](Input.md).
