# JavaScript bridge

Webkiln installs `window.gameUI` only in pages that load from a registered `gameui://` mount.
The global `gameUI` name refers to the same object.

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

Webkiln converts the action name to a string. If you omit the payload, Webkiln sends JSON `null`.
Webkiln accepts objects, arrays, strings, numbers, Booleans and null. Values must be accepted
by `JSON.stringify`. A circular JavaScript object rejects the promise before Webkiln sends a request.

Webkiln assigns a request ID. Requests can complete in any order. A failed response
rejects with an `Error`. When the native response supplies a fixed error code, that code is
available as `error.code`.

| Error code | Cause |
|---|---|
| `unknown_action` | No registered Blueprint action, C++ handler or fallback Blueprint handler accepted the action. |
| `handler_failure` | A native handler reported a failure without a more specific code. |
| `malformed_request` | The native bridge could not parse the request envelope or the required fields. |
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

If JavaScript supplied an array, scalar or null, **Payload Json** keeps that value and
**Payload** is an empty object. Object payloads expose these nodes:

| Node | Behaviour |
|---|---|
| Has Field | Tests whether a named field exists, including a field that contains null. |
| Get String, Get Number, Get Boolean | Reads the field only when its JSON type matches. The return value reports success. |
| Set String, Set Number, Set Boolean, Set Null | Adds or replaces one field. |
| To Json | Serialises the complete object. |

Complete a request one time:

| Node | Result |
|---|---|
| Succeed | Parses the supplied string as any JSON value and resolves the JavaScript promise. Invalid JSON produces `malformed_customer_output`. |
| Create Result Object | Creates an empty Webkiln JSON object that the request owns. |
| Succeed Object | Resolves with a Webkiln JSON object. A null input resolves with JSON null. |
| Fail | Rejects the promise with the supplied error code and message. |

Webkiln ignores calls after the first completion. A registered action runs before
the C++ handler and the subsystem fallback **On Bridge Request** delegate.

## Pushed events from Unreal

JavaScript subscribes with `gameUI.on`. The returned function removes the subscription.

```javascript
const unsubscribe = gameUI.on('player.updated', player => {
  health.textContent = String(player.health);
});

unsubscribe();
```

Blueprint has four dispatch forms:

| Node | Payload |
|---|---|
| Dispatch Webkiln Event (Struct) | Any Blueprint struct, converted through the Unreal JSON converter. |
| Dispatch Webkiln Event (Unreal Object) | The reflected properties of any UObject. |
| Dispatch Webkiln Event (JSON Object) | A Webkiln JSON object that you populate. |
| Dispatch Webkiln Event (JSON String) | Any JSON value that is already encoded. |

The typed event schema uses one payload argument. The lower-level C++ event API can send
multiple arguments. `gameUI.on` passes those arguments to the callback as separate arguments.

## Unreal object serialisation

**Stringify Unreal Object** returns a short JSON object string. It does not send an
event. **Dispatch Webkiln Event (Unreal Object)** does the same conversion and sends the
result directly.

```cpp
FString Error;
if (!View->DispatchUnrealObjectEvent(TEXT("player.updated"), Player, Error))
{
    UE_LOG(LogTemp, Error, TEXT("%s"), *Error);
}
```

If the supplied object has these reflected properties:

```cpp
UPROPERTY(BlueprintReadWrite)
FString DisplayName = TEXT("Marcus");

UPROPERTY(BlueprintReadWrite)
int32 Health = 84;
```

JavaScript receives:

```json
{"displayName":"Marcus","health":84}
```

The conversion includes reflected properties. It skips transient and deprecated fields.
Webkiln converts structs and containers by value. Webkiln expands an owned instanced subobject by
value. Other UObject references become Unreal reference strings. A repeated object
becomes a reference. Webkiln does not convert that object again.

Unreal JSON field-name conversion lowercases the first character of the property name. Functions
and unreflected C++ members are not included. Property types without a structured JSON form
use the Unreal exported text representation.

Blueprint can put **Stringify Unreal Object** into **Succeed** when a bridge request must
return an existing UObject.

## Generated TypeScript

Set **Request Struct** and **Response Struct** on each Blueprint action. Add pushed event
names and optional payload structs under **Bridge Events**. Then call **Export Bridge
TypeScript** on the game-instance subsystem.

The generated declaration contains:

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

The declaration also includes typed `request` and `on` overloads for `window.gameUI` and the global
`gameUI` variable. Webkiln emits referenced Blueprint structs recursively. Duplicate or empty
configured event names make export fail with an error. Export does not produce ambiguous types.

## C++ handlers

Bind `FWebkilnBridgeRequestHandler` with `UWebkilnSubsystem::SetBridgeRequestHandler`.
Return `FWebkilnBridgeResponse::Success`, `SuccessRawJson` or `Failure`. Blueprint actions
remain first in the dispatch order.

Use `DispatchEngineEventToView` for one named view. Use `BroadcastEngineEvent` for each view
that the game instance owns. `FWebkilnEngineEventValue` supports strings, numbers, Booleans,
vectors, rotators, transforms, bounded string arrays, JSON values and null.
