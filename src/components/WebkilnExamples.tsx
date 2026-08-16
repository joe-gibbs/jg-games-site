import { useEffect, useLayoutEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);

const hotReloadHtml = `<main class="hud">
  <section class="player-panel">
    <header>
      <span class="level">18</span>
      <div><strong>Mara Vale</strong><small>Wayfarer</small></div>
    </header>
    <label><img src="/webkiln/showcase/hud-icons/vitality.png" alt=""><span>Vitality</span><i class="meter vitality"><b id="vitality-fill"></b></i><output id="vitality-value">72</output></label>
    <label><img src="/webkiln/showcase/hud-icons/focus.png" alt=""><span>Focus</span><i class="meter focus"><b id="focus-fill"></b></i><output id="focus-value">68</output></label>
    <label><img src="/webkiln/showcase/hud-icons/stamina.png" alt=""><span>Stamina</span><i class="meter stamina"><b id="stamina-fill"></b></i><output id="stamina-value">84</output></label>
  </section>

  <nav class="compass">
    <span>W</span><i></i><strong>N</strong><i></i><span>E</span>
  </nav>

  <aside class="quest">
    <img src="/webkiln/showcase/hud-icons/quest.png" alt="">
    <div><strong>The Old Road</strong><span>Reach the watchtower</span></div>
  </aside>

  <p class="location">Greyfen Road</p>

  <aside class="equipment">
    <p id="weapon-row"><img id="weapon-icon" src="/webkiln/showcase/hud-icons/sword.png" alt=""><span><strong id="weapon-name">Iron sword</strong><small>Main hand</small></span></p>
    <p id="offhand-row"><img src="/webkiln/showcase/hud-icons/shield.png" alt=""><span><strong id="offhand-name">Oak shield</strong><small>Off hand</small></span></p>
    <p id="quick-row"><img id="quick-icon" src="/webkiln/showcase/hud-icons/flask.png" alt=""><span><strong id="quick-name">Red flask · 3</strong><small>Quick item</small></span></p>
  </aside>

  <button class="inventory-toggle" id="inventory-toggle" type="button" aria-controls="inventory-panel" aria-expanded="false">
    <span>Inventory</span>
  </button>

  <section class="inventory-panel" id="inventory-panel" aria-label="Inventory" aria-hidden="true">
    <header>
      <div><h2>Inventory</h2></div>
      <button id="inventory-close" type="button" aria-label="Close inventory"><span aria-hidden="true">×</span></button>
    </header>
    <div class="inventory-columns">
      <section class="inventory-group">
        <h3>Equipment</h3>
        <div class="inventory-items">
          <button data-item="sword" type="button"><img src="/webkiln/showcase/hud-icons/sword.png" alt=""><span><strong>Iron sword</strong><small>Main hand</small></span><em>Equipped</em></button>
          <button data-item="shield" type="button"><img src="/webkiln/showcase/hud-icons/shield.png" alt=""><span><strong>Oak shield</strong><small>Off hand</small></span><em>Equipped</em></button>
          <button data-item="bow" type="button"><img src="/webkiln/showcase/hud-icons/bow.png" alt=""><span><strong>Hunting bow</strong><small>Main hand</small></span><em></em></button>
        </div>
      </section>
      <section class="inventory-group">
        <h3>Supplies</h3>
        <div class="inventory-items">
          <button data-item="flask" type="button"><img src="/webkiln/showcase/hud-icons/flask.png" alt=""><span><strong>Red flask · 3</strong><small>Quick item</small></span><em>Assigned</em></button>
          <button data-item="torch" type="button"><img src="/webkiln/showcase/hud-icons/torch.png" alt=""><span><strong>Traveller's torch</strong><small>Quick item</small></span><em></em></button>
        </div>
      </section>
    </div>
    <output id="inventory-status" aria-live="polite">Choose an item to change your loadout</output>
  </section>

  <p class="coins"><img src="/webkiln/showcase/hud-icons/coins.png" alt=""><span>Coins</span><strong id="coin-count">1,248</strong></p>
</main>`;

