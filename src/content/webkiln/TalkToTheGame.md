# Talk to the game

`window.gameUI` - or `gameUI` for short - is how the page talks to Unreal.

```typescript
interface WebkilnBridgeApi {
  request(action: string, payload?: unknown): Promise<unknown>;
  on(name: string, callback: (...args: unknown[]) => void): () => void;
  markReady(): Promise<void>;
}
```

[Create the view](Views.md#create-a-view) first. Error codes, the node list, TypeScript export and C++ handlers are in [JavaScript bridge](Bridge.md).

## When is the page ready?

The HTML finishing is not the same as the UI being ready to live in the game. There are two steps, named from each side:

| Step | Page | Unreal |
|---|---|---|
| Webkiln has installed `gameUI` | `webkiln:runtime-ready` | **On Document Ready** |
| Your UI is ready to talk | `gameUI.markReady()` | **On Ready** |

After the first step you can `gameUI.request`. Events Unreal sends the other way are held, and an opaque widget stays black.

Call `markReady` when the UI is on screen and listening for events. Unreal then fires **On Ready**, delivers the held events, and fades the cover.

A plain HTML page can call `markReady` as soon as it gets `webkiln:runtime-ready` - that's the snippet in [Getting started](QuickStart.md). A React or Vue app should wait until it has rendered and subscribed. After a [reload](Views.md#status-and-delegates), call `markReady` again.

Remote pages - anything that isn't `gameui://` - skip the second step. Unreal treats them as ready once the document has loaded.

Bind **On Ready** when you start pushing HUD state. **On Document Ready** is for knowing the page loaded even if it never called `markReady`.

## Call Unreal from JavaScript

```javascript
window.addEventListener('webkiln:runtime-ready', async () => {
  await gameUI.markReady();
  const result = await gameUI.request('inventory.inspect', {
    itemId: 42,
    includeHistory: false,
  });
});
```

If you leave the payload off, it's sent as JSON `null`. If Unreal fails the request, the rejection has `error.code` - the list is in [JavaScript bridge](Bridge.md#requests-from-javascript).

## Handle the call in Blueprint

1. Create a Blueprint subclass of **Webkiln Bridge Action**.
2. Set **Action Name** to the string JavaScript will request, for example `inventory.inspect`.
3. Add the class under **Project Settings > Plugins > Webkiln > Bridge Actions**. That list is in [Project settings](Settings.md#bridge).
4. Implement **Execute**. Finish with **Succeed** or **Succeed Object**, or **Fail** if it didn't work.

![Blueprint subclass of Webkiln Bridge Action, with Class Defaults open](/webkiln/docs/talk-bridge-action.png)

`Execute` gives you **Request** and **Payload**. **Payload** is the fields if JavaScript sent a JSON object - otherwise look at **Payload Json**.

To handle actions without a class per name, bind **On Bridge Request** on the subsystem instead. That's in [JavaScript bridge](Bridge.md#catch-all-requests).

## Return an Unreal object

**Stringify Unreal Object** turns an object into JSON. Feed that into **Succeed**. The graph below does this.

```blueprint
stringify-succeed
```

```cpp
UPROPERTY(BlueprintReadWrite)
FString DisplayName = TEXT("Marcus");

UPROPERTY(BlueprintReadWrite)
int32 Health = 84;
```

```json
{"displayName":"Marcus","health":84}
```

## Events from Unreal

```javascript
const unsubscribe = gameUI.on('player.updated', player => {
  health.textContent = String(player.health);
});

unsubscribe();
```

From Blueprint, use **Dispatch Webkiln Event** - there's a variant for a struct, an Unreal object, a JSON object, or a JSON string. The graphs below dispatch an Unreal object and a struct.

```blueprint
dispatch-object
dispatch-struct
```
