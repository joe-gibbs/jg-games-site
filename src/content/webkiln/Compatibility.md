# Compatibility

Unreal Engine **4.25 through 5.8**, Windows 64-bit, Direct3D 11 or Direct3D 12. That includes Wine and Proton, which use software paint and cap the default frame rate at 30.

Install the Webkiln package that matches your project's Unreal Engine minor version. Trial plugin zips for 4.25 through 5.8, and the FPS sample for 5.7 and 5.8, are on the [downloads](/webkiln/downloads/) page. Watermarked trials run in the editor and cannot be packaged; see [Packaging](Packaging.md).

Turn off Unreal's **Web Browser** and **Web Browser Widget** plugins - you don't want two Chromium stacks loaded at once. If either is still loaded, see [Troubleshooting](Troubleshooting.md).

![Plugins window with Unreal Web Browser disabled](/webkiln/docs/plugins-web-browser.png)