const hotReloadCss = `.hud, .hud * { box-sizing: border-box; }
.hud {
  position: absolute;
  inset: 0;
  color: #fff;
  font-family: "Outfit", "Trebuchet MS", sans-serif;
  text-shadow: 0 2px 2px #000, 0 0 6px #000;
}
.player-panel header strong,
.quest strong,
.equipment strong,
.inventory-toggle,
.inventory-panel h2,
.inventory-group h3,
.inventory-items strong {
  font-family: "Marcellus", Georgia, serif;
  letter-spacing: 0.015em;
}

.player-panel {
  position: absolute;
  top: 28px;
  left: 28px;
  width: 246px;
  padding: 22px;
  background: url("/webkiln/showcase/hud-brushes/brush-panel-soft-edge.png") center / 100% 100% no-repeat;
}
.player-panel header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 52%);
}
.player-panel header div { display: grid; }
.player-panel header strong { font-size: 16px; font-weight: 650; }
.player-panel header small { color: rgb(255 255 255 / 76%); font-size: 10px; }
.level {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  background: url("/webkiln/showcase/hud-brushes/brush-slot-soft.png") center / 145% 145% no-repeat;
  font-size: 14px;
  font-weight: 700;
}
.player-panel label {
  display: grid;
  grid-template-columns: 16px 50px 1fr 24px;
  gap: 7px;
  align-items: center;
  margin-top: 7px;
  color: #fff;
  font-size: 10px;
}
.player-panel label img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  opacity: 1;
}
.player-panel label output { text-align: right; font-size: 10px; font-weight: 700; }
.meter {
  display: block;
  height: 8px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 58%);
  background: #050505;
}
.meter b {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: left;
  transition: transform 180ms ease;
}
.meter.vitality b { background: #c24e43; transform: scaleX(0.72); }
.meter.focus b { background: #5f8fc4; transform: scaleX(0.68); }
.meter.stamina b { background: #91a958; transform: scaleX(0.84); }

.compass {
  position: absolute;
  top: 22px;
  left: 50%;
  display: grid;
  grid-template-columns: auto 38px auto 38px auto;
  gap: 7px;
  align-items: center;
  padding: 12px 19px;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 155% no-repeat;
  color: rgb(255 255 255 / 82%);
  font-size: 10px;
  transform: translateX(-50%);
}
.compass i { height: 1px; background: rgb(255 255 255 / 56%); }
.compass strong { color: #fff; font-size: 12px; }

.location {
  position: absolute;
  top: 61px;
  left: 50%;
  margin: 0;
  padding: 8px 15px;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 180% no-repeat;
  color: #fff;
  font-size: 10px;
  transform: translateX(-50%);
}

.quest {
  position: absolute;
  top: 28px;
  right: 28px;
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  width: 264px;
  padding: 21px 22px;
  background: url("/webkiln/showcase/hud-brushes/brush-panel-soft-edge.png") center / 100% 100% no-repeat;
  text-align: right;
}
.quest img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 1;
}
.quest strong { display: block; font-size: 16px; font-weight: 650; }
.quest span { display: block; margin-top: 3px; font-size: 11px; }

.equipment {
  position: absolute;
  bottom: 26px;
  left: 28px;
  display: grid;
  gap: 2px;
  width: 190px;
}
.equipment p {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 9px;
  align-items: center;
  margin: 0;
  padding: 13px 16px;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 180% no-repeat;
}
.equipment img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 1;
}
.equipment small { display: block; color: rgb(255 255 255 / 74%); font-size: 9px; }
.equipment strong { display: block; margin-bottom: 2px; font-size: 12px; font-weight: 650; }
.equipment p.is-changing {
  animation: loadout-change 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.inventory-toggle {
  position: absolute;
  bottom: 26px;
  left: 50%;
  min-width: 150px;
  padding: 13px 26px;
  border: 0;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 190% no-repeat;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transform: translateX(-50%);
}
.inventory-toggle:hover,
.inventory-toggle[aria-expanded="true"] {
  color: #f2ddb0;
  transform: translateX(-50%) translateY(-2px);
}

.inventory-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: min(540px, calc(100% - 56px));
  gap: 13px;
  padding: 28px 36px 30px;
  background:
    url("/webkiln/showcase/hud-brushes/brush-panel-soft-edge.png") center / 100% 100% no-repeat,
    url("/webkiln/showcase/hud-brushes/brush-panel-soft-edge.png") center / 100% 100% no-repeat;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, calc(-50% + 14px)) scale(0.985);
  transition:
    opacity 220ms ease,
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear 300ms;
  visibility: hidden;
}
.inventory-panel.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
  transition-delay: 0s;
  visibility: visible;
}
.inventory-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px 11px;
  border-bottom: 1px solid rgb(218 197 149 / 52%);
}
.inventory-panel h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 400;
}
.inventory-panel header button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  background: url("/webkiln/showcase/hud-brushes/brush-slot-soft.png") center / 190% 190% no-repeat;
  color: rgb(255 255 255 / 72%);
  font: 19px/1 "Marcellus", Georgia, serif;
  cursor: pointer;
  transition: color 160ms ease, transform 180ms ease;
}
.inventory-panel header button:hover {
  color: #f2ddb0;
  transform: scale(1.08) rotate(2deg);
}
.inventory-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.inventory-group h3 {
  margin: 0 0 5px;
  padding-left: 4px;
  color: rgb(226 208 167 / 76%);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.inventory-items {
  display: grid;
  gap: 6px;
}
.inventory-group:first-child .inventory-items { grid-template-columns: repeat(3, 1fr); }
.inventory-group:last-child .inventory-items { grid-template-columns: repeat(2, 1fr); }
.inventory-items button {
  display: grid;
  min-height: 66px;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px 13px;
  border: 0;
  background: url("/webkiln/showcase/hud-brushes/brush-slot-soft.png") center / 126% 158% no-repeat;
  color: rgb(255 255 255 / 88%);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: color 160ms ease, transform 180ms ease;
}
.inventory-items button:hover {
  color: #fff;
  transform: translateX(3px);
}
.inventory-items button.is-equipped {
  color: #f2ddb0;
}
.inventory-items button.is-just-equipped {
  animation: inventory-pick 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.inventory-items button img {
  width: 25px;
  height: 25px;
  object-fit: contain;
  grid-row: 1 / span 2;
}
.inventory-items button span { display: grid; }
.inventory-items strong { font-size: 11px; font-weight: 400; }
.inventory-items small {
  color: rgb(255 255 255 / 62%);
  font-size: 9px;
}
.inventory-items em {
  min-height: 11px;
  grid-column: 2;
  color: #d9c18b;
  font-size: 8px;
  font-style: normal;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.inventory-panel.is-open .inventory-items button {
  animation: inventory-item-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.inventory-panel.is-open .inventory-group:first-child button:nth-child(1) { animation-delay: 70ms; }
.inventory-panel.is-open .inventory-group:first-child button:nth-child(2) { animation-delay: 110ms; }
.inventory-panel.is-open .inventory-group:first-child button:nth-child(3) { animation-delay: 150ms; }
.inventory-panel.is-open .inventory-group:last-child button:nth-child(1) { animation-delay: 120ms; }
.inventory-panel.is-open .inventory-group:last-child button:nth-child(2) { animation-delay: 165ms; }
.inventory-panel.is-open .inventory-items button.is-just-equipped {
  animation: inventory-pick 420ms cubic-bezier(0.16, 1, 0.3, 1);
  animation-delay: 0ms;
}
.inventory-panel > output {
  padding: 10px 16px;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 175% no-repeat;
  color: rgb(255 255 255 / 82%);
  font-size: 10px;
  text-align: center;
}
.inventory-panel > output.is-changing {
  animation: status-change 320ms ease;
}

@keyframes inventory-item-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes inventory-pick {
  0% { opacity: 0.72; transform: scale(0.97); }
  55% { opacity: 1; transform: translateX(4px) scale(1.015); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes loadout-change {
  0% { opacity: 0.35; transform: translateX(-7px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes status-change {
  0% { opacity: 0.35; transform: translateY(3px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .inventory-panel,
  .inventory-panel header button,
  .inventory-items button,
  .inventory-panel.is-open .inventory-items button,
  .inventory-panel.is-open .inventory-items button.is-just-equipped,
  .equipment p.is-changing,
  .inventory-panel > output.is-changing {
    animation: none;
    transition: none;
  }
}
.coins {
  position: absolute;
  right: 28px;
  bottom: 28px;
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 0;
  padding: 11px 16px;
  background: url("/webkiln/showcase/hud-brushes/brush-strip-soft-edge.png") center / 100% 190% no-repeat;
  color: rgb(255 255 255 / 82%);
  font-size: 10px;
}
.coins img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 1;
}
.coins strong { color: #fff; font-size: 14px; }
`;

