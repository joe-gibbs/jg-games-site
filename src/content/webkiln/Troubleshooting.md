# Troubleshooting

Open **Tools > Webkiln Diagnostics**. That's covered in [Diagnostics](Diagnostics.md). View failures also come through **On Load Failed**, and from C++ through `ExportRuntimeDiagnosticsJson()`.

- **WebBrowser is still loaded:** Choose **Yes** on the startup dialog and restart. That dialog also covers **Web Browser Widget**. See [Compatibility](Compatibility.md).

![Dialog asking to disable Unreal's Web Browser plugin](/webkiln/docs/webbrowser-conflict.png)

- **Play in the editor is black, Standalone Game is not:** The editor process still has Unreal's Web Browser loaded, so Webkiln will not start views. Same dialog as above - **Yes**, then restart.
- **Unsupported RHI:** D3D11 or D3D12. See [Compatibility](Compatibility.md).
- **The HUD stays black:** The page has not called `gameUI.markReady()` after `webkiln:runtime-ready`. See [Getting started](QuickStart.md) and [Views](Views.md#status-and-delegates).
- **A `gameui://` URL returns 404:** Check the folder in **[Trusted Local Mounts](Settings.md#resources)** and that it was [packaged](Packaging.md). Paths stay case-sensitive after packaging if the media is case-sensitive.
- **Bridge unavailable:** Load the page from `gameui://`, not `http` or `https`. **Dangerously Allow All Https** does not inject the bridge into remote pages. See [Talk to the game](TalkToTheGame.md).
- **IME candidate window is misplaced:** Keep the widget focused and its Slate geometry matched to the browser view size. World-space widgets need a `WidgetInteractionComponent`. See [Input](Input.md#keyboard) and [World-space UI](WorldSpace.md).
- **A native select menu is clipped:** Chromium clips select popups to the browser viewport. Increase the [view](Views.md#size-and-render-scale) or widget draw size.
- **Subprocess mismatch:** Replace the complete runtime from one release.
- **A Webkiln logo sits in the corner of every view:** That's a watermarked evaluation build. Licensed copies from Fab don't draw it. See [Packaging](Packaging.md).
