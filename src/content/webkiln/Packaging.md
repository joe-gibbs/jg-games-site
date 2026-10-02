# Packaging

The CEF runtime goes into the packaged game.

Your UI folders are packaged with the game if **Automatically Stage Trusted Local Mounts** is on. That's the [Resources](Settings.md#resources) list. Those folders have to live inside the project.

If you only added a folder with [`RegisterResourceMount`](CppAPI.md) at runtime, you still need an entry under **Trusted Local Mounts** - or add the folders to **Additional Non-Asset Directories to Package** yourself.

Watermarked trial zips, including the FPS sample that ships them, do not support **File > Package Project**. Unreal has to compile the game target against Webkiln, and those zips omit plugin source files. Packaging therefore fails with `Could not find definition for module 'Webkiln'`. 

## Linux development candidate

Install the complete candidate directory as `Plugins/Webkiln` in the consumer
project and compile it with Unreal 5.7+ and its matching Linux toolchain.
Keep the `WebkilnVulkan` module in the source package; it requests graphics
extensions before Unreal creates its Vulkan device. Keep the bundled
CEF headers, wrapper and runtime together. The candidate is a source plugin,
not a precompiled Linux editor release.

Linux game staging preserves Webkiln's `Source/ThirdParty/WebkilnCEF/Linux/Runtime`
directory. Keep that layout so the game can find `libcef.so` and the browser
subprocess after moving the package. `WebkilnSubprocess` must remain executable;
copying through Windows filesystems may require restoring that permission on
Linux. See [Compatibility](Compatibility.md) for the candidate's tested scope.
