# Input

The browser viewport follows the widget's Slate geometry.

## Pointer input and world input

Pointer capture stays with the browser until button release, even if the cursor leaves
the element that started the gesture.

A normal element blocks world input. `html` and `body` pass through. Add
`data-webkiln-world-input` to another empty layout surface when that element should also
pass through:

```html
<main class="fullscreen-layout" data-webkiln-world-input>
  <button>Open inventory</button>
</main>
```

The button still blocks input. Only the marked element itself passes through.
See [API](API.md#automatic-dom-hit-testing) for cursor selectors.

## Keyboard and focus

Clicking handled browser content focuses the widget in Slate and CEF.
When Slate focus leaves, browser focus leaves with it.

Unreal console keys still open the console.

## IME

Composition is cancelled when the widget loses focus or switches to another view. A
world-space widget needs focus through its `WidgetInteractionComponent` before IME or
keyboard input can reach the browser.

## Controller keys

Configured gamepad keys become browser keyboard events. Defaults are in
[Project settings](Settings.md#input). Unmapped keys and analogue sticks stay with the game.

## World-space widgets

See [World-space widgets](WorldSpace.md). Transparent pixels still occupy the Unreal
widget hit rectangle. After a hit reaches the widget, pass-through areas fall through
to the game.
