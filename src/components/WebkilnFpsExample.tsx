import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);

const fpsSource = `<div class="hud">
  <output id="health"></output>
  <output id="ammo"></output>
  <aside id="objective" hidden></aside>
</div>

<script>
gameUI.on("fps.hud", state => {
  health.value = state.health;
  ammo.value = state.bullets + " / " + state.magazineSize;
});`;

const fpsObjectiveSource = `gameUI.on("fps.demo.element", data => {
  objective.textContent = data.title;
  objective.hidden = false;
});`;

const fpsClosingSource = `</script>`;
const fpsObjectiveAt = 21.35;

const WebkilnFpsExample = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [fpsObjectiveAdded, setFpsObjectiveAdded] = useState(false);
  const fpsVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const syncCodeToVideo = () => {
      const video = fpsVideoRef.current;
      if (video) {
        const objectiveIsVisible = video.currentTime >= fpsObjectiveAt;
        setFpsObjectiveAdded(current => current === objectiveIsVisible ? current : objectiveIsVisible);
      }
      frame = requestAnimationFrame(syncCodeToVideo);
    };
    frame = requestAnimationFrame(syncCodeToVideo);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const highlightedFpsSource = hljs.highlight(
    fpsSource,
    { language: "xml", ignoreIllegals: true },
  ).value;
  const highlightedObjectiveSource = hljs.highlight(
    fpsObjectiveSource,
    { language: "javascript", ignoreIllegals: true },
  ).value;
  const highlightedFpsClosingSource = hljs.highlight(
    fpsClosingSource,
    { language: "xml", ignoreIllegals: true },
  ).value;

  return (
    <section className="webkiln-examples webkiln-fps-example">
      <div className="shell">
        <article className="example-block">
          <header className="example-intro">
            <h3>First-person HUD</h3>
            <p>Health, ammunition and score come from Epic's running First Person Shooter sample.</p>
          </header>

          <div className="live-example">
            <div className="code-demo">
              <div className="demo-bar">
                <span>hud.html</span>
                <span className="demo-language">HTML</span>
              </div>
              <pre className="source-code fps-source" aria-label="First-person HUD HTML and JavaScript">
                <code className="hljs language-html" dangerouslySetInnerHTML={{ __html: highlightedFpsSource }} />
                <code
                  className={`hljs language-javascript code-addition${fpsObjectiveAdded ? " is-visible" : ""}`}
                  dangerouslySetInnerHTML={{ __html: highlightedObjectiveSource }}
                />
                <code className="hljs language-html" dangerouslySetInnerHTML={{ __html: highlightedFpsClosingSource }} />
              </pre>
            </div>

            <div className="real-unreal-capture" aria-label="Webkiln HUD running in Unreal Engine's First Person Shooter sample">
              <video
                ref={fpsVideoRef}
                className="capture-video"
                src="/webkiln/showcase/fps-demo.mp4"
                poster="/webkiln/showcase/fps-demo-poster.jpg"
                autoPlay={!reducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="The Webkiln HUD running in Unreal Engine's First Person Shooter sample"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default WebkilnFpsExample;
