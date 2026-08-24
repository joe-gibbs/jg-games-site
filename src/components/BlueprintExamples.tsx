import { BlueprintGraph } from "./BlueprintGraph";
import type { BlueprintGraphData } from "./BlueprintGraph";

const blueprintSnippets = import.meta.glob("../content/webkiln/*.blueprint.txt", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const blueprintClipboard = (file: string) =>
  Object.entries(blueprintSnippets).find(([path]) => path.endsWith(file))?.[1] ?? "";

const createViewGraph: BlueprintGraphData = {
  title: "Create and display a Webkiln view",
  description: "Copy these nodes into a Blueprint event graph.",
  copyText: blueprintClipboard("create-view.blueprint.txt"),
  nodes: [
    {
      id: "begin",
      title: "Event Begin Play",
      tooltip: "Runs once when this actor begins play.",
      kind: "event",
      x: 24,
      y: 40,
      width: 210,
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "register",
      title: "Register Resource Mount",
      subtitle: "Target is Webkiln Subsystem",
      tooltip: "Points a gameui:// host at a project folder.",
      kind: "function",
      x: 328,
      y: 40,
      width: 290,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "host", label: "Host", type: "string", value: "fpsdemo", typeName: "String", tooltip: "Host name served as gameui://host/." },
        { id: "root", label: "Root Path", type: "string", value: "WebUI", typeName: "String", tooltip: "Project directory that host points at." },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "error", label: "Out Error", type: "string", typeName: "String", tooltip: "Failure text if the folder could not be used." },
        { id: "ok", label: "Return Value", type: "boolean", typeName: "Boolean", tooltip: "True if the host now points at that folder." },
      ],
    },
    {
      id: "subsystem",
      title: "Get Game Instance Subsystem",
      subtitle: "Webkiln Subsystem",
      tooltip: "The game-instance subsystem that owns views.",
      kind: "pure",
      x: 728,
      y: 120,
      width: 250,
      outputs: [{ id: "result", label: "Return Value", type: "object", typeName: "Webkiln Subsystem Object Reference" }],
    },
    {
      id: "params",
      title: "Make Webkiln View Init Params",
      tooltip: "Build the struct passed to Create View Async.",
      kind: "struct",
      x: 568,
      y: 264,
      width: 300,
      inputs: [
        { id: "view-id", label: "View Id", type: "name", value: "FpsHud", typeName: "Name", tooltip: "Unique name used to find, resize and destroy this view." },
        { id: "entry", label: "Entry Point", type: "string", value: "gameui://fpsdemo/index.html", typeName: "String", tooltip: "Page URL, for example gameui://fpsdemo/index.html." },
      ],
      outputs: [{ id: "result", label: "Webkiln View Init Params", type: "struct", typeName: "Webkiln View Init Params Structure" }],
    },
    {
      id: "create",
      title: "Create View Async",
      subtitle: "Target is Webkiln Subsystem",
      tooltip: "Creates a view and starts loading without blocking the game thread.",
      kind: "function",
      x: 1016,
      y: 24,
      width: 272,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", typeName: "Webkiln Subsystem Object Reference" },
        { id: "params", label: "Params", type: "struct", typeName: "Webkiln View Init Params Structure (by ref)" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "view", label: "Return Value", type: "object", typeName: "Webkiln View Object Reference" },
      ],
    },
    {
      id: "set-hud-view",
      title: "Set HudView",
      tooltip: "Store the view on this actor.",
      kind: "function",
      x: 1384,
      y: 56,
      width: 220,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "value", label: "HudView", type: "object", typeName: "Webkiln View Object Reference" },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "create-widget",
      title: "Create Widget",
      subtitle: "Target is Widget Blueprint Library",
      tooltip: "Create the HUD widget class.",
      kind: "function",
      x: 1688,
      y: 40,
      width: 280,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "type", label: "Widget Type", type: "object", value: "WBP_FpsHud", typeName: "User Widget Class Reference" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "widget", label: "Return Value", type: "object", typeName: "User Widget Object Reference" },
      ],
    },
    {
      id: "set-hud-widget",
      title: "Set HudWidget",
      tooltip: "Store the widget on this actor.",
      kind: "function",
      x: 2104,
      y: 56,
      width: 230,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "value", label: "HudWidget", type: "object", typeName: "User Widget Object Reference" },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "get-hud-widget-cast",
      title: "Get HudWidget",
      kind: "pure",
      x: 2152,
      y: 232,
      width: 200,
      outputs: [{ id: "widget", label: "HudWidget", type: "object", typeName: "User Widget Object Reference" }],
    },
    {
      id: "cast",
      title: "Cast To Webkiln Fps Host Widget",
      tooltip: "The widget class that can take a Webkiln view.",
      kind: "function",
      x: 2360,
      y: 40,
      width: 300,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "object", label: "Object", type: "object", typeName: "Object Reference" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "failed", label: "Cast Failed", type: "exec", tooltip: "Runs if the widget is not a Webkiln Fps Host Widget." },
        { id: "as", label: "As Webkiln Fps Host Widget", type: "object", typeName: "Webkiln Fps Host Widget Object Reference" },
      ],
    },
    {
      id: "get-hud-view",
      title: "Get HudView",
      kind: "pure",
      x: 2520,
      y: 232,
      width: 200,
      outputs: [{ id: "view", label: "HudView", type: "object", typeName: "Webkiln View Object Reference" }],
    },
    {
      id: "set-view",
      title: "Set View",
      subtitle: "Target is Webkiln Fps Host Widget",
      tooltip: "Attach the view to the widget.",
      kind: "function",
      x: 2760,
      y: 24,
      width: 280,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", typeName: "Webkiln Fps Host Widget Object Reference" },
        { id: "view", label: "In View", type: "object", typeName: "Webkiln View Object Reference" },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "get-hud-widget-viewport",
      title: "Get HudWidget",
      kind: "pure",
      x: 2936,
      y: 264,
      width: 200,
      outputs: [{ id: "widget", label: "HudWidget", type: "object", typeName: "User Widget Object Reference" }],
    },
    {
      id: "add-viewport",
      title: "Add to Viewport",
      subtitle: "Target is User Widget",
      tooltip: "Show the widget on screen.",
      kind: "function",
      x: 3096,
      y: 24,
      width: 250,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", typeName: "User Widget Object Reference" },
        { id: "z", label: "ZOrder", type: "number", value: "100", typeName: "Integer", tooltip: "Higher draws more on top." },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "set-ready",
      title: "Set bHudReady",
      tooltip: "Mark the HUD as ready for updates.",
      kind: "function",
      x: 3336,
      y: 56,
      width: 220,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "value", label: "bHudReady", type: "boolean", value: "true", typeName: "Boolean" },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "timer",
      title: "Set Timer by Function Name",
      tooltip: "Call DispatchHudState on a loop.",
      kind: "function",
      x: 3608,
      y: 40,
      width: 290,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "object", label: "Object", type: "object", typeName: "Object Reference", tooltip: "Object that implements the function. Empty means self." },
        { id: "name", label: "Function Name", type: "string", value: "DispatchHudState", typeName: "String", tooltip: "Custom event or function to run." },
        { id: "time", label: "Time", type: "number", value: "0.1", typeName: "Float", tooltip: "Seconds between calls." },
        { id: "loop", label: "Looping", type: "boolean", value: "true", typeName: "Boolean", tooltip: "Keep running every Time seconds." },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
  ],
  connections: [
    { from: ["begin", "then"], to: ["register", "exec"] },
    { from: ["register", "then"], to: ["create", "exec"] },
    { from: ["subsystem", "result"], to: ["create", "target"] },
    { from: ["params", "result"], to: ["create", "params"] },
    { from: ["create", "then"], to: ["set-hud-view", "exec"] },
    { from: ["create", "view"], to: ["set-hud-view", "value"] },
    { from: ["set-hud-view", "then"], to: ["create-widget", "exec"] },
    { from: ["create-widget", "then"], to: ["set-hud-widget", "exec"] },
    { from: ["create-widget", "widget"], to: ["set-hud-widget", "value"] },
    { from: ["set-hud-widget", "then"], to: ["cast", "exec"] },
    { from: ["get-hud-widget-cast", "widget"], to: ["cast", "object"] },
    { from: ["cast", "then"], to: ["set-view", "exec"] },
    { from: ["cast", "as"], to: ["set-view", "target"] },
    { from: ["get-hud-view", "view"], to: ["set-view", "view"] },
    { from: ["set-view", "then"], to: ["add-viewport", "exec"] },
    { from: ["get-hud-widget-viewport", "widget"], to: ["add-viewport", "target"] },
    { from: ["add-viewport", "then"], to: ["set-ready", "exec"] },
    { from: ["set-ready", "then"], to: ["timer", "exec"] },
  ],
};

