# C++ API

Add `Webkiln` to `PrivateDependencyModuleNames` in any module that includes Webkiln headers.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();
```

| Operation | Use |
|---|---|
| `CreateView`, `CreateViewAsync` | Create a [view](Views.md#create-a-view) and start page loading. |
| `FindView` | Look up a view by ID. `HasView` is the same check, C++ only. |
| `DestroyView` | Close a view. |
| `SetBridgeRequestHandler` | C++ JavaScript-request handler. See [JavaScript bridge](Bridge.md#c-handlers). |
| `DispatchEngineEventToView` | Event to one named view. |
| `BroadcastEngineEvent` | Event to every owned view. |
| `RegisterResourceMount`, `UnregisterResourceMount` | Add or remove a `gameui://` host at runtime. List the same folder under **[Trusted Local Mounts](Settings.md#resources)** to [package](Packaging.md) it. |
| `CreateBridgeObject` | Empty JSON object. Blueprint name **Create Webkiln JSON Object**. |
| `ExportBridgeTypeScript` | Declarations from Blueprint action and event schemas. See [JavaScript bridge](Bridge.md#generated-typescript). |
| `GetStatsSnapshot`, `ExportRuntimeDiagnosticsJson` | Runtime and performance state, C++ only. See [Diagnostics](Diagnostics.md). |
| `GetCefRuntimeVersion` | Bundled CEF version string. |
| `IsWatermarked` | True in watermarked evaluation builds. See [Packaging](Packaging.md). |

`UWebkilnView` owns the browser, the texture and the captured audio. `GetTexture()` is what
UMG and Slate present. `GetLastError()` is C++ only - Blueprint uses **On Load Failed**.

[`UWebkilnWidget::SetView()`](Views.md#attach-the-view) attaches a view. The subsystem owns the view.
The widget can hold [texture sources](HtmlElements.md#unreal-textures), an [anchor-atlas](HtmlElements.md#screen-and-world-anchors) view and a [localisation](HtmlElements.md#unreal-localisation) String Table.
`SWebkilnWidget` is public for Slate.

`RegisterResourceMount` needs a directory that exists and a valid host. Relative paths are
from the project directory. Put the same folder under **[Trusted Local Mounts](Settings.md#resources)** if you want it [packaged](Packaging.md).

JSON conversion uses `FJsonObjectConverter`. Blueprint bridge classes are in
[Talk to the game](TalkToTheGame.md) and [JavaScript bridge](Bridge.md). Counters are in [Diagnostics](Diagnostics.md).

| Header | |
|---|---|
| `Runtime/WebkilnSubsystem.h` | Ownership, bridge, UI folders, diagnostics |
| `Runtime/WebkilnBridgeAction.h` | Blueprint actions |
| `Runtime/WebkilnBridgeRequest.h` | Async request completion |
| `Runtime/WebkilnJsonLibrary.h` | UObject JSON |
| `Runtime/BridgeValue.h` | Native request / response values |
| `Runtime/RuntimeTypes.h` | Pushed-event values |
| `View/WebkilnView.h` | Browser view |
| `View/ViewTypes.h` | Init, status, snapshots |
| `View/WebkilnAnchorTypes.h` | Anchor placement |
| `View/WebkilnTextureTypes.h` | Native texture element state |
| `View/FrameStats.h` | Per-view counters |
| `Widgets/WebkilnWidget.h` | UMG |
| `Widgets/SlateHostWidget.h` | Slate |
| `Widgets/WebkilnWatermark.h` | Watermark layout |
| `Settings/WebkilnSettings.h` | [Project settings](Settings.md) |
