# Security and support

Supported engine versions and platforms are listed in [Compatibility](Compatibility.md).

Webkiln uses a pinned CEF release. Webkiln rejects runtime files that do not match.

Local mounts are trusted application content. Webkiln rejects traversal outside them. Webkiln denies network access unless an origin is listed in Project Settings. Webkiln injects the native bridge only into `gameui://` pages.

Report security issues to `contact@jggames.dev`.
