# JavaScript bridge

`window.gameUI` is available only on pages loaded from a registered `gameui://` mount.
The global `gameUI` name is the same object.

```typescript
interface WebkilnBridgeApi {
  request(action: string, payload?: unknown): Promise<unknown>;
  on(name: string, callback: (...args: unknown[]) => void): () => void;
}
```

## Requests from JavaScript

```javascript
const result = await gameUI.request('inventory.inspect', {
  itemId: 42,
  includeHistory: false,
});
```

An omitted payload is sent as JSON `null`. Requests can complete in any order.
If the native side returned a fixed error code, it is on `error.code`.

| Error code | Cause |
|---|---|
| `unknown_action` | The action is unregistered. |
| `handler_failure` | A native handler reported a generic failure. |
| `malformed_request` | Invalid request or required fields. |
| `malformed_customer_output` | A Blueprint action passed invalid JSON to **Succeed**. |
| `view_closed` | The view or its game instance closed before completion. |
| `view_reloaded` | Navigation replaced the document before completion. |

## Blueprint actions

Create a Blueprint subclass of `Webkiln Bridge Action`. Set **Action Name**, for example
`inventory.inspect`. Add the class under **Project Settings > Plugins > Webkiln > Bridge
Actions**. Implement **Execute**.

`Execute` receives:

| Value | Contents |
|---|---|
| Request | Request ID, action, original payload JSON, originating view and completion functions. |
| Payload | Object-field access for a JSON object payload. |

If JavaScript sent an array, scalar or null, **Payload Json** still has that value and
**Payload** is an empty object.

| Node | Behaviour |
|---|---|
| Has Field | True even when the field's value is null. |
| Get String, Get Number, Get Boolean | Reads the field only when its JSON type matches. The Boolean return is whether the read succeeded. |
| Set String, Set Number, Set Boolean, Set Null | Adds or replaces one field. |
| To Json | The complete object as a JSON string. |
| Succeed | Parses the supplied string as JSON and resolves the promise. Invalid JSON produces `malformed_customer_output`. |
| Create Result Object | An empty Webkiln JSON object. |
| Succeed Object | Resolves with a Webkiln JSON object. A null input resolves as JSON null. |
| Fail | Error code and message. |

Only the first completion counts. A registered action runs before
the C++ handler and the subsystem fallback **On Bridge Request** delegate.

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
into **Succeed**.

## Generated TypeScript

Set **Request Struct** and **Response Struct** on each Blueprint action. Add pushed event
names and optional payload structs under **Bridge Events**. Then call **Export Bridge
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

Typed `request` and `on` overloads are included for `window.gameUI`. Duplicate or empty
event names make export fail.

## C++ handlers

Bind `FWebkilnBridgeRequestHandler` with `UWebkilnSubsystem::SetBridgeRequestHandler`.
Return `FWebkilnBridgeResponse::Success`, `SuccessRawJson` or `Failure`. Blueprint actions
run first.

Use `DispatchEngineEventToView` for one named view, `BroadcastEngineEvent` for every view.
The C++ event API can pass multiple arguments to `gameUI.on`.
`FWebkilnEngineEventValue` supports strings, numbers, Booleans, vectors, rotators,
transforms, string arrays, JSON values and null.
