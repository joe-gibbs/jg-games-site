# API

[View lifecycle](Lifecycle.md) covers view ownership and loading. [JavaScript bridge](Bridge.md)
covers bridge requests, pushed events and serialisation. See
[C++ API](CppAPI.md) for the public native surface.

## View initialisation

`FWebkilnViewInitParams` controls the browser that **Create View** and **Create View Async** create.

| Field | Meaning |
|---|---|
| View Id | Unique name used to find and destroy the view. |
| Entry Point | URL that CEF loads. Use a trusted `gameui://` URL in normal cases. |
| Width, Height | Browser size in pixels. Zero uses the current player viewport dimension. |
| Render Scale | Multiplier for the backing render-target dimensions. |
| UI Scale Viewport Size | Viewport published to the Webkiln CSS scaling code. Zero uses the resolved browser size. |
| Transparent | Enables a transparent browser background. |
| Use Default Transparency | Uses the project setting instead of the value above. |
| Frame Rate | CEF windowless frame rate. Zero uses the project default. |
| Create Render Target | Creates the texture that Slate and UMG present. |
| Localisation String Table | String Table asset published to the page. |
| Localisation String Table Id | Identifier for a native String Table when no asset is assigned. |
| Route Browser Audio to Unreal | Captures Chromium audio into the Unreal mixer. |
| Browser Audio Volume | Initial volume multiplier on the Unreal side. |
| Browser Audio Is UI Sound | Applies Unreal UI-sound pause and mixing rules. |
| Browser Audio Sound Class | Optional Sound Class for captured browser audio. |
| Browser Audio Submix | Optional Sound Submix for captured browser audio. |

## Unreal textures in HTML

Trusted `gameui://` pages can place Unreal textures with the `webkiln-texture` custom element.
The element does not depend on a UI framework:

```html
<webkiln-texture
  source="portrait.face"
  alt="Character preview"
  style="width: 320px; height: 320px; object-fit: cover">
</webkiln-texture>
```

Bind the source name from Blueprint with **Set Webkiln Texture**. Call it on the
`UWebkilnView` or its `UWebkilnWidget`. The texture input accepts `UTexture`. This includes
texture assets, render targets, media textures and canvas render targets. Use **Clear
Webkiln Texture** when a runtime source is no longer available. `UWebkilnWidget` also
provides a **Texture Sources** map for fixed bindings that you set in the editor.

The element supports:

- inherited opacity and visibility
- rectangular ancestor clipping
- CSS stacking between Webkiln texture elements
- `object-fit` values `fill`, `contain`, `cover`, `none` and `scale-down`

Pointer input remains normal DOM input. Texture pixels stay on the Unreal rendering path.
Texture updates do not require browser bridge calls.

Webkiln texture elements are native surfaces. Webkiln composites them above the browser page.
Relative order follows numeric `z-index` and document order.

The element has two composition paths:

- `mode="native"` uses the named Unreal `source` binding. It does not copy pixels into
  Chromium. `native-layer="above"` is the default. `native-layer="below"` draws beneath
  the browser plane. Use the below layer with transparent atlas or overlay pages.
- `mode="dom"` renders the browser-readable `src` through a real shadow-DOM `<img>`.
  Transforms, masks, filters, border radii and DOM stacking then use the Chromium compositor.

`mode="auto"` selects native when `source` is present. Otherwise it selects DOM. A render target,
media texture or other live `UTexture` uses native mode. Packaged `gameui://` images can
use DOM mode when full CSS composition is more important than the native texture path.

```html
<webkiln-texture mode="dom" src="gameui://app/images/frame.png"></webkiln-texture>
<webkiln-texture mode="native" source="scene.preview" native-layer="below"></webkiln-texture>
```

## Screen and world anchors

Use `webkiln-anchor` when one Webkiln view must show many labels, indicators and small
controls at different positions. Webkiln draws them into one browser atlas. The host composites the
atlas cells in one Slate draw batch. Each anchor shares one Chromium view.

```html
<webkiln-anchor source="settlement.rome" anchor="50% 100%" interactive>
  <button data-webkiln-anchor-hit>Rome</button>
</webkiln-anchor>
```

Create a second view for the atlas page. Set it as the main view **Anchor Atlas View**.
Then supply `FWebkilnAnchorPlacement` values with **Set Anchor Placements** or **Set Anchor
Placement**. **Bind Anchor to Component** projects a scene component or socket each
engine tick. Placement does not wait for browser layout or bridge latency. The
widget also exposes **Anchor Atlas View** as an editor property.

