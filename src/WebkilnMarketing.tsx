import WebkilnExamples from "./components/WebkilnExamples";
import WebkilnFpsExample from "./components/WebkilnFpsExample";

const capabilities = [
  {
    title: "Iterate in seconds",
    body: "Change the interface and see it live in the running game.",
  },
  {
    title: "Complex UI off the game thread",
    body: "Webkiln renders your interface off the game thread, so animated and data-heavy menus and HUDs don't kill your frame budget.",
  },
  {
    title: "The whole web platform",
    body: "HTML, CSS, React and anything on npm. If it runs in a browser, it runs in your game.",
  },
  {
    title: "Hire from the biggest talent pool",
    body: "Web developers already know how to build this. You're not hunting for the few people who enjoy hand-authoring engine UI.",
  },
  {
    title: "Agent-friendly by default",
    body: "It's just web code, so coding agents can read, write and refactor your UI the same way they work on any web app.",
  },
  {
    title: "Modding without the editor",
    body: "Mods are plain text and web files, so players can reskin and extend the UI without a multi-gigabyte editor install - and it's even easier with AngelScript.",
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
          <a href="#webkiln-examples">Examples</a>
          <a href="/webkiln/downloads/">Downloads</a>
          <a href="/webkiln/docs/">Documentation</a>
          <a href="/">JG Games</a>
        </nav>
      </header>

      <main className="wk-page">
        <section className="wk-hero" id="overview">
          <div className="wk-hero-copy">
            <h1>Build game UI with web tech.</h1>
            <p>
              Build your game's menus and HUDs with HTML, CSS and JavaScript. You
              iterate in seconds, lean on the entire web ecosystem, and keep
              heavy interfaces off the game thread to speed things up.
            </p>
            <div className="btn-group">
              <a href="/webkiln/docs/" className="btn btn-primary">
                Documentation
              </a>
              <a href="#webkiln-examples" className="btn btn-ghost">
                Examples
              </a>
            </div>
          </div>

          <figure className="wk-hero-figure" aria-label="First-person HUD example">
            <WebkilnFpsExample />
          </figure>
        </section>

        <WebkilnExamples />

        <section className="wk-capabilities" id="capabilities">
          <header>
            <h2>Build UI without fighting the engine.</h2>
            <p>
              Use the frontend skills your team already has to build interfaces
              that look great and adapt to any screen, hook them straight
              into what's happening in the game.
            </p>
          </header>

          <div className="wk-capability-index">
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
            <h2>The hard part shouldn't be the interface.</h2>
            <p>
              Build great interfaces with the
              polish of the modern web, and ship them in a fraction of the time.
            </p>
            <div className="btn-group">
              <a href="/webkiln/docs/?doc=quick-start" className="btn btn-primary">
                Getting started
              </a>
              <a href="mailto:contact@jggames.dev" className="btn btn-ghost">
                Contact JG Games
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="wk-footer">
        <span>Copyright JG Games 2026</span>
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
