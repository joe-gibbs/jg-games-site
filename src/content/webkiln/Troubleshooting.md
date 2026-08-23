# Troubleshooting

Open **Tools > Webkiln Diagnostics**. View failures also appear through **On Load Failed** and `ExportRuntimeDiagnosticsJson`.

- **WebBrowser is still loaded:** Choose **Yes** on the startup dialog and restart.
- **Unsupported RHI:** D3D11 or D3D12.
- **A `gameui://` URL returns 404:** Check the host and packaged root. Paths stay case-sensitive after packaging if the media is case-sensitive.
- **Bridge unavailable:** The page must load from a registered `gameui://` mount.
- **IME candidate window is misplaced:** Keep the widget focused and its Slate geometry matched to the browser view size. World-space widgets need a `WidgetInteractionComponent`.
- **A native select menu is clipped:** Chromium clips select popups to the browser viewport. Increase the view or widget draw size.
- **Subprocess mismatch:** Replace the complete runtime from one release.
- **A Webkiln logo sits in the corner of every view:** That is a watermarked evaluation build. Licensed copies from Fab do not draw it.
