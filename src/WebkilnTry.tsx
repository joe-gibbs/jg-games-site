import { useEffect, useState } from 'react';
import WebkilnFpsExample from './components/WebkilnFpsExample';
import { webkilnEngineReleases } from './webkilnDownloads';
import { actionUrl, trackEvent } from './webkiln-tracking';

function Trial() {
  const [engine, setEngine] = useState('5.8');
  return <div className="try-trial-controls">
    <label className="try-engine">Unreal version
      <select aria-label="Unreal version" value={engine} onChange={event => setEngine(event.target.value)}>
        {[...webkilnEngineReleases].reverse().map(release => <option key={release.engine} value={release.engine}>UE {release.engine}</option>)}
      </select>
    </label>
    <a className="try-button primary" href={actionUrl('trial', 'hero', engine)}>Download free trial <span aria-hidden="true">↓</span></a>
  </div>;
}

export default function WebkilnTry() {
  useEffect(() => { trackEvent('page_view'); }, []);
  return <>
    <header className="try-header try-shell">
      <a className="try-brand" href="/webkiln/"><img src="/webkiln-logo.svg" alt="" />Webkiln</a>
      <nav aria-label="Main navigation"><a href="/webkiln/docs/">Docs ↗</a><a href="#buy">Pricing</a></nav>
    </header>
    <main>
      <section className="try-hero try-shell">
        <div className="try-hero-top">
          <div className="try-hero-copy">
            <p className="try-eyebrow">GPU acceleration included</p>
            <h1>Build game UI<br /><span>with HTML & CSS.</span></h1>
            <p className="try-intro">Bring your web UI into Unreal. Connect React or plain HTML to gameplay with Blueprint and C++.</p>
          </div>
          <div className="try-hero-aside" id="trial">
            <h2>Try it in your project.</h2>
            <p>Build and test your own UI before you buy.</p>
            <Trial />
            <p className="try-compatibility">For Unreal 4.25–5.8 on Windows.</p>
            <a className="try-text-link" href={actionUrl('demo', 'hero')}>Or try the standalone demo <span>697 MB ↓</span></a>
          </div>
        </div>
        <figure className="try-live-demo">
          <WebkilnFpsExample controls onPlay={() => trackEvent('video_start')} />
          <figcaption>Gameplay updates the HUD. JavaScript adds an objective while the game runs.</figcaption>
        </figure>
      </section>
      <section className="try-benefits try-shell" aria-label="Features">
        <article><h2>Style it once.</h2><p>Share CSS across menus and HUDs. Use React, your existing components and the web libraries you already know.</p></article>
        <article><h2>Connect to gameplay.</h2><p>Send health, ammo and inventory data to your UI. Have button clicks call Blueprint or C++ functions.</p></article>
        <article><h2>Inspect as you build.</h2><p>Use DevTools to inspect elements, test CSS changes and debug JavaScript while your game runs.</p></article>
      </section>
      <section className="try-proof try-shell">
        <p className="try-eyebrow">Used in production</p>
        <h2>Built for Fall of an Empire.</h2>
        <p>Webkiln powers the data-heavy screens and modals in our grand strategy game. The same plugin brings web interfaces into your project.</p>
        <a className="try-text-link" href="https://store.steampowered.com/app/1830290/Fall_of_an_Empire/" target="_blank" rel="noopener noreferrer">See the game ↗</a>
      </section>
      <section className="try-buy try-shell" id="buy">
        <div className="try-buy-copy">
          <h2>Acceleration comes<br />with the plugin.</h2>
          <p>GPU-accelerated rendering is included in your packaged games. No separate acceleration licence to buy.</p>
          <ul>
            <li>HTML, CSS, JavaScript and React</li>
            <li>Two-way Blueprint and C++ communication</li>
            <li>HUDs, world-space UI and Unreal textures</li>
          </ul>
        </div>
        <div className="try-offer">
          <h3>Get Webkiln</h3>
          <p className="try-price"><span>From</span> US$99.99</p>
          <p>Personal and Professional licences on Fab. Regional prices and taxes vary.</p>
          <a className="try-button primary" href={actionUrl('fab', 'evaluate')} target="_blank" rel="noopener noreferrer">Buy on Fab <span aria-hidden="true">↗</span></a>
          <a className="try-text-link" href="#trial">Try it in your project first ↑</a>
        </div>
      </section>
    </main>
    <footer className="try-footer try-shell"><span>© J G Games Pty Ltd</span><nav aria-label="Footer"><a href="/webkiln/docs/">Documentation</a><a href="mailto:contact@jggames.dev">Support</a></nav><details><summary>Privacy</summary><p>Visits, plays and clicks are counted by campaign. No cookies or stored IP addresses.</p></details></footer>
  </>;
}
