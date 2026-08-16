import WebkilnExamples from "./components/WebkilnExamples";
import WebkilnFpsExample from "./components/WebkilnFpsExample";

const capabilities = [
  {
    title: "Iterate in seconds, not build cycles",
    body: "Change the interface and see it live in the running game. No recompiling, no cooking, no waiting on the engine.",
  },
  {
    title: "Complex UI, off the game thread",
    body: "Webkiln renders your interface off the game thread, so animated, data-heavy menus and HUDs don't eat into your frame budget.",
  },
  {
    title: "The whole web platform, npm included",
    body: "HTML, CSS, React and anything on npm. Charts, animation, state management, whole UI libraries — if it runs in a browser, it runs in your game.",
  },
  {
    title: "Hire from the biggest talent pool there is",
    body: "Web developers already know how to build this. You're not hunting for the few people who enjoy hand-authoring engine UI.",
  },
  {
    title: "Agent-friendly by default",
    body: "It's just web code, so AI coding agents can read, write and refactor your UI the same way they work on any web app.",
  },
  {
    title: "Modding without the editor",
    body: "Mods are plain text and web files, so players can reskin and extend the UI without a multi-gigabyte editor install. With AngelScript it's easier still.",
  },
];

const WebkilnMarketing = () => {
  return (
    <>
      <header className="wk-site-header">
        <a className="wk-brand" href="/webkiln/" aria-label="Webkiln home">
          <img src="/webkiln-logo.svg" alt="" />
          <span>Webkiln</span>
        </a>
        <nav aria-label="Webkiln navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#webkiln-examples">Live examples</a>
          <a href="/webkiln/docs/">Documentation</a>
          <a href="/">JG Games</a>
        </nav>
      </header>

      <main className="wk-page">
        <section className="wk-hero" id="overview">
          <div className="wk-hero-copy">
            <h1>Build game UI with the web platform.</h1>
            <p>
              Build your game's menus and HUDs with HTML, CSS and React. You
              iterate in seconds, lean on the entire web ecosystem, and keep
              heavy interfaces off the game thread &mdash; instead of wrestling
              the engine's built-in UI.
            </p>
            <div className="btn-group">
              <a href="/webkiln/docs/" className="btn btn-primary">
                Read the documentation
              </a>
              <a href="#webkiln-examples" className="btn btn-ghost">
                Try the live examples
              </a>
            </div>
          </div>

          <figure className="wk-hero-figure">
            <img
              src="/webkiln/showcase/after.png"
              alt="A Webkiln interface running inside an Unreal Engine sample"
            />
            <figcaption>
              JavaScript drives native Unreal actions while Chromium handles
              the interface.
            </figcaption>
          </figure>
        </section>

        <WebkilnExamples />

        <section className="wk-capabilities" id="capabilities">
          <header>
            <h2>Build UI without fighting the engine.</h2>
            <p>
              Use the frontend skills your team already has to build interfaces
              that look great and adapt to any screen, then hook them straight
              into what's happening in the game.
            </p>
          </header>

          <div className="wk-capability-grid">
            {capabilities.map((capability) => (
              <article key={capability.title}>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wk-statement">
          <div className="wk-statement-inner">
            <h2>Your game's interface shouldn't be the hard part.</h2>
            <p>
              Build the menus and HUDs players actually touch with the speed and
              polish of the modern web, and ship them in a fraction of the time
              hand-built engine UI takes.
            </p>
            <a href="/webkiln/docs/?doc=quick-start" className="wk-text-link">
              Read the quick start
            </a>
          </div>
        </section>

        <WebkilnFpsExample />

        <section className="wk-cta">
          <div>
            <h2>Bring a modern UI workflow to Unreal.</h2>
          </div>
          <div className="btn-group">
            <a href="/webkiln/docs/?doc=quick-start" className="btn btn-primary">
              Open the quick start
            </a>
            <a href="mailto:contact@jggames.dev" className="btn btn-ghost">
              Contact JG Games
            </a>
          </div>
        </section>
      </main>

      <footer className="wk-footer">
        <span>Webkiln by JG Games</span>
        <nav aria-label="Footer navigation">
          <a href="/webkiln/docs/">Documentation</a>
          <a href="mailto:contact@jggames.dev">Contact</a>
          <a href="/">JG Games</a>
        </nav>
      </footer>
    </>
  );
};

export default WebkilnMarketing;
