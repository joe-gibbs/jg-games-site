# JavaScript bridge

There's a walkthrough in [Talk to the game](TalkToTheGame.md).

On a `gameui://` page you get `window.gameUI`. `gameUI` is the same object.

```typescript
interface WebkilnBridgeApi {
  request(action: string, payload?: unknown): Promise<unknown>;
  on(name: string, callback: (...args: unknown[]) => void): () => void;
  markReady(): Promise<void>;
}
```

Wait for `webkiln:runtime-ready`, then call `markReady()`. That's when **On Ready** fires. Unreal holds pushed events until then. After a [reload](Views.md#status-and-delegates), call it again.

## Requests from JavaScript

```javascript
const result = await gameUI.request('inventory.inspect', {
  itemId: 42,
  includeHistory: false,
});
```

If you leave the payload off, it's sent as JSON `null`. Requests can finish in any order.
If the native side returned a fixed error code, it's on `error.code`.

| Error code | Cause |
|---|---|
| `unknown_action` | The action is unregistered. |
| `handler_failure` | A native handler reported a generic failure. |
| `malformed_request` | Invalid request or required fields. |
| `malformed_customer_output` | A Blueprint action passed invalid JSON to **Succeed**. |
| `view_closed` | The [view](Views.md#close-a-view) or its game instance closed before completion. |
| `view_reloaded` | Navigation replaced the document before completion. |
| `load_failed` | The [view](Views.md) failed while the request was still in flight. |

## Blueprint actions

A Blueprint subclass of `Webkiln Bridge Action`, listed under **[Bridge Actions](Settings.md#bridge)**, handles
`gameUI.request` for its **Action Name**. You implement **Execute**.

`Execute` gets:

| Value | Contents |
|---|---|
| Request | Request ID, action, original payload JSON, originating view and completion functions. |
| Payload | Object-field access for a JSON object payload. |

If JavaScript sent an array, a scalar or null, **Payload Json** still has that value and
**Payload** is an empty object.

| Node | Behaviour |
|---|---|
| Has Field | True even when the field's value is null. |
| Get String, Get Number, Get Boolean | Reads the field only when its JSON type matches. The Boolean return is whether the read succeeded. |
| Set String, Set Number, Set Boolean, Set Null | Adds or replaces one field. |
| To Json | The complete object as a JSON string. |
| Succeed | Parses the supplied string as JSON and resolves the promise. Invalid JSON produces `malformed_customer_output`. |
| Create Result Object | An empty Webkiln JSON object owned by this request. The subsystem also has **Create Webkiln JSON Object**. |
| Succeed Object | Resolves with a Webkiln JSON object. A null input resolves as JSON null. |
| Fail | Error code and message. |

Only the first completion counts. A Blueprint action runs before
the C++ handler and the subsystem's **On Bridge Request** delegate.

## Pushed events from Unreal

```javascript
const unsubscribe = gameUI.on('player.updated', player => {
  health.textContent = String(player.health);
});

unsubscribe();
```

| Node | Payload |
|---|---|
| Dispatch Webkiln Event (Struct) | Any Blueprint struct, converted through Unreal's JSON converter. |
| Dispatch Webkiln Event (Unreal Object) | The reflected properties of any UObject. |
| Dispatch Webkiln Event (JSON Object) | A Webkiln JSON object that you populate. |
| Dispatch Webkiln Event (JSON String) | Any JSON value that is already encoded. |

The graphs below dispatch an Unreal object and a struct.

```blueprint
dispatch-object
dispatch-struct
```

## Unreal object serialisation

**Stringify Unreal Object** returns the JSON string.
**Dispatch Webkiln Event (Unreal Object)** does the same conversion and sends it.

```cpp
UPROPERTY(BlueprintReadWrite)
FString DisplayName = TEXT("Marcus");

UPROPERTY(BlueprintReadWrite)
int32 Health = 84;
```

```json
{"displayName":"Marcus","health":84}
```

Unreal's JSON field names lowercase the first character of the property name.
Owned instanced subobjects are inlined; other UObject pointers become Unreal reference strings.

To return an existing UObject from a bridge request, feed **Stringify Unreal Object**
into **Succeed**. The graph below does this.

```blueprint
stringify-succeed
```

## Generated TypeScript

Set **Request Struct** and **Response Struct** on each Blueprint action. Add pushed event
names and optional payload structs under **[Bridge Events](Settings.md#bridge)**, then call **Export Bridge
TypeScript** on the game-instance subsystem.

```typescript
interface WebkilnBridgeActionMap {
  'inventory.inspect': {
    request: InventoryInspectRequest;
    response: InventoryInspectResponse;
  };
}

interface WebkilnBridgeEventMap {
  'player.updated': PlayerUpdatedEvent;
}
```

You get typed `request`, `on` and `markReady` on `window.gameUI`. Duplicate or empty
event names make the export fail. The export does not declare `window.webkiln`.

## C++ handlers

Bind `FWebkilnBridgeRequestHandler` with `UWebkilnSubsystem::SetBridgeRequestHandler`.
Return `FWebkilnBridgeResponse::Success`, `SuccessRawJson` or `Failure`. Blueprint actions
run first. The subsystem calls are in [C++ API](CppAPI.md).

Use `DispatchEngineEventToView` for one named view, `BroadcastEngineEvent` for every view.
The C++ event API can pass multiple arguments to `gameUI.on`.
`FWebkilnEngineEventValue` supports strings, numbers, Booleans, int arrays, float
arrays, string arrays, JSON values and null.
