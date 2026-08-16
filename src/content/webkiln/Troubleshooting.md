# Troubleshooting

Open **Tools > Webkiln Diagnostics** in the editor. The panel reports the pinned CEF version, installed runtime path, protocol mismatch and missing files.

View failures also appear through **On Load Failed** and `ExportRuntimeDiagnosticsJson`.

Common failures:

- **WebBrowser is still loaded:** Make the project descriptor writable. Then open the project again. Webkiln could not save its automatic WebBrowser widget change.
- **Unsupported RHI:** Launch with D3D11 or D3D12. Version 1 has no software-rendering fallback.
- **A `gameui://` URL returns 404:** Check the registered host and packaged root. Paths keep letter case after packaging on media that keeps letter case.
- **Bridge unavailable:** Load the page from a registered `gameui://` mount. Allowed remote origins do not receive the bridge.
- **IME candidate window is misplaced:** Keep the Webkiln widget focused. Make sure its Slate geometry matches the browser view size. World-space widgets need a `WidgetInteractionComponent` for focus and keyboard input.
- **A native select menu is clipped:** Chromium clips select popups to the browser viewport. Increase the view or widget draw size if the control is too close to an edge.
- **Subprocess mismatch:** Replace the complete versioned runtime. Do not mix DLLs or helpers from different releases.

Development builds can open Chromium DevTools through `UWebkilnView::OpenDevTools`. Shipping disables remote debugging.
