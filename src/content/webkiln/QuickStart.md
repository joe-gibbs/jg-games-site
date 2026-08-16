# Quick start

1. Copy the packaged `Webkiln` directory into the project `Plugins` directory. Enable the plugin.
2. Put the built web files in a project directory such as `WebUI/dist`.
3. Add that directory under **Project Settings > Plugins > Webkiln > Trusted Local Mounts**. Webkiln registers the mount. Webkiln also adds the directory to the Unreal packaged UFS directories.
4. Create a view at the matching URL. Width and height use the current player viewport when you do not set them.

```cpp
UWebkilnSubsystem* Webkiln = GameInstance->GetSubsystem<UWebkilnSubsystem>();
FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");
UWebkilnView* View = Webkiln->CreateViewAsync(Params);
```

Create a `UWebkilnWidget`. Assign the returned view with `SetView`. Add the widget to the viewport. You can also use the same widget with a `WidgetComponent` for world-space UI.

You can mount the Plain sample under `Resources/Samples/Plain` directly. The React sample has TypeScript source and build metadata.

Continue with [View lifecycle](Lifecycle.md) for view ownership and resizing. Then use [JavaScript bridge](Bridge.md) for communication between Unreal and JavaScript. [API](API.md) covers native textures, localisation, anchors and browser audio.
