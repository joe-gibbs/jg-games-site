# Diagnostics

Open **Tools > Webkiln Diagnostics**. The same checks are available through
**Validate Installation**, **Get Runtime Directory** and **Synchronise Automatic
Packaging**.

At runtime: **On Load Failed**, `GetLastError()`, `ExportRuntimeDiagnosticsJson()`.
CEF logs to `Saved/Webkiln/Logs/cef.log`.

## DOM automation

Testing nodes return a request ID immediately. Bind **On Test Result** first.
The payload is `RequestId`, `Command`, `Succeeded` and `ResultJson`.

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

Only `id`, `role`, `aria-label` and `data-*` attributes are copied. Text is capped at
256 characters. Snapshots include at most 1,000 nodes.

| Command | Result JSON |
|---|---|
| Request DOM Snapshot | `{url, title, active, nodes, truncated, timeline}` |
| Query Selector for Testing | `{found, element}` |
| Pick Element for Testing | `{found, x, y, element}` |
| Click Selector for Testing | `{element}` after `click()` on the first match |

A command error sets `Succeeded` to false. The message is in `ResultJson`.

## Performance

`GetStatsSnapshot()` returns per-view counters. Look at **CEF Paint FPS** versus
**Presented FPS** if frames are being produced faster than Unreal shows them.
**JavaScript / Style / Layout / Paint** are Chromium phase times in milliseconds.

Bridge **Last Handler** / **Max Handler** are native handling time. Time spent waiting
on a Blueprint action is separate.