const hotReloadJs = `const inventory = new EventTarget();
const itemButtons = [...document.querySelectorAll(".inventory-items button")];
const inventoryPanel = document.querySelector("#inventory-panel");
const inventoryToggle = document.querySelector("#inventory-toggle");
const inventoryClose = document.querySelector("#inventory-close");
const inventoryStatus = document.querySelector("#inventory-status");
const equipmentRows = {
  weapon: document.querySelector("#weapon-row"),
  offhand: document.querySelector("#offhand-row"),
  quick: document.querySelector("#quick-row")
};
const handlers = [];
const timers = [];
const state = {
  weapon: "Iron sword",
  weaponIcon: "sword",
  offhand: "Oak shield",
  quickItem: "Red flask · 3",
  quickIcon: "flask",
  lastItem: "",
  lastSlot: ""
};

function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function render(event) {
  const next = event.detail;
  document.querySelector("#weapon-name").textContent = next.weapon;
  document.querySelector("#weapon-icon").src = "/webkiln/showcase/hud-icons/" + next.weaponIcon + ".png";
  document.querySelector("#offhand-name").textContent = next.offhand;
  document.querySelector("#quick-name").textContent = next.quickItem;
  document.querySelector("#quick-icon").src = "/webkiln/showcase/hud-icons/" + next.quickIcon + ".png";
  itemButtons.forEach(button => {
    const item = button.dataset.item;
    const equipped = item === next.weaponIcon
      || (item === "shield" && next.offhand === "Oak shield")
      || item === next.quickIcon;
    button.classList.toggle("is-equipped", equipped);
    button.querySelector("em").textContent = equipped
      ? (item === "flask" || item === "torch" ? "Assigned" : "Equipped")
      : "";
    if (item === next.lastItem) replayAnimation(button, "is-just-equipped");
  });
  inventoryStatus.textContent = next.message;
  if (next.lastSlot) replayAnimation(equipmentRows[next.lastSlot], "is-changing");
  if (next.lastItem) replayAnimation(inventoryStatus, "is-changing");
}

function update(message) {
  inventory.dispatchEvent(new CustomEvent("change", {
    detail: { ...state, message }
  }));
}

function setInventoryOpen(open) {
  inventoryPanel.classList.toggle("is-open", open);
  inventoryPanel.setAttribute("aria-hidden", String(!open));
  inventoryToggle.setAttribute("aria-expanded", String(open));
}

function equip(button, cancelAnimation = true) {
  if (cancelAnimation) cancelDemo();
  state.lastItem = button.dataset.item;
  switch (button.dataset.item) {
    case "sword":
      state.weapon = "Iron sword";
      state.weaponIcon = "sword";
      state.lastSlot = "weapon";
      update("Iron sword equipped");
      break;
    case "shield":
      state.offhand = "Oak shield";
      state.lastSlot = "offhand";
      update("Oak shield equipped");
      break;
    case "bow":
      state.weapon = "Hunting bow";
      state.weaponIcon = "bow";
      state.lastSlot = "weapon";
      update("Hunting bow equipped");
      break;
    case "flask":
      state.quickItem = "Red flask · 3";
      state.quickIcon = "flask";
      state.lastSlot = "quick";
      update("Red flask assigned");
      break;
    case "torch":
      state.quickItem = "Traveller's torch";
      state.quickIcon = "torch";
      state.lastSlot = "quick";
      update("Traveller's torch assigned");
  }
}

function cancelDemo() {
  while (timers.length) clearTimeout(timers.pop());
}

itemButtons.forEach(button => {
  const handler = () => {
    equip(button);
  };
  handlers.push([button, handler]);
  button.addEventListener("click", handler);
});

const toggleHandler = () => {
  cancelDemo();
  setInventoryOpen(!inventoryPanel.classList.contains("is-open"));
};
const closeHandler = () => {
  cancelDemo();
  setInventoryOpen(false);
};
inventoryToggle.addEventListener("click", toggleHandler);
inventoryClose.addEventListener("click", closeHandler);

const keyHandler = event => {
  if (event.key !== "Escape" || !inventoryPanel.classList.contains("is-open")) return;
  setInventoryOpen(false);
};
document.addEventListener("keydown", keyHandler);
inventory.addEventListener("change", render);

update("Choose an item to change your loadout");
timers.push(setTimeout(() => setInventoryOpen(true), 450));
timers.push(setTimeout(() => equip(itemButtons[2], false), 1350));

window.__hudCleanup = () => {
  cancelDemo();
  document.removeEventListener("keydown", keyHandler);
  inventory.removeEventListener("change", render);
  inventoryToggle.removeEventListener("click", toggleHandler);
  inventoryClose.removeEventListener("click", closeHandler);
  handlers.forEach(([button, handler]) => button.removeEventListener("click", handler));
};`;