const objectEventGraph: BlueprintGraphData = {
  title: "Send an Unreal object to JavaScript",
  description: "Copy these nodes into a Blueprint event graph.",
  copyText: blueprintClipboard("dispatch-object.blueprint.txt"),
  nodes: [
    {
      id: "event",
      title: "On Player Updated",
      tooltip: "Your game event with the player UObject.",
      kind: "event",
      x: 26,
      y: 152,
      width: 220,
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "player", label: "Player", type: "object", typeName: "Object Reference" },
      ],
    },
    {
      id: "view",
      title: "Get Webkiln View",
      kind: "pure",
      x: 300,
      y: 36,
      width: 220,
      outputs: [{ id: "view", label: "Webkiln View", type: "object", typeName: "Webkiln View Object Reference" }],
    },
    {
      id: "dispatch",
      title: "Dispatch Webkiln Event (Unreal Object)",
      subtitle: "Target is Webkiln View",
      tooltip: "Serialise a UObject and send it to gameUI.on.",
      kind: "function",
      x: 620,
      y: 110,
      width: 340,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", typeName: "Webkiln View Object Reference" },
        { id: "name", label: "Event Name", type: "string", value: "player.updated", typeName: "String", tooltip: "Name JavaScript subscribed to with gameUI.on." },
        { id: "payload", label: "Payload", type: "object", typeName: "Object Reference", tooltip: "Reflected properties become the JSON payload." },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "success", label: "Return Value", type: "boolean", typeName: "Boolean" },
        { id: "error", label: "Out Error", type: "string", typeName: "String" },
      ],
    },
  ],
  connections: [
    { from: ["event", "then"], to: ["dispatch", "exec"] },
    { from: ["event", "player"], to: ["dispatch", "payload"] },
    { from: ["view", "view"], to: ["dispatch", "target"] },
  ],
};

