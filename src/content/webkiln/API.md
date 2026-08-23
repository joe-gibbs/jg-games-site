# API

## View initialisation

`FWebkilnViewInitParams`:

| Field | Meaning |
|---|---|
| View Id | Used to find and destroy the view. |
| Entry Point | Use a trusted `gameui://` URL in normal cases. |
| Width, Height | Zero uses the current player viewport dimension. |
| Render Scale | Multiplier for the backing texture size. |
| UI Scale Viewport Size | For atlas / off-screen views. Zero uses the browser size. |
| Transparent | Alpha background. |
| Use Default Transparency | Uses the project setting instead of the value above. |
| Frame Rate | Zero uses the project default. |
| Create Render Target | The texture that Slate and UMG present. |
| Localisation String Table | String Table asset given to the page. |
| Localisation String Table Id | Native String Table, used instead of an asset. |
| Route Browser Audio to Unreal | Captures Chromium audio into the Unreal mixer. |
| Browser Audio Volume | Initial Unreal-side multiplier. |
| Browser Audio Is UI Sound | Unreal UI-sound pause and mixing rules. |
| Browser Audio Sound Class | Mix and pause class. |
| Browser Audio Submix | Effects graph. |

## Unreal textures in HTML

Trusted `gameui://` pages can show Unreal textures with `webkiln-texture`.

```html
<webkiln-texture
  source="portrait.face"
  alt="Character preview"
  style="width: 320px; height: 320px; object-fit: cover">
</webkiln-texture>
```

Bind the source with **Set Webkiln Texture** on the `UWebkilnView` or its `UWebkilnWidget`.
The input accepts `UTexture`: assets, render targets, media textures and canvas render targets.
**Clear Webkiln Texture** drops a runtime source. `UWebkilnWidget` also has a **Texture Sources**
map for editor bindings.

- `mode="native"` (default when `source` is set) draws the Unreal texture on top of the page.
  `native-layer="below"` draws beneath — use that with transparent overlay pages.
  Opacity, clipping, stacking and `object-fit` work. Pointer input is ordinary DOM input.
- `mode="dom"` shows `src` as a real `<img>`, so CSS transforms, masks, filters and
  border radii go through Chromium.
- `mode="auto"` picks native when `source` is set, otherwise DOM.

```html
<webkiln-texture mode="dom" src="gameui://app/images/frame.png"></webkiln-texture>
<webkiln-texture mode="native" source="scene.preview" native-layer="below"></webkiln-texture>
```

## Screen and world anchors

Use `webkiln-anchor` when one view needs many labels or controls at different world or
screen positions. They share one off-screen browser page (the atlas).

```html
<webkiln-anchor source="settlement.rome" anchor="50% 100%" interactive>
  <button data-webkiln-anchor-hit>Rome</button>
</webkiln-anchor>
```

Create a second view for the atlas page and set it as the main view **Anchor Atlas View**.
**Set Anchor Placements** / **Set Anchor Placement** supply positions.
**Bind Anchor to Component** follows a scene component or socket each tick.

`anchor` is CSS-like pixel or percentage coordinates; default is the element centre.
**Layer** is draw order. **Hit Priority** breaks ties; if unset, the draw layer is used.

`data-webkiln-anchor-hit` on a descendant shrinks the clickable region; buttons are
already clickable. The same setup works with `data-webkiln-anchor="key"` on a normal element.

## Unreal localisation

Assign a String Table in `FWebkilnViewInitParams`, on `UWebkilnWidget`, or with
**Set Localisation String Table**. Asset-backed tables take part in Unreal localisation.
Entries follow the active culture.

```html
<webkiln-text key="Menu.Continue" fallback="Continue"></webkiln-text>
```

```javascript
const label = window.webkiln.localisation.text('Menu.Continue', undefined, 'Continue');
const unsubscribe = window.webkiln.localisation.subscribe(locale => render(locale));
```

`webkiln-text` updates when the culture changes. `webkiln:localisation-changed` is fired.
For native tables registered by a module, use **Set Localisation String Table Id**.

## Automatic DOM hit testing

Any element Chromium can hit blocks world input. `html` and `body` pass through. Mark an
empty layout surface with `data-webkiln-world-input` when a hit on that element should go
to the world:

```html
<div id="root" data-webkiln-world-input>
  <main class="fullscreen-layout" data-webkiln-world-input>
    <button>Open diplomacy</button>
  </main>
</div>
```

The marker applies only to that element. Use CSS `pointer-events: none` for decoration.

```javascript
window.webkiln.input.configure({
  cursorSelectors: {
    grab: '.pan-canvas',
    crosshair: '.selection-tool',
    blocked: '[aria-disabled="true"]',
  },
});
```

Call `window.webkiln.input.refresh()` after layout changes your code made.
See [Input](Input.md).

## Browser audio

Chromium audio is captured (on by default) into one Unreal audio component per view.
Routing fields are on `FWebkilnViewInitParams`.
