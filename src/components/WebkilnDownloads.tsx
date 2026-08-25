import {
  webkilnEngineReleases,
  webkilnPackagedDemoUrl,
  webkilnProductVersion,
} from "../webkilnDownloads";

function DownloadAction({ href, label }: { href: string; label: string }) {
  if (!href) {
    return (
      <span className="wk-download-pending" aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <a className="wk-download-link" href={href}>
      {label}
    </a>
  );
}

const WebkilnDownloads = () => {
  return (
    <>
      <header className="wk-site-header">
        <a className="wk-brand" href="/webkiln/" aria-label="Webkiln home">
          <img src="/webkiln-logo.svg" alt="" />
          <span>Webkiln</span>
        </a>
        <nav aria-label="Webkiln navigation">
          <a href="/webkiln/">Home</a>
          <a href="/webkiln/downloads/" aria-current="page">Downloads</a>
          <a href="/webkiln/docs/">Documentation</a>
          <a href="/">JG Games</a>
        </nav>
      </header>

      <main className="wk-page">
        <section className="wk-downloads">
          <header>
            <h1>Downloads</h1>
            <p>
              Download a trial of {webkilnProductVersion} for Windows.
              The FPS sample project is for Unreal Engine 5.7 and 5.8.
            </p>
            <p>
              Watermarked trial plugins and the FPS sample run in the editor.
              They cannot be packaged: those zips ship editor binaries only,
              with no plugin source, so the watermark cannot be stripped.
              Use a licensed Fab build to package a game, or grab the packaged
              demo below.
            </p>
          </header>

          <div className="wk-download-packaged">
            <div>
              <h2>Packaged demo</h2>
              <p>A packaged build of the FPS sample.</p>
            </div>
            <DownloadAction href={webkilnPackagedDemoUrl} label="Download demo" />
          </div>

          <div className="wk-download-list">
            {webkilnEngineReleases.map((release) => (
              <article key={release.engine}>
                <h2>Unreal Engine {release.engine}</h2>
                <div className="wk-download-actions">
                  <DownloadAction href={release.trialUrl} label="Trial plugin" />
                  {release.sampleUrl !== undefined ? (
                    <DownloadAction href={release.sampleUrl} label="FPS sample" />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="wk-footer">
        <span>Copyright JG Games 2026</span>
        <nav aria-label="Footer navigation">
          <a href="/webkiln/docs/">Documentation</a>
          <a href="https://discord.gg/HZkcDwkdBU" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="mailto:contact@jggames.dev">Contact</a>
          <a href="/">JG Games</a>
        </nav>
      </footer>
    </>
  );
};

export default WebkilnDownloads;
