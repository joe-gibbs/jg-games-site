# Talk to the game

`window.gameUI` - also just `gameUI` - is how the page talks to Unreal.

```typescript
interface WebkilnBridgeApi {
  request(action: string, payload?: unknown): Promise<unknown>;
  on(name: string, callback: (...args: unknown[]) => void): () => void;
  markReady(): Promise<void>;
}
```

[Create the view](Views.md#create-a-view). From the page, wait for `webkiln:runtime-ready`, then you can `request` and you should call `gameUI.markReady()`. Until then Unreal holds events, and an opaque widget stays black. From Unreal, wait for **On Ready** before you rely on the page having received those events.

Error codes, the node list, TypeScript export and C++ handlers are in [JavaScript bridge](Bridge.md).

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

![Sample page calling Unreal through the bridge](/webkiln/docs/talk-bridge-ui.png)

## Handle the call in Blueprint

1. Create a Blueprint subclass of **Webkiln Bridge Action**.
2. Set **Action Name** to the string JavaScript will request, for example `inventory.inspect`.
3. Add the class under **Project Settings > Plugins > Webkiln > Bridge Actions**. That list is in [Project settings](Settings.md#bridge).
4. Implement **Execute**. Finish with **Succeed** or **Succeed Object**, or **Fail** if it didn't work.

![Blueprint subclass of Webkiln Bridge Action, with Class Defaults open](/webkiln/docs/talk-bridge-action.png)

`Execute` gives you **Request** and **Payload**. **Payload** is the fields if JavaScript sent a JSON object - otherwise look at **Payload Json**.

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
