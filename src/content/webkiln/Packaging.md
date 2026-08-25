# Packaging

The CEF runtime goes into the packaged game.

Your UI folders are packaged with the game if **Automatically Stage Trusted Local Mounts** is on. That's the [Resources](Settings.md#resources) list. Those folders have to live inside the project.

If you only added a folder with [`RegisterResourceMount`](CppAPI.md) at runtime, you still need an entry under **Trusted Local Mounts** - or add the folders to **Additional Non-Asset Directories to Package** yourself.

Engine versions are in [Compatibility](Compatibility.md).

Watermarked evaluation builds draw the Webkiln logo in the bottom-right of every view. Licensed copies from Fab don't. `IsWatermarked` tells you which edition you compiled - it's on the [C++ API](CppAPI.md). If you see the logo and didn't expect it, see [Troubleshooting](Troubleshooting.md).

Watermarked trial zips, including the FPS sample that ships them, do not support **File > Package Project**. Unreal has to compile the game target against Webkiln, and those zips omit plugin source so the watermark stays in the editor DLL. That fails with `Could not find definition for module 'Webkiln'`. Package from a licensed Fab build, or download the [packaged demo](/webkiln/downloads/).
