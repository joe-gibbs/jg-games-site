# Security and support

The page can only read files from its UI folder - that's the list in [Project settings](Settings.md#resources). Network URLs need an origin in **Allowed Remote Origins**, or **Dangerously Allow All Https** for any `https://` / `wss://` URL. Matching rules are in [Project settings](Settings.md#security).

[`window.gameUI`](TalkToTheGame.md) only exists on `gameui://` pages. Remote pages never receive it, even with the HTTPS flag on.

Report security issues to `contact@jggames.dev`.
