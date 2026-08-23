# Quick start

1. Copy the packaged `Webkiln` directory into the project's `Plugins` folder and enable the plugin.
2. Put the built web files in a project directory such as `WebUI/dist`.
3. Add that directory as host `app` under **Project Settings > Plugins > Webkiln > Trusted Local Mounts**.
4. Create a view. Width and height `0` follow the player viewport.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();
FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");
UWebkilnView* View = Webkiln->CreateViewAsync(Params);
```

Create a `UWebkilnWidget`, assign the view with `SetView`, and add the widget to the viewport. The same widget works on a `WidgetComponent` for world-space UI.

Watermarked evaluation builds keep the Webkiln logo in the corner of every view.

The Plain sample under `Resources/Samples/Plain` can be mounted as-is.
