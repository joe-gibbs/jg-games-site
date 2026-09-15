import { useEffect, useState } from 'react';
import { webkilnEngineReleases } from './webkilnDownloads';
import { actionUrl, trackEvent } from './webkiln-tracking';

function Actions({ placement }: { placement: string }) {
  return <div className="try-actions">
    <a className="try-button primary" href={actionUrl('demo', placement)}>Try the demo <span aria-hidden="true">↓</span></a>
    <a className="try-button secondary" href={actionUrl('fab', placement)} target="_blank" rel="noopener">Buy on Fab <span aria-hidden="true">↗</span></a>
  </div>;
}

export default function WebkilnTry() {
  const [engine, setEngine] = useState('5.8');
  const [example, setExample] = useState('citybuilder');
  useEffect(() => { trackEvent('page_view'); }, []);
  return <>
    <header className="try-header try-shell">
      <a className="try-brand" href="/webkiln/"><img src="/webkiln-logo.svg" alt="" />Webkiln</a>
      <nav aria-label="Main navigation"><a href="/webkiln/docs/">Docs ↗</a><a href="#trial">Get the plugin</a></nav>
    </header>
    <main>
      <section className="try-hero try-shell">
        <div className="try-hero-top">
          <h1>Your UI.<br /><span>Your web stack.</span></h1>
          <div className="try-hero-aside"><p>Build menus and HUDs with HTML, CSS and JavaScript.</p><Actions placement="hero" /></div>
        </div>
        <video className="try-video" src="/webkiln/campaign/rpg-ui-video.mp4" poster="/webkiln/campaign/rpg-ui-poster.jpg" controls playsInline preload="none" onPlay={() => trackEvent('video_start')} aria-label="RPG interface demonstration" />
      </section>
      <section className="try-examples try-shell" aria-label="HTML interface examples">
        <div className="try-example-tabs"><span>HTML interface examples</span><div role="tablist" aria-label="Game type">{[['citybuilder', 'City builder'], ['shooter', 'Shooter'], ['racing', 'Racing']].map(([id, label]) => <button key={id} role="tab" id={`tab-${id}`} aria-selected={example === id} aria-controls="example-preview" onClick={() => setExample(id)}>{label}</button>)}</div></div>
        <div role="tabpanel" id="example-preview" aria-labelledby={`tab-${example}`}><img src={`/webkiln/campaign/${example}-capture.png`} width="1280" height="720" loading="lazy" alt={`${example === 'citybuilder' ? 'City builder' : example === 'shooter' ? 'Shooter' : 'Racing'} interface built with HTML and CSS`} /></div>
      </section>
      <section className="try-benefits try-shell" aria-label="Features">
        <article><h2>Your web stack.</h2><p>React, plain HTML, or your favourite JavaScript framework.</p></article>
        <article><h2>Your DevTools.</h2><p>Inspect elements, edit CSS and debug JavaScript in-game.</p></article>
        <article><h2>Your game data.</h2><p>Connect your UI to Blueprints and C++.</p></article>
      </section>
      <section className="try-evaluate try-shell" id="trial">
        <div><h2>Put it in<br />your project.</h2><Actions placement="evaluate" /></div>
        <div className="try-trial">
          <label htmlFor="engine">Engine version</label>
          <div className="try-trial-controls"><select id="engine" value={engine} onChange={e => setEngine(e.target.value)}>{[...webkilnEngineReleases].reverse().map(release => <option key={release.engine} value={release.engine}>{release.engine}</option>)}</select><a className="try-button primary" href={actionUrl('trial', 'engine-selector', engine)}>Download trial <span aria-hidden="true">↓</span></a></div>
          <p>Watermarked. Editor only. Full version on Fab.</p>
          <details><summary>Compatibility & setup</summary><p>Windows · Direct3D 11 / 12 · UE 4.25–5.8. Disable the built-in Web Browser plugin before installing.</p><a href="/webkiln/docs/?doc=quick-start">Installation guide ↗</a></details>
        </div>
      </section>
    </main>
    <footer className="try-footer try-shell"><span>© J G Games Pty Ltd</span><nav aria-label="Footer"><a href="/webkiln/docs/">Docs</a><a href="mailto:contact@jggames.dev">Support</a></nav><details><summary>Analytics</summary><p>We count visits, video plays and demo, trial and Fab clicks with campaign tags and a page-scoped ID. No analytics cookies or stored IP addresses. Activity on Fab is not tracked.</p></details></footer>
  </>;
}
