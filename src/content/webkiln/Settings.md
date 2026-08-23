# Project settings

**Project Settings > Plugins > Webkiln**. Stored in the project Engine configuration.

## Development

| Setting | Default | Behaviour |
|---|---:|---|
| Enable DevTools | On | **Open DevTools** and remote debugging in Editor and Development. Requires a process restart. |
| Remote Debugging Port | `9222` | Set to `0` for the per-view DevTools window only. Requires a process restart. |

When the endpoint is active, its address is written to the Unreal log. It listens on
the local machine.

## Runtime

| Setting | Default | Behaviour |
|---|---:|---|
| Cache Mode | Persistent | Persistent, memory-only or disabled. Read when CEF starts. |
| Default Frame Rate | `60` | Used when a view **Frame Rate** is `0`. Existing views keep the rate selected at creation. |
| Default Transparent | On | Used when a view has **Use Default Transparency** enabled. Existing views keep their transparency mode. |
| GPU Thread Priority | `7` | CEF GPU process, `-7` to `7`. Requires a process restart. |

Cache and logs live under `Saved/Webkiln/`. Multiprocess PIE gets a directory per process.

Switching Cache Mode away from Persistent leaves any existing profile on disk.

## Input

**Gamepad Key Mappings**, while the Webkiln widget has keyboard focus:

| Gamepad key | Default browser key |
|---|---|
| D-pad Up, Down, Left, Right | Arrow Up, Down, Left, Right |
| Bottom face button | Enter |
| Right face button | Escape |
| Left shoulder | Page Up |
| Right shoulder | Page Down |

Unmapped keys stay with the game. Mapping changes apply on the next key event.

## Resources

Each **Trusted Local Mounts** entry is a host plus a project directory. Host `app` and
root `WebUI/dist` serve `gameui://app/`. Host names: letters, digits and hyphens.

A change needs an editor or game restart.

**Automatically Stage Trusted Local Mounts** adds those directories to Unreal's
**Additional Non-Asset Directories to Package** list. See [Packaging](Packaging.md).

## Bridge

**Bridge Actions**: Blueprint subclasses of `UWebkilnBridgeAction`. One instance per
class per game instance. Changes apply on the next game instance.

**Bridge Events**: name and optional payload struct for events pushed from Unreal.
**Export Bridge TypeScript** reads this list.

## Security

**Allowed Remote Origins**: HTTPS outside `gameui://`. Matching is case-insensitive;
a trailing slash is optional. A URL must equal the entry or sit below it as a
slash-delimited path.

`gameui://`, `data:`, `blob:` and `about:blank` are always allowed.
A change to the list requires a restart.

## Logging

| Setting | Default | Behaviour |
|---|---:|---|
| Log Level | Info | Minimum severity in `Saved/Webkiln/Logs/cef.log` in non-Shipping builds. |
| Log Console Messages in Shipping | Off | Copies browser console warnings and errors into the Unreal log in Shipping. |

In Shipping, CEF log severity is Warning.
