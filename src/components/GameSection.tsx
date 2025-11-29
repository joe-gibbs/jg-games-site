import React from "react";
import FadeIn from "./FadeIn";

const GameSection: React.FC = () => {
  return (
    <section
      className="full-height game-section relative"
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        display: "flex",
      }}
    >
      {/* Video Background */}
      <div className="video-background">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src="/seasons.webm" type="video/webm" />
        </video>
        <div className="vignette-overlay"></div>
      </div>

      <div
        className="content-relative z-10 text-left"
        style={{ width: "100%", paddingLeft: "5rem", boxSizing: "border-box" }}
      >
        <FadeIn>
          <h2
            className="title text-white drop-shadow"
            style={{ textAlign: "left", margin: 0 }}
          >
            Fall of an Empire
          </h2>
          <p
            className="subtitle text-white drop-shadow"
            style={{
              maxWidth: "700px",
              margin: "1.5rem 0",
              textAlign: "left",
              lineHeight: "1.6",
            }}
          >
            The empire is dying. You’ve seized the throne. Survival is victory.
          </p>
          <p
            className="subtitle text-white drop-shadow"
            style={{
              maxWidth: "650px",
              fontSize: "1.1rem",
              margin: "0 0 2rem 0",
              textAlign: "left",
              lineHeight: "1.6",
              opacity: 0.9,
            }}
          >
            Defy history in a grand strategy game of survival. Manage a
            crumbling realm, navigate treacherous politics, and hold back the
            inevitable collapse. Your rule will not last forever - how long can
            you halt the decline?
          </p>
          <div className="btn-group" style={{ justifyContent: "flex-start" }}>
            <a
              href="https://store.steampowered.com/app/1830290/Fall_of_an_Empire/"
              className="btn text-white border-white hover:bg-white hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              Steam
            </a>
            <a
              href="https://fallofanempiregame.com/"
              className="btn text-white border-white hover:bg-white hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default GameSection;
