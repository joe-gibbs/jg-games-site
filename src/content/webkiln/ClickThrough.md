# Click-through

The HUD is a full-screen overlay, so the HTML is sitting on top of the whole game. A wrapper that fills the viewport - `#root`, a `.hud` stretched to the edges - will take every click, even on the "empty" bits. The player can't shoot or look around because the HUD ate it.

`html` and `body` already let those clicks through to the game. The wrappers you add do not. `data-webkiln-world-input` on a wrapper tells Webkiln to treat it as background: the click goes to the game. Real UI inside it still works. A button in that wrapper still gets the click.

```html
<div id="root" data-webkiln-world-input>
  <main class="hud" data-webkiln-world-input>
    <button>Open inventory</button>
  </main>
</div>
```

Here, empty HUD space is the game. Open inventory is the HUD.

For an image that should never be clicked, `pointer-events: none` in CSS is enough.

If you add or remove the attribute while the page is up, call `window.webkiln.input.refresh()` so Webkiln notices.

If the player starts a drag on HUD UI, that drag stays with the HUD until they let go - even if the cursor moves over the world.

On a [world-space widget](WorldSpace.md), Unreal hits the whole component first, and then these rules apply.

For a painted control where only the visible pixels should count, that's [Hit testing](HitTesting.md). Keyboard and gamepad are in [Input](Input.md).
