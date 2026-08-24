# Hit testing

This is for painted controls - a star, a round button - where you only want clicks on the bits you can actually see.

`data-webkiln-hit="alpha"` tells Webkiln to look at the pixels of the control. Visible pixels are a hit. Transparent pixels go through to whatever is underneath, which might be more of the page or the [game](ClickThrough.md).

```html
<button data-webkiln-hit="alpha" style="background: transparent; border: 0; padding: 0">
  <img src="star.png" alt="">
  <span>OK</span>
</button>
```

The star is clickable, and so is the OK label, even if it sits over empty space - that text is still painted. Put the attribute on the control you're shaping.

This only sees HTML. A [`webkiln-texture`](Textures.md) in native mode is Unreal drawing on top of the page, so those pixels aren't there to test. If the texture needs to be part of the hit, put it in the page with `mode="dom"`.

Full-screen wrappers are [Click-through](ClickThrough.md). Keyboard and gamepad are in [Input](Input.md).
