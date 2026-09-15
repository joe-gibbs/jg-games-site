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
          <div className="try-hero-aside"><p>Game UI in HTML, CSS & JavaScript.</p><Actions placement="hero" /></div>
        </div>
        <video className="try-video" src="/webkiln/campaign/rpg-ui-video.mp4" poster="/webkiln/campaign/rpg-ui-poster.jpg" controls playsInline preload="none" onPlay={() => trackEvent('video_start')} aria-label="RPG interface demonstration" />
      </section>
      <section className="try-examples try-shell" aria-label="HTML interface examples">
        <div className="try-example-tabs"><div role="tablist" aria-label="Game type">{[['citybuilder', 'City builder'], ['shooter', 'Shooter'], ['racing', 'Racing']].map(([id, label]) => <button key={id} role="tab" id={`tab-${id}`} aria-selected={example === id} aria-controls="example-preview" onClick={() => setExample(id)}>{label}</button>)}</div></div>
        <div role="tabpanel" id="example-preview" aria-labelledby={`tab-${example}`}><img src={`/webkiln/campaign/${example}-capture.png`} width="1280" height="720" loading="lazy" alt={`${example === 'citybuilder' ? 'City builder' : example === 'shooter' ? 'Shooter' : 'Racing'} interface built with HTML and CSS`} /></div>
      </section>
      <section className="try-benefits try-shell" aria-label="Features">
        <article><h2>React ready.</h2></article>
        <article><h2>DevTools built in.</h2></article>
        <article><h2>Blueprint & C++ bindings.</h2></article>
      </section>
      <section className="try-evaluate try-shell" id="trial">
        <div><Actions placement="evaluate" /></div>
        <div className="try-trial">
          <div className="try-trial-controls"><select id="engine" aria-label="Engine version" value={engine} onChange={e => setEngine(e.target.value)}>{[...webkilnEngineReleases].reverse().map(release => <option key={release.engine} value={release.engine}>UE {release.engine}</option>)}</select><a className="try-button primary" href={actionUrl('trial', 'engine-selector', engine)}>Download trial <span aria-hidden="true">↓</span></a></div>
          <p>Watermarked · Editor only</p>
          <details><summary>Setup</summary><p>Windows · Direct3D 11 / 12. Disable the built-in Web Browser plugin.</p><a href="/webkiln/docs/?doc=quick-start">Installation guide ↗</a></details>
        </div>
      </section>
    </main>
    <footer className="try-footer try-shell"><span>© J G Games Pty Ltd</span><nav aria-label="Footer"><a href="mailto:contact@jggames.dev">Support</a></nav><details><summary>Privacy</summary><p>Visits, plays and clicks are counted by campaign. No cookies or stored IP addresses.</p></details></footer>
  </>;
}
