# Input

Pointer, keys and gamepad go to the page through the [widget](HUD.md)'s Slate geometry.

You can map CSS selectors to various cursor kinds (`pointer`, `text`, `grab`, `grabbing`, `blocked`, `crosshair`, `help`):

```javascript
window.webkiln.input.configure({
  cursorSelectors: {
    grab: '.pan-canvas',
    crosshair: '.selection-tool',
    blocked: '[aria-disabled="true"]',
  },
});
```

**On Input State Changed** tells you whether the world is blocked and which cursor the DOM wants.

Ctrl-wheel and touchpad pinch leave the page's UI scale unchanged. Your wheel handlers still receive these events, so you can use them to zoom a map or canvas. Ordinary wheel scrolling keeps its usual behaviour.

## Keyboard

Clicking something the browser handles focuses the widget in Slate and CEF. When Slate focus leaves, browser focus leaves with it. **Set Browser Focus** on the view does the same thing from Blueprint or C++.

IME composition is cancelled if the widget loses focus or you switch views.

## Gamepad

While the widget has keyboard focus, mapped gamepad keys become browser key events. Defaults are in [Project settings](Settings.md#input). Unmapped keys and analogue sticks stay with the game.

For world-space focus and hits, see [World-space UI](WorldSpace.md).
