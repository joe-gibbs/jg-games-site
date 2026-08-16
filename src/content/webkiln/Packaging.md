# Packaging

Webkiln stages its CEF runtime. Packaged projects do not download CEF. They do not
build a separate subprocess target.

Webkiln packages configured **Trusted Local Mounts**. Web roots must be inside
the project directory. The `gameui://` handler reads them through the Unreal platform-file
layer. This includes pak and IoStore data.

The packaging process cannot see mounts that you register with `RegisterResourceMount` at runtime. Add those roots to **Trusted Local Mounts** also. Or disable automatic staging and manage the Unreal packaging entries yourself.

Use the Webkiln package that matches the project Unreal Engine minor version. See
[Compatibility](Compatibility.md).
