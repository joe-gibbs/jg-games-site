import { BlueprintGraph } from "./BlueprintGraph";
import { parseBlueprintTxt } from "./parseBlueprintTxt";

const blueprintFiles = import.meta.glob("../content/webkiln/*.blueprint.txt", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const blueprintById = Object.fromEntries(
  Object.entries(blueprintFiles).map(([path, text]) => {
    const id = path.split(/[/\\]/).pop()?.replace(/\.blueprint\.txt$/, "") ?? path;
    return [id, text];
  }),
) as Record<string, string>;

const blueprintTitles: Record<string, string> = {
  "create-view": "Create and display a Webkiln view",
  "button-clicked": "Handle a click from the page",
  "z-pressed": "Dispatch z-pressed when Z is pressed",
  "dispatch-object": "Send an Unreal object to JavaScript",
  "dispatch-struct": "Send a Blueprint struct to JavaScript",
  "stringify-succeed": "Return an existing UObject from a bridge action",
  "set-atlas": "Create an atlas view and assign it",
  "bind-anchor": "Bind an anchor to a scene component",
};

const graphFromId = (id: string) => {
  const text = blueprintById[id];
  if (!text) return null;
  return parseBlueprintTxt(text, {
    title: blueprintTitles[id] ?? id.replace(/-/g, " "),
    description: text.includes("WebkilnBridgeAction")
      ? "Copy these nodes into a Webkiln Bridge Action graph."
      : "Copy these nodes into a Blueprint event graph.",
    copyText: text,
  });
};

export const BlueprintEmbed = ({ ids }: { ids: string[] }) => {
  const graphs = ids.flatMap((id) => {
    const graph = graphFromId(id);
    return graph ? [{ id, graph }] : [];
  });
  if (!graphs.length) return null;

  return (
    <div className="docs-blueprints">
      {graphs.map(({ id, graph }) => <BlueprintGraph graph={graph} key={id} />)}
    </div>
  );
};
