# Project settings

Webkiln settings are under **Project Settings > Plugins > Webkiln**. Webkiln stores them in
the project Engine configuration.

## Development

| Setting | Default | Behaviour |
|---|---:|---|
| Enable DevTools | On | Enables **Open DevTools** and the remote-debugging endpoint in Editor and Development builds. Webkiln removes both paths from Shipping. Requires a process restart. |
| Remote Debugging Port | `9222` | TCP port that Chromium remote debugging uses when DevTools are enabled. Set it to `0` to disable the endpoint and keep the per-view DevTools window. Requires a process restart. |

When the endpoint is active, Webkiln writes its address to the Unreal log. The endpoint listens on
the local machine. Shipping builds set no remote-debugging port. **Open DevTools**
returns false.

## Runtime

| Setting | Default | Behaviour |
|---|---:|---|
| Cache Mode | Persistent | Selects persistent, memory-only or disabled Chromium caching. Webkiln reads this when CEF starts. |
| Default Frame Rate | `60` | Used when a view **Frame Rate** is `0`. Existing views keep the rate selected at creation. |
| Default Transparent | On | Used when a view has **Use Default Transparency** enabled. Existing views keep their transparency mode. |
| GPU Thread Priority | `7` | Sets the thread priority of the CEF GPU process from `-7` to `7`. Requires a process restart. |

Webkiln stores persistent cache data under `Saved/Webkiln/DefaultProfile`. The CEF log is
at `Saved/Webkiln/Logs/cef.log`. Multiprocess PIE uses a separate directory below
`Saved/Webkiln/MultiprocessPIE` for each process.

**Memory Only** gives Chromium no persistent profile path. **Disabled** also passes the
Chromium cache-disable switch. Neither mode deletes an existing persistent profile.

In non-Shipping builds, `-WebkilnGpuThreadPriority=N` overrides the configured GPU thread
priority for that process.

## Input

**Gamepad Key Mappings** translates Unreal gamepad keys into browser keyboard keys while
the Webkiln widget has keyboard focus.

| Gamepad key | Default browser key |
|---|---|
| D-pad Up, Down, Left, Right | Arrow Up, Down, Left, Right |
| Bottom face button | Enter |
| Right face button | Escape |
| Left shoulder | Page Up |
| Right shoulder | Page Down |

Webkiln does not send an unmapped gamepad key to Chromium. Webkiln reads mapping changes on each key event.

## Resources

**Trusted Local Mounts** maps a host to a project directory. A mount with host `app` and
root `WebUI/dist` makes that directory available at `gameui://app/`. Hosts accept letters,
digits and hyphens inside the name. Webkiln canonicalises mounted paths. Paths cannot go outside their root.

Webkiln registers configured mounts during plugin startup. A change requires an
editor or game restart.

**Automatically Stage Trusted Local Mounts** adds the configured directories to the Unreal
**Additional Non-Asset Directories to Package** list. Webkiln records the entries that it owns
in **Automatically Staged Resource Roots**. That managed list is configuration data. Do not
edit it manually. See [Packaging](Packaging.md).

## Bridge

**Bridge Actions** contains Blueprint subclasses of `UWebkilnBridgeAction`. Webkiln creates
one instance of each class for each game instance. Webkiln rejects empty and duplicate action names.
Changes take effect when the next game instance is created.

**Bridge Events** records the name and optional payload struct for events pushed from
Unreal. It does not register runtime handlers. **Export Bridge TypeScript** reads the list
when it generates the typed JavaScript event map.

## Security

**Allowed Remote Origins** permits HTTPS pages and resources outside `gameui://`. Webkiln matches each
entry without letter case. Webkiln removes a trailing slash before the match. A URL must equal
the entry or be below it as a slash-delimited path. Remote pages never receive
`window.gameUI`.

Webkiln handles `gameui://`, `data:`, `blob:` and `about:blank` without entries in
this list. A change to the list requires a restart.

## Logging

| Setting | Default | Behaviour |
|---|---:|---|
| Log Level | Info | Minimum severity written to `Saved/Webkiln/Logs/cef.log` in non-Shipping builds. CEF reads it one time at startup. |
| Log Console Messages in Shipping | Off | Copies browser console warnings and errors into the Unreal log in Shipping. **On Console Message** still receives console messages. |

Shipping fixes the CEF log severity at Warning. Browser console logging stays off unless
**Log Console Messages in Shipping** is enabled.
