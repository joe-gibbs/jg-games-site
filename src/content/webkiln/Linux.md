# Linux

Webkiln's Linux source candidate uses Chromium Embedded Framework (CEF) and Vulkan. It currently requires Unreal Engine 5.7 or newer, an x86-64 target and an X11 session, including Xwayland. The verified consumer build used Unreal 5.7.4 on Ubuntu 24.04.

The [Windows trial downloads](/webkiln/downloads/) contain Windows binaries. For the Linux source package and matching CEF runtime, [contact JG Games](mailto:contact@jggames.dev) with your Unreal version and target distribution.

## Set up your project

1. Install the SDK and compiler listed in [Epic's Linux development requirements](https://dev.epicgames.com/documentation/en-us/unreal-engine/linux-development-requirements-for-unreal-engine) for your Unreal version.
2. Extract the complete Linux package into `YourProject/Plugins/Webkiln`. Keep the `WebkilnVulkan` module: it enables the required extensions before Unreal creates its graphics device.
3. Enable Webkiln and disable Unreal's Web Browser and Web Browser Widget plugins. Select Vulkan for the game.
4. Follow [Getting started](QuickStart.md) to register a local UI folder, load `gameui://app/index.html` and attach the view to a Webkiln widget.
5. Compile your project for Linux and package a Development build with the UI folder staged. Launch it from the packaged directory.

The CEF wrapper must be built with Unreal's matching libc++ toolchain. The source package includes its ABI manifest; a wrapper built against the system libstdc++ cannot be substituted. Keep the headers, wrapper, browser subprocess and runtime from the same package.

## Rendering

The accelerated path imports Chromium frames through DMA-BUF into Unreal's Vulkan device. It requires compatible Vulkan import extensions, image formats and modifiers from the GPU driver.

Use `-WebkilnRequireAcceleration` when checking this path: the view must use GPU transfer or report a failure. Use `-WebkilnLinuxSoftware` to select the separately tested software browser-frame transfer. Choose one option per run. The software option still uses Unreal's Vulkan renderer.

## Packaging and diagnostics

Unreal stages CEF under `Source/ThirdParty/WebkilnCEF/Linux/Runtime` in the plugin. Preserve that directory structure and the executable permission on `WebkilnSubprocess`. A Linux archive preserves permissions when transferring the package between machines.

Check a relocated packaged game so the browser loads its own runtime. Include the Unreal log, distribution, GPU, driver and selected rendering option in a support report.

## Verification

A packaged Unreal game passed local-page loading, bridge requests, native keyboard input, transparency, resizing and clean shutdown using software Vulkan. GPU transfer has compiled; physical-GPU execution remains unverified. Linux editor operation, browser audio, international input and broader distribution compatibility also need further checks. The VM result does not establish native-GPU performance.
