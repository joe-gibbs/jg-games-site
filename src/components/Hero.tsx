import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="hero" id="top">
      <div className="hero-inner shell">
        <div className="hero-brand">
          <img src="/logo.png" alt="" className="hero-logo" />
          <h1 className="hero-title">JG Games</h1>
        </div>

        <nav className="hero-nav" aria-label="Main sections">
          <a href="#fall-of-an-empire">Fall of an Empire</a>
          <a href="/webkiln/">Webkiln</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </section>
  );
};

export default Hero;
