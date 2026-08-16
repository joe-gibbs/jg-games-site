import React from "react";

const GameSection: React.FC = () => {
  return (
    <section className="game-section" id="fall-of-an-empire">
      <div className="video-background" aria-hidden="true">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src="/seasons.webm" type="video/webm" />
        </video>
        <div className="vignette-overlay" />
      </div>

      <div className="game-inner">
        <div className="game-content">
          <h2 className="game-title">Fall of an Empire</h2>

          <p className="game-lead">
            The empire is dying. You&rsquo;ve seized the throne. Survival is
            victory.
          </p>

          <p className="game-body">
            A grand strategy game of decline. Manage a crumbling realm, navigate
            treacherous politics, and hold back the inevitable collapse. Your
            rule will not last forever. How long can you halt the fall?
          </p>

          <div className="btn-group">
            <a
              href="https://store.steampowered.com/app/1830290/Fall_of_an_Empire/"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Play on Steam
            </a>
            <a
              href="https://fallofanempiregame.com/"
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Website
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSection;
