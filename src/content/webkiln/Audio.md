# Browser audio

Chromium audio is captured by default into one Unreal audio component per view. Pause, mix and attenuation then follow Unreal instead of the system browser.

## Route it

Set this on the [view init params](Views.md#init-params):

| Field | Meaning |
|---|---|
| Route Browser Audio to Unreal | Capture into the Unreal mixer. |
| Browser Audio Volume | Initial Unreal-side multiplier. |
| Browser Audio Is UI Sound | Unreal UI-sound pause and mixing rules. |
| Browser Audio Sound Class | Mix and pause class. |
| Browser Audio Submix | Effects graph. |

After creation, **Set Browser Audio Volume** and **Set Browser Audio Muted** change the Unreal-side component. Closing the [view](Views.md#close-a-view) closes the capture.
