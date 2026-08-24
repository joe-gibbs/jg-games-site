# World-space UI

The same [`UWebkilnWidget`](HUD.md) can sit on a surface in the level - terminals, in-world screens, floating labels, that sort of thing.

## Set up

1. Create a view as in [Getting started](QuickStart.md). Set an explicit [width and height](Views.md#size-and-render-scale) that match the component draw size.
2. Add a **Widget Component** to an actor. Set **Space** to **World**. Set **Widget Class** to **Webkiln Widget**, or a user widget that contains one.
3. Match **Draw Size** on the component to the view's browser size.
4. At Begin Play, **Get User Widget Object** on the component, cast to **Webkiln Widget**, and **Set View**.
5. Add a **Widget Interaction** component to the player (or the interacting pawn) and aim it at the widget component so clicks and keys reach the page.

## Pin HTML to an actor

The FPS demo puts health numbers on NPCs with **Bind Anchor to Component**. That's one [atlas](HtmlElements.md#screen-and-world-anchors) view, following a capsule each tick. The graph below does this. Nearest-enemy cards on the HUD use [Unreal textures](Textures.md) instead.

```blueprint
bind-anchor
```

## Hits

Transparent pixels still count as part of the Unreal widget's hit rectangle. Unreal hits the component first, then Webkiln decides whether that point is actually a DOM hit or should [pass through](ClickThrough.md). Anything that passes through goes to the game.

If you need a trace that follows the visible shape before the widget is even hit, that's on you in game code.

## Keyboard and IME

The widget needs focus through the `WidgetInteractionComponent` before [keyboard input or IME](Input.md#keyboard) can reach the page. Composition is cancelled if the widget loses focus or you switch views.

Pointer pass-through is in [Click-through](ClickThrough.md). Gamepad is in [Input](Input.md#gamepad).
