# HTML elements

These are the custom elements and helpers you can use in the page.

## Unreal textures

[`webkiln-texture`](Textures.md) puts a live Unreal texture in the page - assets, render targets, media textures. The FPS sample uses it for nearest-enemy scene captures.

```html
<webkiln-texture source="portrait.0" mode="native" alt=""></webkiln-texture>
```

Bind the source with **Set Webkiln Texture**. Native vs DOM, `native-layer`, and the FPS cards are on [Unreal textures](Textures.md).

## Screen and world anchors

Use `webkiln-anchor` when one view needs a bunch of labels or controls at different [world](WorldSpace.md) or screen positions. They all share one off-screen page (the atlas).

```html
<webkiln-anchor source="settlement.rome" anchor="50% 100%" interactive>
  <button data-webkiln-anchor-hit>Rome</button>
</webkiln-anchor>
```

[Create a second view](Views.md#create-a-view) for the atlas page and set it as the main view **Anchor Atlas View**. **Set Anchor Placements** / **Set Anchor Placement** supply positions. **Bind Anchor to Component** follows a scene component or socket each tick.

The graphs below create that atlas view and bind one element to a component.

```blueprint
set-atlas
bind-anchor
```

`anchor` is CSS-like - pixels or percentages - and defaults to the centre of the element. **Layer** is draw order. **Hit Priority** on a placement breaks ties; if you don't set it, the draw layer is used. **Bind Anchor to Component** does not have a Hit Priority pin.

`data-webkiln-anchor-hit` on a descendant shrinks the clickable region; buttons, links and inputs are already clickable. The same setup works with `data-webkiln-anchor="key"` on a normal element.

If your code changes atlas layout, call `window.webkiln.anchors.refresh()` or `window.webkiln.anchors.repack()`.

## Unreal localisation

Give the page a String Table in [`FWebkilnViewInitParams`](Views.md#init-params), on [`UWebkilnWidget`](HUD.md), or with **Set Localisation String Table** on the view or widget. Asset-backed tables go through Unreal localisation, so entries follow the active culture. The widget only takes an asset. Native tables registered by a module use **Set Localisation String Table Id** on the view.

```html
<webkiln-text key="Menu.Continue" fallback="Continue"></webkiln-text>
```

```javascript
const label = window.webkiln.localisation.text('Menu.Continue', undefined, 'Continue');
const unsubscribe = window.webkiln.localisation.subscribe(locale => render(locale));
```

`webkiln-text` updates when the culture changes. `webkiln:localisation-changed` is fired.

## Browser audio

Chromium audio is captured by default into one Unreal audio component per view. You set the routing on the view init params - see [Views](Views.md#init-params). After creation, **Set Browser Audio Volume** and **Set Browser Audio Muted** change the Unreal-side component.

Clicks versus the world are covered in [Click-through](ClickThrough.md).
