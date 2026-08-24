# Input

Pointer, keys and gamepad go to the page through the [widget](HUD.md)'s Slate geometry - the browser viewport is the same size as that.

## Pointer vs world

A click on a normal element stays with the UI and blocks the game. `html` and `body` pass through, so clicks on empty page background still go to the game.

If you've got a full-screen layout wrapper that should also pass through, mark it with `data-webkiln-world-input`:

```html
<div id="root" data-webkiln-world-input>
  <main class="fullscreen-layout" data-webkiln-world-input>
    <button>Open inventory</button>
  </main>
</div>
```

That only applies to the element you mark. The button inside still blocks. For decoration that should never hit, use CSS `pointer-events: none`.

Irregular artwork (circles, stars, painted buttons) still uses the layout box unless you opt in:

```html
<button data-webkiln-hit="alpha" style="background: transparent; border: 0; padding: 0">
  <img src="star.png" alt="">
  <span>OK</span>
</button>
```

The control is then shaped like what it paints, including a label that sticks out past the image. Transparent pixels fall through to HTML underneath or to the world. Any non-zero alpha counts. Put the attribute on the control, not on the whole HUD. Unreal `webkiln-texture` native pixels are not sampled; use `mode="dom"` if that image must hole-punch.

`border-radius` and `clip-path` already affect Chromium hits without this attribute.

Once a drag starts, the browser keeps the pointer until you release the button - even if the cursor leaves the element you started on.

If your code changes layout, call `window.webkiln.input.refresh()` afterwards.

You can map CSS selectors to cursor kinds (`pointer`, `text`, `grab`, `grabbing`, `blocked`, `crosshair`, `help`):

```javascript
window.webkiln.input.configure({
  cursorSelectors: {
    grab: '.pan-canvas',
    crosshair: '.selection-tool',
    blocked: '[aria-disabled="true"]',
  },
});
```

**On Input State Changed** tells you whether the world is blocked and which cursor the DOM wants. That's on the [view](Views.md#status-and-delegates).

## Keyboard

Clicking something the browser handles focuses the widget in Slate and CEF. When Slate focus leaves, browser focus leaves with it.

The Unreal console keys still open the console.

IME composition is cancelled if the widget loses focus or you switch views.

## Gamepad

While the widget has keyboard focus, mapped gamepad keys become browser key events. Defaults are in [Project settings](Settings.md#input). Unmapped keys and analogue sticks stay with the game.

For world-space focus and hits, see [World-space UI](WorldSpace.md).
