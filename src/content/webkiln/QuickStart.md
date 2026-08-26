# Getting started

First you need the plugin in your project, an HTML page, and that page on the HUD. Once that's working, you can [talk to the game](TalkToTheGame.md) or [put UI in the world](WorldSpace.md).

## 1. Install the plugin

Copy the packaged `Webkiln` folder into the project's `Plugins` directory. 

Enable **Webkiln** under **Edit > Plugins**, turn off Unreal's **Web Browser** and **Web Browser Widget** plugins, and restart the editor. See [Compatibility](Compatibility.md) for platforms, or [Troubleshooting](Troubleshooting.md) if that dialog keeps coming back.

![Plugins window with Webkiln enabled](/webkiln/docs/plugins-webkiln.png)

## 2. Add an HTML page

Make a folder in the project - `WebUI` is fine, but you can call it anything - and put an `index.html` in it:

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

If you're using a bundler, point host `app` at the output folder. Save, then **restart** the game, `gameui://` will read that folder from disk. 

## 3. Create a widget

Create a Widget Blueprint. `PlayerHUD` is the name used in the graph below (this is unimportant); the parent class can stay `User Widget`.

In the Designer, search the palette for **Webkiln Widget** and drop it in. Tick **Is Variable** so you can bind it from Blueprint.

![UMG designer with a Webkiln Widget filling PlayerHUD](/webkiln/docs/hud-umg.png)

You can also put `UWebkilnWidget` on the viewport by itself. There's more on the widget in [HUD](HUD.md).

## 4. Wire it up

Create a [view](Views.md) from the game-instance subsystem, set it on the widget, and add that widget to the viewport. Set the width and height `0` so that the view will be sized to fit the game window.

The graph below does this in Blueprint: it creates `PlayerHUD`, adds it to the viewport, then **Set View** on the Webkiln widget inside it.

```blueprint
create-view
```

Or in C++, you can skip the wrapping widget and put `UWebkilnWidget` on the viewport directly:

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

If you're using C++, add `Webkiln` to `PrivateDependencyModuleNames` in your module's `Build.cs`. For more about the API see [C++ API](CppAPI.md).

When using the async initialisation bind **On Document Ready**, **On Ready** and **On Load Failed** before you use the page so that you can see what has gone wrong. Those delegates are listed in [Views](Views.md#status-and-delegates).

Hit Play and the page should show up over the game.

![HUD drawn over the game](/webkiln/docs/hud-play.jpg)

In the editor you can inspect it with **Open DevTools** on the view, or with Chromium remote debugging - the port is under [Project settings](Settings.md#development) (default `9222`).
