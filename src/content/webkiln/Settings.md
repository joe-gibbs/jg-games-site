# Project settings

**Project Settings > Plugins > Webkiln**. These live in the project's Engine config.

![Webkiln project settings](/webkiln/docs/settings.png)

## Development

| Setting | Default | Behaviour |
|---|---:|---|
| Enable DevTools | On | **Open DevTools** and remote debugging in Editor and Development. Requires a process restart. |
| Remote Debugging Port | `9222` | Set to `0` for the per-view DevTools window only. Requires a process restart. |

When remote debugging is on, the address is written to the Unreal log. It only listens on
the local machine.

## Runtime

| Setting | Default | Behaviour |
|---|---:|---|
| Cache Mode | Persistent | Persistent, memory-only or disabled. Read when CEF starts. |
| Default Frame Rate | `60` | Used when a [view](Views.md#init-params) **Frame Rate** is `0`. Existing views keep the rate selected at creation. |
| Default Transparent | On | Used when a view has **Use Default Transparency** enabled. Existing views keep their transparency mode. See [HUD](HUD.md#size-and-transparency). |
| GPU Thread Priority | `7` | CEF GPU process, `-7` to `7`. Requires a process restart. |

Cache and logs live under `Saved/Webkiln/`. Multiprocess PIE gets a directory per process.

If you switch Cache Mode away from Persistent, the old profile stays on disk.

## Input

**Gamepad Key Mappings**, while the Webkiln widget has keyboard focus. How these reach the page is in [Input](Input.md#gamepad).

| Gamepad key | Default browser key |
|---|---|
| D-pad Up, Down, Left, Right | Arrow Up, Down, Left, Right |
| Bottom face button | Enter |
| Right face button | Escape |
| Left shoulder | Page Up |
| Right shoulder | Page Down |

Unmapped keys stay with the game. Mapping changes apply on the next key event.

## Resources

**Trusted Local Mounts** is the list of project folders `gameui://` can serve. Host `app`
pointing at `WebUI/dist` means `gameui://app/index.html` loads that file. Host names are
letters, digits and internal hyphens - they cannot start or end with a hyphen. [Getting started](QuickStart.md) covers adding the first folder.

You'll need to restart the editor or the game after a change.

**Automatically Stage Trusted Local Mounts** copies those folders into the packaged game
through Unreal's **Additional Non-Asset Directories to Package** list. That's covered in [Packaging](Packaging.md).

## Bridge

**Bridge Actions**: Blueprint subclasses of `UWebkilnBridgeAction`. One instance per
class per game instance. Changes apply on the next game instance.

**Bridge Events**: name and optional payload struct for events pushed from Unreal.
**Export Bridge TypeScript** reads this list. That's covered in [JavaScript bridge](Bridge.md#generated-typescript).

There's a walkthrough in [Talk to the game](TalkToTheGame.md).

## Security

**Allowed Remote Origins**: HTTPS outside `gameui://`. Matching is case-insensitive;
a trailing slash is optional. A URL must equal the entry or sit below it as a
slash-delimited path. Why this matters is in [Security and support](SecurityAndSupport.md).

**Dangerously Allow All Https**: Off. Any `https://` or `wss://` URL may load.
`http://` still needs an allowlist entry. Remote pages never receive the native
bridge. Requires a process restart.

`gameui://`, `data:`, `blob:` and `about:blank` are always allowed.
A change to the allowlist requires a restart.

## Logging

| Setting | Default | Behaviour |
|---|---:|---|
| Log Level | Info | Minimum severity in `Saved/Webkiln/Logs/cef.log` in non-Shipping builds. See [Diagnostics](Diagnostics.md). |
| Log Console Messages in Shipping | Off | Copies browser console warnings and errors into the Unreal log in Shipping. |

In Shipping, CEF log severity is Warning.
