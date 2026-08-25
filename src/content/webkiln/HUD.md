# HUD

For a HUD, you add a `UWebkilnWidget` to the viewport. The widget draws the [view](Views.md)'s texture; the subsystem still owns the view.

## Create the widget

1. Create a view with **Create View** or **Create View Async**. [Getting started](QuickStart.md) covers this.
2. Create a **Webkiln Widget** (`UWebkilnWidget`).
3. **Set View** on the widget.
4. **Add to Viewport**.

You can also drop `UWebkilnWidget` inside your own UMG widget and add that instead.

![UMG widget whose parent class is a Webkiln host widget](/webkiln/docs/hud-umg.png)

![HUD drawn over the game](/webkiln/docs/hud-play.jpg)

Taking the widget off the viewport doesn't close the view. See [Views](Views.md#close-a-view). Switching views is covered in [Views](Views.md#attach-the-view).

## Size and transparency

Width, height, resize and **Render Scale** are in [Views](Views.md#size-and-render-scale).

For a transparent background, set **Transparent** on the [view init params](Views.md#init-params), or **Use Default Transparency** and the **Default Transparent** [project setting](Settings.md#runtime).

Opaque views paint a black cover until the page calls [`gameUI.markReady()`](TalkToTheGame.md#when-is-the-page-ready). Transparent HUDs don't.

[Unreal textures](Textures.md), localisation and anchors are in [HTML elements](HtmlElements.md). Clicks versus the world are in [Click-through](ClickThrough.md). Keyboard and gamepad are in [Input](Input.md). For the same widget in the level, see [World-space UI](WorldSpace.md).
