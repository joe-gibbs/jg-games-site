# Unreal textures

`webkiln-texture` puts an Unreal texture in the HTML page. Assets, render targets, media textures and canvas render targets all work, and are drawn using Slate.

The FPS sample uses this for the two nearest-enemy cards. Each card is a scene capture on the NPC - see left in the below image.

![FPS HUD with two live enemy scene captures in HTML cards, including the world behind them](/webkiln/docs/textures-fps-demo.png)

## Put a texture in the page

```html
<webkiln-texture
  source="portrait.0"
  mode="native"
  alt=""
  style="width: 72px; height: 72px; object-fit: cover">
</webkiln-texture>
```

`source` is a name you bind from Unreal.

## Bind it from Unreal

On the [view](Views.md) or the [widget](HUD.md), **Set Webkiln Texture** takes that source name and a `UTexture`. **Clear Webkiln Texture** drops one binding while **Clear All Webkiln Textures** drops every binding this widget applied.

The widget also has a **Texture Sources** map you can fill in the editor.

```cpp
HudView->SetTextureSource(FName(TEXT("portrait.0")), SceneCapture->TextureTarget);
```

The same node exists in Blueprint. Switching views clears those bindings - see [Views](Views.md#attach-the-view).

## Native or DOM

- `mode="native"` (default when `source` is set) draws the Unreal texture on top of the page. Opacity, clipping, stacking and `object-fit` work. `native-layer="below"` draws it underneath - use that with transparent overlay pages.
- `mode="dom"` shows `src` as a real `<img>`, so CSS transforms, masks, filters and border radii go through Chromium.
- `mode="auto"` picks native when `source` is set, otherwise DOM.

```html
<webkiln-texture mode="dom" src="gameui://app/images/frame.png"></webkiln-texture>
<webkiln-texture mode="native" source="scene.preview" native-layer="below"></webkiln-texture>
```

Pointer input on a native texture is ordinary [DOM input](Input.md). 

Native composition is tied to the view that owns the element. Do not put `webkiln-texture` in an [anchor atlas](WorldSpace.md#pin-html-to-an-actor) page if you want live Unreal pixels - the atlas paint will not include them.

## FPS sample

The shooter map binds two sources on the HUD view:

| Source | Contents |
|---|---|
| `portrait.0` | Scene capture of the nearest living NPC |
| `portrait.1` | Scene capture of the second-nearest living NPC |

Unreal sends occupancy and health with a `fps.portraits` event.

```html
<article class="portrait" data-slot="0" hidden>
  <webkiln-texture source="portrait.0" mode="native" alt=""></webkiln-texture>
  <div class="portrait-meta">
    <output>0</output>
    <div class="track"><i></i></div>
  </div>
</article>
```

```javascript
window.gameUI.on('fps.portraits', payload => {
  // payload.slots[i].occupied, payload.slots[i].health
});
```