const hotReloadFiles = [
  { name: "hud.html", label: "HTML", language: "xml", source: hotReloadHtml, step: 6, delay: 16 },
  { name: "hud.css", label: "CSS", language: "css", source: hotReloadCss, step: 14, delay: 7 },
  { name: "hud.js", label: "JavaScript", language: "javascript", source: hotReloadJs, step: 6, delay: 14 },
] as const;

const previewDocument = `<!doctype html>
<html><head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<style>
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #111; }
body { position: relative; }
.game-view {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
#hud-root { position: absolute; inset: 0; overflow: hidden; }
</style><style id="hot-style"></style></head>
<body><video class="game-view" autoplay muted loop playsinline preload="auto" poster="/webkiln/showcase/rpg-hud-gameplay.png"><source src="/webkiln/showcase/rpg-hud-gameplay-loop.mp4" type="video/mp4"></video><div id="hud-root"></div></body></html>`;

type PreviewWindow = Window & { __hudCleanup?: () => void };

const WebkilnExamples = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lastHotReloadPhase = hotReloadFiles.length - 1;
  const [hotReloadStarted, setHotReloadStarted] = useState(false);
  const [hotReloadComplete, setHotReloadComplete] = useState(false);
  const [hotReloadPhase, setHotReloadPhase] = useState(0);
  const [selectedHotReloadTab, setSelectedHotReloadTab] = useState(0);
  const [editedSources, setEditedSources] = useState<string[]>(() => hotReloadFiles.map(file => file.source));
  const [typedCharacterCount, setTypedCharacterCount] = useState(0);
  const [previewLoadCount, setPreviewLoadCount] = useState(0);
  const hotReloadExampleRef = useRef<HTMLElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const hotReloadCodeRef = useRef<HTMLPreElement>(null);
  const hotReloadStartedRef = useRef(false);
  const lastAppliedPhaseRef = useRef(-1);

  useEffect(() => {
    const example = hotReloadExampleRef.current;
    if (!example) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hotReloadStartedRef.current) return;

      hotReloadStartedRef.current = true;
      if (reducedMotion) {
        setHotReloadPhase(lastHotReloadPhase);
        setSelectedHotReloadTab(lastHotReloadPhase);
        setTypedCharacterCount(hotReloadFiles[lastHotReloadPhase].source.length);
        setHotReloadComplete(true);
      }
      setHotReloadStarted(true);
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(example);
    return () => observer.disconnect();
  }, [lastHotReloadPhase, reducedMotion]);

  useEffect(() => {
    if (!hotReloadStarted || hotReloadComplete || reducedMotion) return;

    const file = hotReloadFiles[hotReloadPhase];
    let position = 0;
    let timer = 0;

    const typeNextChunk = () => {
      const previousPosition = position;
      position = Math.min(position + file.step, file.source.length);
      setTypedCharacterCount(position);

      if (position === file.source.length) {
        if (hotReloadPhase === lastHotReloadPhase) {
          setHotReloadComplete(true);
          return;
        }

        timer = window.setTimeout(() => {
          const nextPhase = hotReloadPhase + 1;
          setTypedCharacterCount(0);
          setHotReloadPhase(nextPhase);
          setSelectedHotReloadTab(nextPhase);
        }, 750);
        return;
      }

      const typedChunk = file.source.slice(previousPosition, position);
      const delay = file.delay + (typedChunk.includes("\n") ? 35 : 0);
      timer = window.setTimeout(typeNextChunk, delay);
    };

    timer = window.setTimeout(typeNextChunk, hotReloadPhase === 0 ? 650 : 300);
    return () => window.clearTimeout(timer);
  }, [hotReloadComplete, hotReloadPhase, hotReloadStarted, lastHotReloadPhase, reducedMotion]);

  useEffect(() => {
    if (hotReloadComplete) return;

    const frame = previewFrameRef.current;
    const frameDocument = frame?.contentDocument;
    const frameWindow = frame?.contentWindow as PreviewWindow | null;
    const root = frameDocument?.getElementById("hud-root");
    const style = frameDocument?.getElementById("hot-style");
    if (!frameDocument || !frameWindow || !root || !style) return;

    if (hotReloadPhase === 0) {
      if (typedCharacterCount === 0) {
        frameWindow.__hudCleanup?.();
        frameWindow.__hudCleanup = undefined;
        frameDocument.querySelector("script[data-hot-reload]")?.remove();
      }
      root.innerHTML = hotReloadHtml.slice(0, typedCharacterCount);
      style.textContent = "";
    } else {
      if (!root.hasChildNodes() || lastAppliedPhaseRef.current === 0) {
        root.innerHTML = hotReloadHtml;
      }
      style.textContent = hotReloadPhase === 1
        ? hotReloadCss.slice(0, typedCharacterCount)
        : hotReloadCss;
    }

    lastAppliedPhaseRef.current = hotReloadPhase;
  }, [hotReloadComplete, hotReloadPhase, previewLoadCount, typedCharacterCount]);

  useEffect(() => {
    if (!hotReloadComplete) return;

    const timer = window.setTimeout(() => {
      const frame = previewFrameRef.current;
      const frameDocument = frame?.contentDocument;
      const frameWindow = frame?.contentWindow as PreviewWindow | null;
      const root = frameDocument?.getElementById("hud-root");
      const style = frameDocument?.getElementById("hot-style");
      if (!frameDocument || !frameWindow || !root || !style) return;

      frameWindow.__hudCleanup?.();
      frameWindow.__hudCleanup = undefined;
      frameDocument.querySelector("script[data-hot-reload]")?.remove();
      root.innerHTML = editedSources[0];
      style.textContent = editedSources[1];

      const script = frameDocument.createElement("script");
      script.dataset.hotReload = "true";
      script.textContent = editedSources[2];
      frameDocument.body.appendChild(script);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [editedSources, hotReloadComplete, previewLoadCount]);

  useLayoutEffect(() => {
    const code = hotReloadCodeRef.current;
    if (!code) return;
    const selectedTabIsEmpty = !hotReloadComplete
      && (selectedHotReloadTab > hotReloadPhase
        || (selectedHotReloadTab === hotReloadPhase && typedCharacterCount === 0));
    code.scrollTo({
      top: selectedTabIsEmpty ? 0 : code.scrollHeight,
      behavior: "auto",
    });
  }, [hotReloadComplete, hotReloadPhase, selectedHotReloadTab, typedCharacterCount]);

  useEffect(() => () => {
    const frameWindow = previewFrameRef.current?.contentWindow as PreviewWindow | null;
    frameWindow?.__hudCleanup?.();
  }, []);

  const displayedHotReloadFile = hotReloadFiles[selectedHotReloadTab];
  const displayedCharacterCount = hotReloadComplete || selectedHotReloadTab < hotReloadPhase
    ? displayedHotReloadFile.source.length
    : selectedHotReloadTab === hotReloadPhase
      ? typedCharacterCount
      : 0;
  const highlightedHotReloadSource = hljs.highlight(
    displayedHotReloadFile.source.slice(0, displayedCharacterCount),
    { language: displayedHotReloadFile.language, ignoreIllegals: true },
  ).value;

  const handlePreviewLoad = () => {
    lastAppliedPhaseRef.current = -1;
    setPreviewLoadCount(count => count + 1);
  };

  return (
    <section className="webkiln-examples" id="webkiln-examples">
      <div className="shell">
        <header className="examples-heading">
          <h2>Web UI running in Unreal</h2>
          <p>The editor applies real HTML, CSS and JavaScript to the game view as each file is written.</p>
        </header>

        <article ref={hotReloadExampleRef} className="example-block">
          <header className="example-intro">
            <h3>Build an interactive RPG inventory</h3>
            <p>HTML lays out the HUD, CSS gives it a game-ready finish, and JavaScript opens the inventory and equips an item. Edit any file when the build finishes.</p>
          </header>

          <div className="live-example rpg-hud-example">
            <div className="code-demo">
              <div className="demo-bar hot-reload-tab-bar">
                <div className="code-tabs" role="tablist" aria-label="Hot-reloaded files">
                  {hotReloadFiles.map((file, index) => (
                    <button
                      key={file.name}
                      id={`hot-reload-tab-${index}`}
                      className={index === selectedHotReloadTab ? "is-active" : ""}
                      type="button"
                      role="tab"
                      aria-controls="hot-reload-code"
                      aria-selected={index === selectedHotReloadTab}
                      onClick={() => setSelectedHotReloadTab(index)}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
              {hotReloadComplete ? (
                <textarea
                  id="hot-reload-code"
                  className="source-code source-editor rpg-hud-source"
                  aria-label="Editable HUD source"
                  value={editedSources[selectedHotReloadTab]}
                  onChange={event => {
                    const nextSources = [...editedSources];
                    nextSources[selectedHotReloadTab] = event.target.value;
                    setEditedSources(nextSources);
                  }}
                  spellCheck={false}
                />
              ) : (
                <pre
                id="hot-reload-code"
                ref={hotReloadCodeRef}
                className="source-code rpg-hud-source"
                role="tabpanel"
                aria-labelledby={`hot-reload-tab-${selectedHotReloadTab}`}
              >
                <code
                  className={`hljs language-${displayedHotReloadFile.language}`}
                  dangerouslySetInnerHTML={{ __html: highlightedHotReloadSource }}
                />
                {hotReloadStarted && !hotReloadComplete && selectedHotReloadTab === hotReloadPhase && (
                  <span className="typing-caret" aria-hidden="true" />
                )}
                </pre>
              )}
            </div>

            <div className="real-unreal-capture rpg-hud-preview">
              <iframe
                ref={previewFrameRef}
                className="rpg-preview-frame"
                srcDoc={previewDocument}
                title="Editable RPG inventory preview"
                onLoad={handlePreviewLoad}
              />
            </div>
          </div>
        </article>

        <article className="production-example" id="fall-of-an-empire">
          <header className="production-example-copy">
            <h3>How Fall of an Empire uses Webkiln</h3>
            <p>
              Fall of an Empire, a grand strategy game out now on Steam, builds
              its interface with Webkiln. Faction panels, character screens and
              branching story events all pull live data straight from the
              campaign running in Unreal.
            </p>
          </header>

          <figure className="production-capture">
            <img
              src="/webkiln/showcase/fall-of-an-empire-steam-ui.jpg"
              alt="Fall of an Empire Steam screenshot showing a faction panel, character panel and narrative decision layered over the live campaign map"
              width="1920"
              height="1080"
              loading="lazy"
            />
            <figcaption>
              A faction overview, character actions and a branching event are all
              layered over the live campaign map.
            </figcaption>
          </figure>
        </article>
      </div>
    </section>
  );
};

export default WebkilnExamples;
