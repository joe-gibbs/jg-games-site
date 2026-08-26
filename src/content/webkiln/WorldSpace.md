# World-space UI

The same [`UWebkilnWidget`](HUD.md) can sit on a surface in the level - terminals, in-world screens, floating labels, that sort of thing.

## Set up

1. Create a view as in [Getting started](QuickStart.md). Set an explicit [width and height](Views.md#size-and-render-scale) that match the component draw size.
2. Add a **Widget Component** to an actor. Set **Space** to **World**. Set **Widget Class** to **Webkiln Widget**, or a user widget that contains one.
3. Match **Draw Size** on the component to the view's browser size.
4. At Begin Play, **Get User Widget Object** on the component, cast to **Webkiln Widget**, and **Set View**.
5. Add a **Widget Interaction** component to the player (or the interacting pawn) and aim it at the widget component so clicks and keys reach the page.

## Pin HTML to an actor

You will often want to be guaranteed that the position of an element in world-space updates locked to the frame. Since Webkiln is decoupled from the Unreal frame loop it's normally unable to do this - UI updates can be a few frames behind, making it look laggy when an enemy health bar stays where it was on screen while the camera moves around.

To fix this you can use **Bind Anchor to Component**. It uses an atlas view - a second off-screen [view](Views.md#create-a-view) that paints many labels or controls - and follows a capsule each tick.

Create that atlas page, set it as the main view **Anchor Atlas View**, then **Set Anchor Placements** / **Set Anchor Placement** for positions. **Bind Anchor to Component** follows a scene component or socket.

```html
<webkiln-anchor source="settlement.rome" anchor="50% 100%" interactive>
  <button data-webkiln-anchor-hit>Rome</button>
</webkiln-anchor>
```

```blueprint
set-atlas
bind-anchor
```

`anchor` is CSS-like - pixels or percentages - and defaults to the centre of the element. **Layer** is draw order. **Hit Priority** on a placement breaks ties; if you don't set it, the draw layer is used. **Bind Anchor to Component** does not have a Hit Priority pin.

`data-webkiln-anchor-hit` on a descendant shrinks the clickable region; buttons, links and inputs are already clickable. The same setup works with `data-webkiln-anchor="key"` on a normal element.

If your code changes atlas layout, call `window.webkiln.anchors.refresh()` or `window.webkiln.anchors.repack()`.

## Hits

Transparent pixels still count as part of the Unreal widget's hit rectangle. Unreal hits the component first, then Webkiln decides whether that point is actually a DOM hit or should [pass through](ClickThrough.md). Anything that passes through goes to the game.

If you need a trace that follows the visible shape before the widget is even hit, that's on you in game code.

## Keyboard and IME

The widget needs focus through the `WidgetInteractionComponent` before [keyboard input or IME](Input.md#keyboard) can reach the page. **Set Browser Focus** on the view can give or take that focus.