const responseGraph: BlueprintGraphData = {
  title: "Return an existing UObject from a bridge action",
  description: "Copy these nodes into a Webkiln Bridge Action graph.",
  copyText: blueprintClipboard("stringify-succeed.blueprint.txt"),
  nodes: [
    {
      id: "execute",
      title: "Event Execute",
      subtitle: "Webkiln Bridge Action",
      tooltip: "Called when JavaScript requests this action.",
      kind: "event",
      x: 24,
      y: 126,
      width: 220,
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "request", label: "Request", type: "object", typeName: "Webkiln Bridge Request Object Reference" },
      ],
    },
    {
      id: "player",
      title: "Get Player Data",
      kind: "pure",
      x: 286,
      y: 30,
      width: 218,
      outputs: [{ id: "player", label: "Player Data", type: "object", typeName: "Object Reference" }],
    },
    {
      id: "stringify",
      title: "Stringify Unreal Object",
      tooltip: "Turn reflected UObject properties into a JSON string.",
      kind: "function",
      x: 574,
      y: 96,
      width: 282,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "object", label: "Object", type: "object", typeName: "Object Reference" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "json", label: "Json", type: "string", typeName: "String" },
        { id: "success", label: "Return Value", type: "boolean", typeName: "Boolean" },
        { id: "error", label: "Out Error", type: "string", typeName: "String" },
      ],
    },
    {
      id: "succeed",
      title: "Succeed",
      subtitle: "Target is Webkiln Bridge Request",
      tooltip: "Resolve the JavaScript promise. Invalid JSON produces malformed_customer_output.",
      kind: "function",
      x: 932,
      y: 128,
      width: 276,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", typeName: "Webkiln Bridge Request Object Reference" },
        { id: "json", label: "Result Json", type: "string", typeName: "String", tooltip: "Any JSON value, as a string." },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
  ],
  connections: [
    { from: ["execute", "then"], to: ["stringify", "exec"] },
    { from: ["execute", "request"], to: ["succeed", "target"] },
    { from: ["player", "player"], to: ["stringify", "object"] },
    { from: ["stringify", "then"], to: ["succeed", "exec"] },
    { from: ["stringify", "json"], to: ["succeed", "json"] },
  ],
};

const examples: Record<string, BlueprintGraphData[]> = {
  "quick-start": [createViewGraph],
  "talk-to-the-game": [objectEventGraph, responseGraph],
  bridge: [objectEventGraph, responseGraph],
};

export const BlueprintExamples = ({ document }: { document: string }) => {
  const graphs = examples[document];
  if (!graphs) return null;

  return (
    <section className="docs-blueprints" aria-labelledby={`${document}-blueprints`}>
      <h2 id={`${document}-blueprints`}>Blueprint examples</h2>
      {graphs.map((graph) => <BlueprintGraph graph={graph} key={graph.title} />)}
    </section>
  );
};
