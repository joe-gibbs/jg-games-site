import React from "react";

const WebkilnSection: React.FC = () => {
  return (
    <section className="webkiln-section webkiln-teaser" id="webkiln">
      <div className="webkiln-grid shell">
        <div className="webkiln-copy">
          <div className="webkiln-heading">
            <img src="/webkiln-logo.svg" alt="" className="webkiln-logo" />
            <div>
              <h2 className="webkiln-title">Webkiln</h2>
            </div>
          </div>

          <p className="webkiln-lead">
            Build Unreal Engine HUDs, menus and world-space interfaces with
            HTML, CSS, JavaScript and React.
          </p>
          <p className="webkiln-summary">
            Webkiln embeds accelerated Chromium in Slate and UMG, with a typed
            bridge to Blueprint and C++.
          </p>

          <div className="btn-group">
            <a href="/webkiln/" className="btn btn-primary">
              Explore Webkiln
            </a>
            <a href="/webkiln/docs/" className="btn btn-ghost">
              Documentation
            </a>
          </div>
        </div>

        <a
          className="webkiln-teaser-media"
          href="/webkiln/"
          aria-label="Explore Webkiln"
        >
          <video
            src="/webkiln/showcase/fps-demo.mp4"
            poster="/webkiln/showcase/fps-demo-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <span>Web UI running inside Unreal Engine</span>
        </a>
      </div>
    </section>
  );
};

export default WebkilnSection;
