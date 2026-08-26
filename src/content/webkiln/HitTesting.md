# Hit testing

A lot of games use raster images for buttons and clickable elements - something that web technologies don't naturally support. To get around this, Webkiln adds some extra features.

`data-webkiln-hit="alpha"` tells Webkiln to look at the pixels of the control. Visible pixels are a hit while transparent pixels (0 alpha) go through to whatever is underneath, which might be more of the page or the [game](ClickThrough.md).

```html
<button data-webkiln-hit="alpha" style="background: transparent; border: 0; padding: 0">
  <img src="star.png" alt="">
  <span>OK</span>
</button>
```

The star is clickable, and so is the OK label, even if it sits over empty space - that text is still painted. Put the attribute on the control you're shaping.

This only sees HTML. A [`webkiln-texture`](Textures.md) in native mode is Unreal drawing on top of the page, so those pixels aren't there to test. If the texture needs to be part of the hit, put it in the page with `mode="dom"`.

