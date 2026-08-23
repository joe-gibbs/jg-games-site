# World-space widgets

Assign the view to a `UWebkilnWidget` and use that widget as the class of a `WidgetComponent` in World space.

Match the component draw size to the view's browser size.

Forward interaction through a `WidgetInteractionComponent`.

Transparent pixels are still part of the Unreal widget hit-test rectangle. Hit tests that follow the visible shape belong in the game.
