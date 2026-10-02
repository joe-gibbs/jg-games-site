# Compatibility

Webkiln supports Unreal Engine **4.25 to 5.8**, Windows 64-bit, Direct3D 11 or Direct3D 12. That includes Wine and Proton, which use software paint and cap the default frame rate at 30.

Trial plugin zips for 4.25 to 5.8, and the FPS sample for 5.7 and 5.8, are on the [downloads](/webkiln/downloads/) page. Watermarked trials run in the editor and cannot be packaged; see [Packaging](Packaging.md).

Turn off Unreal's **Web Browser** and **Web Browser Widget** plugins - you don't want two Chromium copies loaded at once. If either is still loaded, see [Troubleshooting](Troubleshooting.md).

![Plugins window with Unreal Web Browser disabled](/webkiln/docs/plugins-web-browser.png)

## Linux development candidate

An experimental Linux x86-64 source build has been tested in a packaged Unreal
5.7.4 game on Ubuntu 24.04, using X11 and software Vulkan. That functional pass
used software browser-frame transfer. The candidate now also implements
DMA-BUF/Vulkan GPU transfer, including RGBA/BGRA conversion, popups and synchronized
presentation. The accelerated path has been compiled but has not yet been tested
on hardware. Linux currently requires Unreal 5.7 or newer.
This candidate is separate from the Windows trial downloads and the released
engine-version matrix above.

The functional checks cover local pages, the JavaScript bridge, keyboard input,
transparency, resizing and shutdown. Linux editor operation, audio, native GPU
performance and the wider Linux distribution matrix remain unverified. The VM
test scene disables temporal anti-aliasing because its Mesa software Vulkan
compiler failed on that shader path.

Acceleration requires a driver supporting Vulkan DMA-BUF imports and Chromium's
image modifiers. `-WebkilnRequireAcceleration` rejects software fallback for
validation; `-WebkilnLinuxSoftware` explicitly selects software transfer. These
options are alternatives. Import failures include diagnostics. Acceleration
keeps frame pixels on the GPU, but display cadence still follows the game and
GPU contention can affect both the scene and UI.

## Mobile development candidate

Experimental Android Vulkan-texture and iOS native-overlay backends require Unreal 5.7 or newer. The iOS overlay implements affine placement, opacity, rectangular clipping and explicit touch regions. Both candidates include projected DOM labels and commands for game-registered Unreal sounds; capturing browser audio into Unreal remains unavailable.

A packaged Unreal 5.7.4 Android game passed an API 34 x86-64 Vulkan emulator test for accelerated color/alpha, native keyboard input, bridge requests, registered Unreal sound commands, resize and close. A separate native harness passed resource, reload and background/resume checks. Physical-device and shipping checks remain pending. iOS has no Apple SDK build or device validation yet. See [Mobile](Mobile.md) for APIs, local-media restrictions and the remaining platform limits.
