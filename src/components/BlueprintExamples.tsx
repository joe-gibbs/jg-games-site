import { BlueprintGraph } from "./BlueprintGraph";
import type { BlueprintGraphData } from "./BlueprintGraph";

const createViewGraph: BlueprintGraphData = {
  title: "Create and display a Webkiln view",
  description: "The view is owned by the game-instance subsystem and assigned to a Webkiln UMG widget.",
  nodes: [
    {
      id: "begin",
      title: "Event Begin Play",
      kind: "event",
      x: 24,
      y: 262,
      width: 210,
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
    {
      id: "subsystem",
      title: "Get Game Instance Subsystem",
      subtitle: "Webkiln Subsystem",
      kind: "pure",
      x: 24,
      y: 48,
      width: 270,
      inputs: [{ id: "class", label: "Class", type: "object", value: "Webkiln Subsystem" }],
      outputs: [{ id: "result", label: "Return Value", type: "object" }],
    },
    {
      id: "params",
      title: "Make Webkiln View Init Params",
      kind: "struct",
      x: 346,
      y: 28,
      width: 286,
      inputs: [
        { id: "view-id", label: "View Id", type: "name", value: "MainUI" },
        { id: "entry", label: "Entry Point", type: "string", value: "gameui://app/index.html" },
        { id: "width", label: "Width", type: "number", value: "0" },
        { id: "height", label: "Height", type: "number", value: "0" },
      ],
      outputs: [{ id: "result", label: "Webkiln View Init Params", type: "struct" }],
    },
    {
      id: "create",
      title: "Create View Async",
      subtitle: "Target is Webkiln Subsystem",
      kind: "function",
      x: 694,
      y: 144,
      width: 272,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object" },
        { id: "params", label: "Params", type: "struct" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "view", label: "Return Value", type: "object" },
      ],
    },
    {
      id: "set-view",
      title: "Set View",
      subtitle: "Target is Webkiln Widget",
      kind: "function",
      x: 1040,
      y: 172,
      width: 250,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object", value: "Webkiln Widget" },
        { id: "view", label: "In View", type: "object" },
      ],
      outputs: [{ id: "then", label: "", type: "exec" }],
    },
  ],
  connections: [
    { from: ["begin", "then"], to: ["create", "exec"] },
    { from: ["subsystem", "result"], to: ["create", "target"] },
    { from: ["params", "result"], to: ["create", "params"] },
    { from: ["create", "then"], to: ["set-view", "exec"] },
    { from: ["create", "view"], to: ["set-view", "view"] },
  ],
};

const objectEventGraph: BlueprintGraphData = {
  title: "Send an Unreal object to JavaScript",
  description: "Webkiln reflects the object's UPROPERTY data and delivers one JSON payload to gameUI.on.",
  nodes: [
    {
      id: "event",
      title: "On Player Updated",
      kind: "event",
      x: 26,
      y: 152,
      width: 220,
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "player", label: "Player", type: "object" },
      ],
    },
    {
      id: "view",
      title: "Get Webkiln View",
      kind: "pure",
      x: 300,
      y: 36,
      width: 220,
      outputs: [{ id: "view", label: "Webkiln View", type: "object" }],
    },
    {
      id: "dispatch",
      title: "Dispatch Webkiln Event (Unreal Object)",
      subtitle: "Target is Webkiln View",
      kind: "function",
      x: 620,
      y: 110,
      width: 340,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object" },
        { id: "name", label: "Event Name", type: "string", value: "player.updated" },
        { id: "payload", label: "Payload", type: "object" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "success", label: "Return Value", type: "boolean" },
        { id: "error", label: "Out Error", type: "string" },
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
  description: "Stringify Unreal Object produces valid JSON for the request's Succeed node.",
  nodes: [
    {
      id: "execute",
      title: "Event Execute",
      subtitle: "Webkiln Bridge Action",
      kind: "event",
      x: 24,
      y: 126,
      width: 220,
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "request", label: "Request", type: "object" },
      ],
    },
    {
      id: "player",
      title: "Get Player Data",
      kind: "pure",
      x: 286,
      y: 30,
      width: 218,
      outputs: [{ id: "player", label: "Player Data", type: "object" }],
    },
    {
      id: "stringify",
      title: "Stringify Unreal Object",
      kind: "function",
      x: 574,
      y: 96,
      width: 282,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "object", label: "Object", type: "object" },
      ],
      outputs: [
        { id: "then", label: "", type: "exec" },
        { id: "json", label: "Json", type: "string" },
        { id: "success", label: "Return Value", type: "boolean" },
        { id: "error", label: "Out Error", type: "string" },
      ],
    },
    {
      id: "succeed",
      title: "Succeed",
      subtitle: "Target is Webkiln Bridge Request",
      kind: "function",
      x: 932,
      y: 128,
      width: 276,
      inputs: [
        { id: "exec", label: "", type: "exec" },
        { id: "target", label: "Target", type: "object" },
        { id: "json", label: "Result Json", type: "string" },
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
