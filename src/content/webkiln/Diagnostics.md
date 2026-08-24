# Diagnostics

Open **Tools > Webkiln Diagnostics**. The same checks are also on **Validate Installation**,
**Get Runtime Directory** and **Synchronise Automatic Packaging** - that last one is for [Packaging](Packaging.md).

At runtime you've got **On Load Failed** on the [view](Views.md#status-and-delegates).
From C++, `GetLastError()` is on that view and `ExportRuntimeDiagnosticsJson()` is on the
subsystem. CEF logs to `Saved/Webkiln/Logs/cef.log`.

## DevTools

After Play, open the Unreal console (`~`) and run:

```text
Webkiln.OpenDevTools
```

That opens Chromium DevTools for the only live view. If more than one is live, pass the
[view id](Views.md#init-params):

```text
Webkiln.OpenDevTools MainUI
```

**Open DevTools** on the view does the same thing. From C++, `View->OpenDevTools()`.

Remote debugging is at `http://localhost:9222` unless you change [Remote Debugging Port](Settings.md#development).
The address is also written to the Unreal log.

**Enable DevTools** must be on (the default). A settings change needs a process restart.
The view has to have started. Shipping builds do not register the console command.

## DOM automation

Testing nodes return a request ID immediately - bind **On Test Result** first.
They only run on a Ready `gameui://` view. The payload is `RequestId`, `Command`,
`Succeeded` and `ResultJson`.

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

If a command errors, `Succeeded` is false and the message is in `ResultJson`.

## Performance

`GetStatsSnapshot()` (C++) returns per-view counters. Look at **CEF Paint FPS** versus
**Presented FPS** if frames are being produced faster than Unreal shows them.
**JavaScript / Style / Layout / Paint** are Chromium phase times in milliseconds.

[Bridge](Bridge.md) **Last Handler** / **Max Handler** are native handling time. Time spent waiting
on a Blueprint action is separate.
