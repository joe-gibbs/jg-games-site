# Localisation

Give the page a String Table so labels follow Unreal's active culture.

## Give the page a table

Set **Localisation String Table** on [`FWebkilnViewInitParams`](Views.md#init-params), on [`UWebkilnWidget`](HUD.md), or with **Set Localisation String Table** on the view or widget after creation.

Asset-backed tables go through Unreal localisation, so entries follow the culture. The widget only takes an asset. Native tables registered by a module use **Set Localisation String Table Id** on the view.

Switching [views](Views.md#attach-the-view) applies the widget's table to the new view. **Reload** sends it again once the new document is ready.

## In the page

```html
<webkiln-text key="Menu.Continue" fallback="Continue"></webkiln-text>
```

```javascript
const label = window.webkiln.localisation.text('Menu.Continue', undefined, 'Continue');
const unsubscribe = window.webkiln.localisation.subscribe(locale => render(locale));
```

`webkiln-text` updates when the culture changes. `webkiln:localisation-changed` is fired on the page.