`anchor` accepts CSS-like pixel or percentage coordinates. The default is the element centre.
Placement **Layer** controls draw order. **Hit Priority** can resolve overlapping interactive
anchors. When you do not set **Hit Priority**, Webkiln uses the draw layer.

The atlas layout becomes active only after Chromium paints the reported revision.
This prevents a new UV layout from pairing with an older atlas texture. Add
`data-webkiln-anchor-hit` to a descendant to define a smaller interactive region. Webkiln detects
interactive descendants such as buttons without extra markup. Slate maps pointer input at the native
anchor position back into the atlas DOM. This includes hover, capture, double-click and wheel.

You can keep existing DOM element types. Add
`data-webkiln-anchor="key"` and the optional attributes
`data-webkiln-anchor-point`,
`data-webkiln-anchor-raster-scale`, `data-webkiln-anchor-reserve-size`,
`data-webkiln-anchor-priority` and `data-webkiln-anchor-demand`. This is the same
runtime path that `webkiln-anchor` uses. It works with plain HTML or any JavaScript framework.

## Unreal localisation

Assign an Unreal String Table asset in `FWebkilnViewInitParams`, on `UWebkilnWidget`, or
with **Set Localisation String Table**. Asset-backed tables take part in the Unreal
localisation gather and package flow. Webkiln resolves each entry through `FText` for the
active culture. Webkiln publishes the catalogue again when the Unreal text revision changes.

Plain HTML can use the built-in element:

```html
<webkiln-text key="Menu.Continue" fallback="Continue"></webkiln-text>
```

JavaScript and any UI framework can use the same catalogue. A framework adapter is not required:

```javascript
const label = window.webkiln.localisation.text('Menu.Continue', undefined, 'Continue');
const unsubscribe = window.webkiln.localisation.subscribe(locale => render(locale));
```

`webkiln-text` updates when the culture changes. The API also sets the
document `lang` attribute and emits `webkiln:localisation-changed`. For native tables
that a module registers, **Set Localisation String Table Id** selects the existing table.

## Automatic DOM hit testing

Webkiln derives world-input blocking and the Slate cursor from the Chromium pointer
target. Each element that Chromium can hit blocks world input. The document `html` and `body`
surfaces pass through. Mark an empty layout surface with `data-webkiln-world-input` when a hit
on that element must go to the native world:

```html
<div id="root" data-webkiln-world-input>
  <main class="fullscreen-layout" data-webkiln-world-input>
    <button>Open diplomacy</button>
  </main>
</div>
```

The marker affects only the element that carries it. Descendant panels, buttons, inputs and other
ordinary HTML remain hit-testable. They block world input without registration. Use CSS
`pointer-events: none` for visual elements that Chromium must skip.
You can configure cursor selectors when the project needs game-specific cursor kinds:

```javascript
window.webkiln.input.configure({
  cursorSelectors: {
    grab: '.pan-canvas',
    crosshair: '.selection-tool',
    blocked: '[aria-disabled="true"]',
  },
});
```

Pointer capture keeps the browser as input owner until release. `On Input State Changed`
exposes the cached state to Blueprint. `BlocksWorldInput` and Slate input handling
use that state. Webkiln refreshes the target after DOM, scroll and viewport changes.
Call `window.webkiln.input.refresh()` after layout changes that the application controls.
For more pointer behaviour, see [Input](Input.md).

## Browser audio

Webkiln captures browser audio after Chromium mixes HTML media and Web Audio nodes. Webkiln
interleaves the captured float channels into procedural PCM. Webkiln plays one Unreal audio
component per view. Configure routing in `FWebkilnViewInitParams`:

- **Route Browser Audio to Unreal** enables capture. It is on by default.
- **Browser Audio Sound Class** controls class volume, mix and pause behaviour.
- **Browser Audio Submix** selects the Unreal effects and routing graph.
- **Browser Audio Is UI Sound** controls whether the component follows UI-sound pause rules.
- **Browser Audio Volume** sets the initial component multiplier.

You can call **Set Browser Audio Volume** and **Set Browser Audio Muted** at runtime from
Blueprint. Chromium decodes media, keeps media in sync and mixes Web Audio.
Unreal owns the final device path.
