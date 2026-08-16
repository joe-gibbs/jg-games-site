# World-space widgets

Create the Webkiln view from a game-instance subsystem or an owning actor. Then assign the view to a `UWebkilnWidget`. Set that widget as the class that an Unreal `WidgetComponent` uses in World space.

Use a fixed draw size that matches the browser size of the view. `UWebkilnWidget` updates the view when its Slate geometry changes. When you change the component draw size, the Chromium viewport also changes.

Forward interaction through a normal `WidgetInteractionComponent`. Webkiln handles mouse capture, cursor leave, double click, wheel, key and character events. The default gamepad mappings translate the D-pad, face buttons and shoulder buttons to browser navigation keys. You can change the mappings under **Project Settings > Plugins > Webkiln**.

Transparent pixels remain part of the Unreal widget hit-test rectangle. Hit tests that follow the visible shape belong in the owning game. That behaviour depends on the interaction rules of that game.
