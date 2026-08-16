# C++ API

Projects that use Webkiln link the `Webkiln` module. CEF headers and CEF-owned types are not
part of the public API.

## Runtime ownership

`UWebkilnSubsystem` is a `UGameInstanceSubsystem`. Obtain it from the game instance:

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();
```

Its main public operations are:

| Operation | Use |
|---|---|
| `CreateView`, `CreateViewAsync` | Create a view and start asynchronous page loading. |
| `FindView`, `HasView` | Resolve a view by its unique ID in the game instance. |
| `DestroyView` | Close and remove a view. |
| `SetBridgeRequestHandler` | Bind the C++ JavaScript-request handler. |
| `DispatchEngineEventToView` | Push an event to one named view. |
| `BroadcastEngineEvent` | Push an event to each owned view. |
| `RegisterResourceMount`, `UnregisterResourceMount` | Manage runtime `gameui://` hosts. Webkiln does not package dynamic mounts. |
| `ExportBridgeTypeScript` | Generate declarations from registered Blueprint action and event schemas. |
| `GetStatsSnapshot`, `ExportRuntimeDiagnosticsJson` | Read runtime and performance state. |

## Views

`UWebkilnView` owns one CEF browser, its Unreal texture and its captured audio component.
Use its lifecycle getters for ID, URL, status, error, browser size, render-target size and
render scale. `GetTexture()` returns the `UTexture2D` that UMG and Slate present.

The public view operations cover resize, reload, close, focus, event dispatch, native
texture sources, anchors, localisation, audio, DevTools and DOM testing. Blueprint-visible
operations have the same names and tooltips as their C++ methods.

Bind the native delegates or the related Blueprint delegates for ready, load failure,
close, console message, DOM input-state change and test result.

## UMG

`UWebkilnWidget::SetView()` attaches a view to UMG. The widget does not own or close the
view. It can hold fixed native texture sources, an anchor-atlas view and a localisation
String Table. It applies them when its assigned view changes.

The underlying `SWebkilnWidget` is public for direct Slate use. Its arguments control the
view, DOM input-blocking behaviour, render-scale matching and native pointer interception.

## Bridge values

`FWebkilnBridgeRequest` contains request ID, action and `FWebkilnBridgeValue` payload.
`FWebkilnBridgeResponse` represents success or a coded failure.

`FWebkilnEngineEventValue` is the C++ pushed-event value. Factory functions cover:

```text
Boolean, Number, String, IntArray, FloatArray, StringArray, Json, Null
```

JSON request and response conversion uses Unreal `FJsonObjectConverter`. Blueprint
bridge classes are described in [JavaScript bridge](Bridge.md).

## Resource mounts

`RegisterResourceMount(Host, RootPath, OutError)` requires an existing directory and a
valid host. Relative roots are resolved from the project directory. The mount applies to
the current process. Add the same root to **Trusted Local Mounts** when it must be staged
into pak or IoStore output.

`ResolveRegisteredLocalResourcePath` and `UWebkilnView::ResolveRuntimeResourcePath` are
available to native integrations that need the same canonical mount resolution that
the CEF scheme handler uses.

## Diagnostics and traces

`FWebkilnRuntimeStatsSnapshot` contains aggregate and per-view values.
`FWebkilnFrameTraceSample` adds a sequence number that always increases. Use this for tools that read samples in order.
Use `GetFrameTraceSamplesSince`, `GetLatestFrameTraceSequence`,
`SerialiseFrameTraceSampleJson` and `ClearFrameTrace` for capture tooling. Field definitions
are in [Diagnostics](Diagnostics.md).

## Public headers

| Header | Types |
|---|---|
| `Runtime/WebkilnSubsystem.h` | Game-instance ownership, bridge dispatch, mounts and diagnostics. |
| `Runtime/WebkilnBridgeAction.h` | Blueprint bridge action and JSON object. |
| `Runtime/WebkilnBridgeRequest.h` | Asynchronous Blueprint request completion. |
| `Runtime/WebkilnJsonLibrary.h` | UObject JSON serialisation for any reflected object. |
| `Runtime/BridgeValue.h` | Native requests, responses and JSON bridge values. |
| `Runtime/RuntimeTypes.h` | Values used by native pushed events. |
| `View/WebkilnView.h` | Browser view. |
| `View/ViewTypes.h` | Initialisation, status and snapshot types. |
| `View/FrameStats.h` | Performance counters and frame traces. |
| `View/WebkilnAnchorTypes.h` | Screen and world anchor placement. |
| `Widgets/WebkilnWidget.h` | UMG host. |
| `Widgets/SlateHostWidget.h` | Slate host. |
| `Settings/WebkilnSettings.h` | Project settings and configured schema types. |
