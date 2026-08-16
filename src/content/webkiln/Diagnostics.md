# Diagnostics

Open **Tools > Webkiln Diagnostics** in the editor. The panel checks the plugin runtime,
CEF version, subprocess protocol and required files. You can also run the same checks through
**Validate Installation**, **Get Runtime Directory** and **Synchronise Automatic
Packaging** in the editor module.

At runtime, **On Load Failed** carries the failure text of a view. C++ can also read
`GetLastError()` and `ExportRuntimeDiagnosticsJson()`. CEF writes its log to
`Saved/Webkiln/Logs/cef.log`.

## DOM automation results

The testing nodes return a request ID immediately. Bind **On Test Result** before you call
them. The delegate supplies `RequestId`, `Command`, `Succeeded` and `ResultJson`.

Each described element has this shape:

```json
{
  "tag": "button",
  "id": "confirm",
  "className": "primary",
  "text": "Confirm",
  "attributes": {"aria-label": "Confirm order"},
  "rect": {"x": 120, "y": 48, "width": 180, "height": 42},
  "visible": true
}
```

Webkiln copies only `id`, `role`, `aria-label` and `data-*` attributes. Webkiln trims text and
limits it to 256 characters.

| Command | Result JSON |
|---|---|
| Request DOM Snapshot | `{url, title, active, nodes, truncated, timeline}`. `nodes` contains at most 1,000 elements. `timeline` contains at most 256 recent pointer, wheel, key, input and change events. |
| Query Selector for Testing | `{found, element}` for the first matching CSS selector. |
| Pick Element for Testing | `{found, x, y, element}` using `document.elementFromPoint` in browser pixels. |
| Click Selector for Testing | `{element}` after Webkiln calls the DOM `click()` method of the first matching element. |

A command error sets `Succeeded` to false. The error message is in the result that
the testing delegate supplies. **Export DOM Debug Json**, **Export Element Pick Json** and
**Export Event Debug Log Json** return bounded cached results. **Export Composition Debug
Json** reports native texture layers, anchors, input, paint sequence and audio state. It does not
wait for JavaScript.

## Runtime snapshot

`UWebkilnSubsystem::GetStatsSnapshot()` returns aggregate and per-view counters.
`ExportRuntimeDiagnosticsJson()` adds CEF initialisation state, error text, runtime
directory, subprocess path and CEF version. `GetStatsLogLine()` provides a short log line.

The subsystem keeps up to 4,096 frame trace samples. `GetFrameTraceSamplesSince()` reads
by sequence from a starting point. Slow-only mode keeps samples whose JavaScript, style,
layout, paint, upload and composition time totals are at least 16.67 ms.

### Frame counters

| Field | Meaning |
|---|---|
| Frame Number | Browser frames presented to Unreal. |
| CEF Paint FPS | CEF paint callbacks per second. |
| Presented FPS | Browser frames that Unreal presents per second. |
| CEF Animation FPS | `requestAnimationFrame` callbacks measured in Chromium per second. |
| JavaScript, Microtasks, Style, Layout, Paint | Latest measured Chromium phase time in milliseconds. |
| Upload | Time to make the browser frame available to Unreal. |
| Accelerated Open | Time to open the latest CEF shared texture. |
| Accelerated Frame Latency | Time from accelerated-paint receipt to presentation. |
| Accelerated Paint Gap | Gap between the two latest accelerated paint callbacks. |
| Composite | Native texture and anchor composition time. |
| Slate Paint | Webkiln widget paint time. |
| Paint Callback Count | Total software and accelerated paint callbacks. |
| Accelerated Paint Callback Count | Accelerated main-view callbacks. |
| Accelerated Popup Paint Callback Count | Accelerated popup callbacks. |
| Accelerated Displayed Frame Count | Accelerated frames that Unreal presented with success. |
| Shared Texture Requested | Whether the view requested CEF shared-texture rendering. |
| Used Accelerated Paint | Whether the latest frame used the shared-texture path. |
| Render Target Hash | Time spent to check native render-target content for changes. |
| Render Target Skia Raster | Time spent to rasterise native render-target elements through Skia. |
| Render Target Display Item Count | Native render-target elements in the latest display list. |
| Style Dirty Root Count | DOM roots invalidated for style recalculation in the measured frame. |
| Display List Invalidation Reason | Latest reason that Webkiln rebuilt the native display list. |

All times are milliseconds. A high CEF Paint FPS with a lower Presented FPS shows that
frames arrive faster than Unreal presents them. A long Accelerated Paint Gap means
Chromium did not supply a new accelerated frame during that interval.

### Bridge counters

| Field | Meaning |
|---|---|
| Batch Count | Bridge batches processed. |
| Request Count | Requests received from JavaScript. |
| Error Response Count | Requests completed with an error. |
| Request Bytes, Response Bytes | Total UTF-8 bytes received and sent. |
| Last Handler | Most recent completed handler time. |
| Total Handler | Handler time accumulated across all requests. |
| Max Handler | Longest single handler time. |
| Last Batch Handler | Combined handler time for the latest batch. |
| Max Batch Handler | Longest combined batch handler time. |

Handler times are milliseconds. They measure native request handling. They do not measure time spent waiting
for an asynchronous Blueprint action to complete later.

### Native display-list counters

| Field | Meaning |
|---|---|
| Item Count | All entries in the latest native composition display list. |
| Draw Item Count | Drawable entries. |
| Clip Item Count | Clip operations. |
| Image Item Count | Native image entries. |
| Text Item Count | Native text entries. |

Per-view snapshots also include the view ID, entry point, runtime status, browser viewport,
render-target size and render scale. Aggregate snapshots contain view, ready and failed
counts plus totals across all views.
