# C++ API

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();
```

| Operation | Use |
|---|---|
| `CreateView`, `CreateViewAsync` | Create a view and start page loading. |
| `FindView`, `HasView` | Look up a view by ID. |
| `DestroyView` | Close a view. |
| `SetBridgeRequestHandler` | C++ JavaScript-request handler. |
| `DispatchEngineEventToView` | Event to one named view. |
| `BroadcastEngineEvent` | Event to every owned view. |
| `RegisterResourceMount`, `UnregisterResourceMount` | Runtime `gameui://` hosts. Add them to **Trusted Local Mounts** for packaging. |
| `ExportBridgeTypeScript` | Declarations from Blueprint action and event schemas. |
| `GetStatsSnapshot`, `ExportRuntimeDiagnosticsJson` | Runtime and performance state. |
| `IsWatermarked` | True in watermarked evaluation builds. |

`UWebkilnView` owns the browser, texture and captured audio. `GetTexture()` is what
UMG and Slate present.

`UWebkilnWidget::SetView()` attaches a view. The subsystem owns the view.
The widget can hold texture sources, an anchor-atlas view and a localisation String Table.
`SWebkilnWidget` is public for Slate.

`RegisterResourceMount` needs an existing directory and a valid host. Relative roots are
from the project directory. Add the same root to **Trusted Local Mounts** to package it.

JSON conversion uses `FJsonObjectConverter`. Blueprint bridge classes are in
[JavaScript bridge](Bridge.md). Counters are in [Diagnostics](Diagnostics.md).

| Header | |
|---|---|
| `Runtime/WebkilnSubsystem.h` | Ownership, bridge, mounts, diagnostics |
| `Runtime/WebkilnBridgeAction.h` | Blueprint actions |
| `Runtime/WebkilnBridgeRequest.h` | Async request completion |
| `Runtime/WebkilnJsonLibrary.h` | UObject JSON |
| `Runtime/BridgeValue.h` | Native request / response values |
| `Runtime/RuntimeTypes.h` | Pushed-event values |
| `View/WebkilnView.h` | Browser view |
| `View/ViewTypes.h` | Init, status, snapshots |
| `View/WebkilnAnchorTypes.h` | Anchor placement |
| `Widgets/WebkilnWidget.h` | UMG |
| `Widgets/SlateHostWidget.h` | Slate |
| `Widgets/WebkilnWatermark.h` | Watermark layout |
| `Settings/WebkilnSettings.h` | Project settings |
