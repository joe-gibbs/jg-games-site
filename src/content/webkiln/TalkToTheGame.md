# Talk to the game

`window.gameUI` - or `gameUI` for short - is how the page talks to Unreal.

## 1. Add a button

Take the HTML from [Getting started](QuickStart.md) and add a button that calls `gameUI.request('click')`:

```diff
   <body>
     <div class="hud">Hello from Webkiln</div>
+    <button onclick="gameUI.request('click')">
+      Click me!
+    </button>
     <script>
       window.addEventListener('webkiln:runtime-ready', () => {
         window.gameUI.markReady();
       });
     </script>
   </body>
```

Save, then restart Play so `gameui://` picks up the file.

## 2. Create the action class

Create a Blueprint subclass of **Webkiln Bridge Action**. `WA_ButtonClicked` is the name used below.

Open **Class Defaults** and set **Action Name** to `click` - that's the string JavaScript requested.

Implement **Execute**. Print "Clicked", then **Succeed** the request so the JavaScript promise resolves.

```blueprint
button-clicked
```

![Blueprint subclass of Webkiln Bridge Action, Action Name click](/webkiln/docs/talk-bridge-action.png)

`Execute` gives you **Request** and **Payload**. Finish with **Succeed** or **Succeed Object**, or **Fail** if it didn't work.

To handle actions without a class per name, bind **On Bridge Request** on the subsystem instead. That's in [JavaScript bridge](Bridge.md#catch-all-requests).

## 3. Register it in project settings

Add the class under **Project Settings > Plugins > Webkiln > Bridge Actions**. That list is in [Project settings](Settings.md#bridge). Changes apply on the next game instance.

![Webkiln project settings with WA_ButtonClicked in Bridge Actions](/webkiln/docs/talk-bridge-settings.png)

## 4. Open the game and test

Hit Play and click the button. **Print String** should write "Clicked" on screen.

![Click me button printing Clicked over the game](/webkiln/docs/talk-click-play.jpg)

## 5. Open DevTools

After Play, open the Unreal console (`~`) and run:

```text
Webkiln.OpenDevTools
```

That opens a **Webkiln Inspector** window. Open **Network**, filter to **Fetch/XHR**, and click the button again. You should see `click` as a POST to `gameui://app/__webkiln/bridge/click`.

![Webkiln Inspector Network tab showing click bridge requests](/webkiln/docs/talk-devtools.png)

There's more on the inspector in [Diagnostics](Diagnostics.md#devtools).

## 6. Listen for an event

Unreal can push the other way with `gameUI.on`. Add a listener so the button turns red when the game sends `z-pressed`:

```diff
     <script>
       window.addEventListener('webkiln:runtime-ready', () => {
         gameUI.markReady();
       });
+
+      gameUI.on('z-pressed', () => {
+        document.querySelector("button").style.color = "red";
+      })
     </script>
```

Save, then restart Play so `gameui://` picks up the file.

## 7. Dispatch from the player controller

On `BP_Player`, promote the **Create View** return to a variable named `WebkilnView` if you haven't already. Then add this graph: **Z** pressed calls **Dispatch Json Event** with name `z-pressed`.

```blueprint
z-pressed
```

## 8. Play and press Z

Hit Play and press **Z**. The button text should turn red.

![Click me button turned red after pressing Z](/webkiln/docs/talk-z-play.jpg)

If you leave the payload off, it's sent as JSON `null`. If Unreal fails the request, the rejection has `error.code` - the list is in [JavaScript bridge](Bridge.md#requests-from-javascript).

You can pass a payload object as the second argument to `request`, and read it from **Payload** on Execute:

```javascript
window.addEventListener('webkiln:runtime-ready', async () => {
  await gameUI.markReady();
  const result = await gameUI.request('inventory.inspect', {
    itemId: 42,
    includeHistory: false,
  });
});
```

## When is the page ready?

You probably don't want to show the UI immediately unless it's very simple - there are probably things you want to set up, assets you want to load and so on - otherwise you'll see a lot of layout shifts. To solve this issue Webkiln has `markReady()` to indicate that the UI is ready to show.

| Step | Page | Unreal |
|---|---|---|
| Webkiln has installed `gameUI` | `webkiln:runtime-ready` | **On Document Ready** |
| Your UI is ready to talk | `gameUI.markReady()` | **On Ready** |

After the first step you can use `gameUI.request`.

Call `markReady` when the UI is on screen and listening for events. Unreal then fires **On Ready**, delivers the held events, and fades the cover.

## Return an Unreal object

To help pass data around Webkiln provides some helpers.

**Stringify Unreal Object** turns an arbitrary object into JSON - send this to Succeed.

```blueprint
stringify-succeed
```

```cpp
UPROPERTY(BlueprintReadWrite)
FString DisplayName = TEXT("Marcus");

UPROPERTY(BlueprintReadWrite)
int32 Health = 84;
```

Becomes:

```json
{"displayName":"Marcus","health":84}
```

You can also send a struct, or a string represnetation of JSON.

```blueprint
dispatch-struct
```
