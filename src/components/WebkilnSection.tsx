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
            Build Unreal menus and HUDs with HTML, CSS, JavaScript and React.
          </p>
          <p className="webkiln-summary">
            Webkiln puts that interface in the running game and lets it talk
            to Blueprint and C++.
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
        </a>
      </div>
    </section>
  );
};

export default WebkilnSection;
