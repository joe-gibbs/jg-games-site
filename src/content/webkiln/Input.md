# Input

`UWebkilnWidget` forwards Slate input to CEF with browser-pixel coordinates. The browser
viewport follows the widget Slate geometry. Pointer positions stay correct after a
window resize, DPI change or fullscreen transition.

## Pointer input and world input

Webkiln forwards mouse move, button down, button up, double click, leave and wheel events.
Pointer capture stays with the browser until button release. Capture continues when the cursor leaves
the element that started the gesture.

Webkiln asks Chromium which DOM element is under the pointer. A normal element blocks world
input. The document `html` and `body` surfaces pass through. Add
`data-webkiln-world-input` to another empty layout surface when that element must also
pass through:

```html
<main class="fullscreen-layout" data-webkiln-world-input>
  <button>Open inventory</button>
</main>
```

The button still blocks input. The marker applies only to the element that carries it.
**On Input State Changed** reports the current block flag and cursor kind. The widget returns
unhandled Slate replies over pass-through areas. Then the owning game can receive them.
For CSS selectors, cursor kinds and `window.webkiln.input`, see [API](API.md#automatic-dom-hit-testing).

## Keyboard and focus

When the user clicks handled browser content, the Webkiln widget receives Slate user focus. CEF
receives browser focus. **Set Browser Focus** can change CEF focus. When Slate removes focus,
Webkiln also removes browser focus.

Webkiln sends key down, key up and character events while the widget has focus. Unreal console
keys stay unhandled so that the console remains available. Chromium handles normal browser
editing shortcuts in a focused editable element. This includes clipboard copy, cut, paste and select-all.

## IME

The widget registers a text input method context for Unreal. Chromium reports the editable
selection and character bounds. Webkiln converts them through the current Slate geometry
so that the operating system can place its composition and candidate windows.

Webkiln cancels composition when the widget loses focus or changes to another view. A
world-space widget needs focus through its `WidgetInteractionComponent` before IME or
keyboard input can reach the browser.

## Controller keys

Webkiln translates configured gamepad keys to browser keyboard events. The default mapping is
listed in [Project settings](Settings.md#input). Unmapped gamepad keys remain available to the
game. HTML controls receive the mapped keys through Chromium keyboard navigation.

Webkiln does not convert controller analogue axes into DOM pointer movement. The game
can drive a `WidgetInteractionComponent`, a virtual cursor, or JavaScript behaviour.
Then the game uses the existing pointer or event path.

## World-space widgets

Use the Unreal `WidgetInteractionComponent` to send pointing and focus input to a Webkiln
widget inside a world-space `WidgetComponent`. Match the component draw size to the intended
browser size. See [World-space widgets](WorldSpace.md).

Transparent browser pixels still occupy the Unreal rectangular widget hit area. After a hit
reaches the widget, DOM pass-through controls whether Webkiln consumes that hit. The owning game
selects the widget in the 3D world.
