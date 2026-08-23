# Packaging

The CEF runtime ships in the package. Configured **Trusted Local Mounts** are packaged
with the game. Web roots must be inside the project directory.

Mounts added with `RegisterResourceMount` at runtime also need a **Trusted Local Mounts**
entry, or manage the Unreal packaging entries yourself.

See [Compatibility](Compatibility.md) for which Unreal Engine minor version to install.

Watermarked evaluation builds display the Webkiln logo in the bottom-right of every
view. Licensed copies from Fab do not. `IsWatermarked` reports the compiled edition.
