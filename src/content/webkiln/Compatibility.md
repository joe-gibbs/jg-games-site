# Compatibility

The released Windows plugin targets Unreal Engine **4.25 to 5.8**, Windows 64-bit and Direct3D 11 or Direct3D 12. Wine and Proton use software browser-frame transfer and cap the default frame rate at 30.

Windows trial zips and FPS samples are on the [downloads](/webkiln/downloads/) page. Watermarked trials run in the editor and cannot be packaged; see [Packaging](Packaging.md).

## Other platforms

Linux, Mac, iOS and Android have separate source implementations. The Windows release matrix does not establish support for the same engine versions on these platforms. [Contact JG Games](mailto:contact@jggames.dev) for platform packages and the tested engine configuration.

| Platform | Rendering | Current verification |
| --- | --- | --- |
| [Linux](Linux.md) | CEF through Vulkan; DMA-BUF acceleration implemented | Unreal 5.7.4 packaged game on Ubuntu 24.04 with software transfer; physical GPU acceleration pending |
| [macOS](Mac.md) | CEF through Metal, Apple Silicon arm64 | Custom Unreal 5.7 editor/game builds and static app checks; independent GPU, resize and bridge test |
| [iOS/iPadOS](IOS.md) | WKWebView native UIKit overlay | Unreal Development/Shipping plugin compilation and simulator bootstrap/resource checks; packaged game and physical devices pending |
| [Android](Android.md) | System WebView through Vulkan hardware buffers | Unreal 5.7.4 Development game on API 34 x86-64 emulator; physical devices and Shipping pending |

Linux and mobile require Unreal 5.7 or newer. Mac has been validated against the custom 5.7 engine described on its platform page. The [Mobile APIs](Mobile.md) page explains capability queries, projected labels and registered sounds.

## Browser plugins

On Windows and Linux, turn off Unreal's **Web Browser** and **Web Browser Widget** plugins to avoid loading a second CEF runtime. On Mac, Webkiln checks for an already-loaded Chromium framework; an Unreal module that uses native WebKit alone is not another CEF runtime.

![Plugins window with Unreal Web Browser disabled](/webkiln/docs/plugins-web-browser.png)
