# Getting started

First you need the plugin in your project, an HTML page, and that page on the HUD. Once that's working, you can [talk to the game](TalkToTheGame.md) or [put UI in the world](WorldSpace.md).

## 1. Install the plugin

Copy the packaged `Webkiln` folder into the project's `Plugins` directory.

Enable **Webkiln** under **Edit > Plugins**, turn off Unreal's **Web Browser** and **Web Browser Widget** plugins, and restart the editor. See [Compatibility](Compatibility.md) for platforms, or [Troubleshooting](Troubleshooting.md) if that dialog keeps coming back.

![Plugins window with Webkiln enabled](/webkiln/docs/plugins-webkiln.png)

Use the Webkiln build that matches your Unreal Engine version (5.1 through 5.8).

## 2. Add an HTML page

Make a folder in the project - `WebUI` is fine - and put an `index.html` in it:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>HUD</title>
    <style>
      html, body { margin: 0; background: transparent; }
      .hud { padding: 24px; color: #fff; font: 18px/1.4 sans-serif; }
    </style>
  </head>
  <body>
    <div class="hud">Hello from Webkiln</div>
    <script>
      window.addEventListener('webkiln:runtime-ready', () => {
        window.gameUI.markReady();
      });
    </script>
  </body>
</html>
```

Then under **Project Settings > Plugins > Webkiln > Trusted Local Mounts**, add host `app` pointing at that folder. That's the [Resources](Settings.md#resources) list.

![Webkiln project settings, including Trusted Local Mounts](/webkiln/docs/settings.png)

You can now load the page as `gameui://app/index.html`. Restart the editor if you change this list.

If you're using a bundler, point host `app` at the output folder instead (`WebUI/dist`). There's a Plain sample under `Resources/Samples/Plain` you can point at in the same way.

## 3. Create a HUD

Create a [view](Views.md) from the game-instance subsystem, put it on a `UWebkilnWidget`, and add that widget to the viewport. Width and height `0` follow the player viewport.

The graph below does this in Blueprint - copy it into an actor that runs on Begin Play.

```cpp
UWebkilnSubsystem* Webkiln = GetGameInstance()->GetSubsystem<UWebkilnSubsystem>();

FWebkilnViewInitParams Params;
Params.ViewId = TEXT("MainUI");
Params.EntryPoint = TEXT("gameui://app/index.html");

UWebkilnView* View = Webkiln->CreateViewAsync(Params);

UWebkilnWidget* Widget = CreateWidget<UWebkilnWidget>(GetWorld());
Widget->SetView(View);
Widget->AddToViewport();
```

If you're calling this from C++, add `Webkiln` to `PrivateDependencyModuleNames` in that module's `Build.cs`. The rest of the native API is in [C++ API](CppAPI.md).

Bind **On Document Ready**, **On Ready** and **On Load Failed** before you use the page. Those delegates are listed in [Views](Views.md#status-and-delegates).

`webkiln:runtime-ready` is when `gameUI` is fully installed. Call `gameUI.markReady()` then - that's when **On Ready** fires and Unreal starts sending events. Hit Play and the page should show up over the game.

![HUD drawn over the game](/webkiln/docs/hud-play.jpg)

In the editor you can inspect it with **Open DevTools** on the view, or with Chromium remote debugging - the port is under [Project settings](Settings.md#development) (default `9222`).

There's more on the widget itself in [HUD](HUD.md).
