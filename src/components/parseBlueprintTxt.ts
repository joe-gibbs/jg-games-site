import type {
  BlueprintConnection,
  BlueprintGraphData,
  BlueprintNode,
  BlueprintPin,
  BlueprintPinType,
} from "./BlueprintGraph";

type RawPin = Record<string, string>;

type RawObject = {
  className: string;
  name: string;
  props: Record<string, string>;
  pins: RawPin[];
};

const execNames = new Set(["then", "execute"]);

const isTrue = (value: string | undefined) =>
  value === "True" || value === "true" || value === "1";

const unescapeUnreal = (value: string) =>
  value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\(['"\\])/g, "$1");

const readValue = (source: string, start: number, breakOnSpace: boolean) => {
  let index = start;
  while (index < source.length && (source[index] === " " || source[index] === "\t")) index += 1;
  if (index >= source.length) return { value: "", end: index };

  if (source[index] === '"') {
    index += 1;
    let value = "";
    while (index < source.length) {
      const char = source[index];
      if (char === "\\") {
        value += source.slice(index, index + 2);
        index += 2;
        continue;
      }
      if (char === '"') return { value: unescapeUnreal(value), end: index + 1 };
      value += char;
      index += 1;
    }
    return { value: unescapeUnreal(value), end: index };
  }

  let depth = 0;
  let inQuote = false;
  const from = index;
  while (index < source.length) {
    const char = source[index];
    if (inQuote) {
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === '"') inQuote = false;
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuote = true;
      index += 1;
      continue;
    }
    if (char === "(") {
      depth += 1;
      index += 1;
      continue;
    }
    if (char === ")") {
      if (depth === 0) break;
      depth -= 1;
      index += 1;
      continue;
    }
    if (depth === 0 && (char === "," || (breakOnSpace && /\s/.test(char)))) break;
    index += 1;
  }
  return { value: source.slice(from, index).trim(), end: index };
};

const parseProps = (source: string, breakOnSpace = false) => {
  const props: Record<string, string> = {};
  let index = 0;
  while (index < source.length) {
    while (index < source.length && /[\s,]/.test(source[index])) index += 1;
    if (index >= source.length || source[index] === ")") break;
    const equals = source.indexOf("=", index);
    if (equals < 0) break;
    const key = source.slice(index, equals).trim();
    const { value, end } = readValue(source, equals + 1, breakOnSpace);
    if (key) props[key] = value;
    index = end;
  }
  return props;
};

const innerProps = (value: string | undefined) => {
  const trimmed = value?.trim() ?? "";
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return parseProps(trimmed.slice(1, -1));
  }
  return parseProps(trimmed);
};

const parseObjects = (text: string) => {
  const objects: RawObject[] = [];
  let current: RawObject | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("Begin Object ")) {
      const props = parseProps(line.slice("Begin Object ".length), true);
      const classPath = props.Class ?? "";
      current = {
        className: classPath.split(".").pop() ?? classPath,
        name: props.Name ?? `Node_${objects.length}`,
        props,
        pins: [],
      };
      objects.push(current);
      continue;
    }
    if (line === "End Object") {
      current = null;
      continue;
    }
    if (!current) continue;
    if (line.startsWith("CustomProperties Pin (")) {
      const inner = line.slice("CustomProperties Pin (".length).replace(/\)\s*$/, "");
      current.pins.push(parseProps(inner));
      continue;
    }
    const equals = line.indexOf("=");
    if (equals > 0) {
      current.props[line.slice(0, equals)] = readValue(line, equals + 1, false).value;
    }
  }

  return objects;
};

const softenSmallWords = (text: string) => {
  const small = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
  return text
    .split(" ")
    .map((word, index) => (index > 0 && small.has(word.toLowerCase()) ? word.toLowerCase() : word))
    .join(" ");
};

const displayName = (raw: string, isBool = false) => {
  if (!raw) return "";
  if (execNames.has(raw) || raw === "OutputDelegate") return "";
  if (raw === "self") return "Target";
  let text = raw.replace(/_/g, " ");
  if (isBool) {
    text = text.replace(/(^| )b([A-Z])/g, "$1$2");
  }
  text = text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  return softenSmallWords(text);
};

const lastIdentifier = (path: string) => {
  const inner = path.match(/'([^']+)'/)?.[1] ?? path;
  const ident = inner.split(/[./]/).pop() ?? inner;
  return ident.endsWith("_C") ? ident.slice(0, -2) : ident;
};

const typeDisplayName = (path: string) => displayName(lastIdentifier(path));

const friendlyName = (value: string | undefined) => {
  if (!value) return "";
  if (value.includes("LOCGEN_FORMAT_NAMED") || value.includes("INVTEXT(")) {
    const inv = [...value.matchAll(/INVTEXT\("((?:\\.|[^"\\])*)"\)/g)].map((match) => unescapeUnreal(match[1]));
    if (inv.length >= 2) return softenSmallWords(`${inv[0]} ${inv[1]}`);
    if (inv.length === 1) return softenSmallWords(inv[0]);
  }
  const ns = value.match(/NSLOCTEXT\s*\(\s*"(?:\\.|[^"\\])*"\s*,\s*"(?:\\.|[^"\\])*"\s*,\s*"((?:\\.|[^"\\])*)"\s*\)/);
  if (ns) return unescapeUnreal(ns[1]);
  return "";
};

const pinCategory = (pin: RawPin) => pin["PinType.PinCategory"] ?? "";

const mapPinType = (category: string): BlueprintPinType | null => {
  if (category === "exec") return "exec";
  if (category === "object" || category === "class" || category === "softobject" || category === "softclass" || category === "interface") {
    return "object";
  }
  if (category === "string" || category === "text") return "string";
  if (category === "name") return "name";
  if (category === "struct" || category === "enum") return "struct";
  if (category === "bool") return "boolean";
  if (category === "int" || category === "int64" || category === "real" || category === "float" || category === "double" || category === "byte") {
    return "number";
  }
  if (category === "delegate") return null;
  return "object";
};

const formatDefault = (value: string, category: string) => {
  if (!value) return undefined;
  if (category === "bool") return value.toLowerCase() === "true" ? "true" : "false";
  if (category === "real" || category === "float" || category === "double") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return String(numeric);
  }
  if ((category === "object" || category === "class") && value === "None") return undefined;
  return value;
};

const objectLabel = (path: string) => lastIdentifier(path);

const parseLinks = (value: string | undefined) => {
  if (!value) return [];
  const inner = value.trim().replace(/^\(/, "").replace(/\)\s*$/, "");
  return [...inner.matchAll(/([A-Za-z0-9_]+)\s+([A-F0-9]+)/g)].map((match) => ({
    node: match[1],
    pinId: match[2],
  }));
};

const pinVisible = (object: RawObject, pin: RawPin) => {
  if (isTrue(pin.bHidden) || isTrue(pin.bOrphanedPin)) return false;
  if (pinCategory(pin) === "delegate") return false;
  if (isTrue(pin.bAdvancedView) && object.props.AdvancedPinDisplay !== "Shown") return false;
  return true;
};

const buildTypeName = (pin: RawPin, type: BlueprintPinType) => {
  const tooltipLines = (pin.PinToolTip ?? "").split("\n").map((line) => line.trim());
  const typeLine = tooltipLines.find((line, index) => index > 0 && line);
  if (typeLine) return typeLine;
  const object = pin["PinType.PinSubCategoryObject"] ?? "";
  const named = object && object !== "None" ? typeDisplayName(object) : "";
  if (type === "exec") return "Exec";
  if (type === "boolean") return "Boolean";
  if (type === "string") return "String";
  if (type === "name") return "Name";
  if (type === "number") {
    if (pinCategory(pin) === "int" || pinCategory(pin) === "int64") return "Integer";
    if (pinCategory(pin) === "byte") return "Byte";
    return "Float";
  }
  if (type === "struct") {
    const byRef = isTrue(pin["PinType.bIsReference"]) ? " (by ref)" : "";
    return `${named || "Structure"} Structure${byRef}`;
  }
  if (pinCategory(pin) === "class") return `${named || "Class"} Class Reference`;
  return named ? `${named} Object Reference` : "Object Reference";
};

const buildPin = (object: RawObject, pin: RawPin): BlueprintPin | null => {
  const category = pinCategory(pin);
  const type = mapPinType(category);
  if (!type || !pinVisible(object, pin)) return null;
  const name = pin.PinName ?? pin.PinId;
  const bool = type === "boolean";
  const label = friendlyName(pin.PinFriendlyName) || displayName(name, bool);
  const linked = parseLinks(pin.LinkedTo);
  const tooltipLines = (pin.PinToolTip ?? "").split("\n").map((line) => line.trim());
  const description = tooltipLines
    .filter((line, index) => index > 1 && line && line !== label && line !== buildTypeName(pin, type))
    .join(" ")
    .trim();
  const connected = linked.length > 0;
  const input = pin.Direction !== "EGPD_Output";
  let value: string | undefined;
  if (input && !connected) {
    if (pin.DefaultObject && pin.DefaultObject !== "None") value = objectLabel(pin.DefaultObject);
    else if (pin.DefaultValue) value = formatDefault(pin.DefaultValue, category);
  }
  return {
    id: name,
    label: type === "exec" && execNames.has(name) ? "" : label,
    type,
    value,
    typeName: buildTypeName(pin, type),
    tooltip: description || undefined,
  };
};

const nodeKind = (object: RawObject, inputs: BlueprintPin[], outputs: BlueprintPin[]): BlueprintNode["kind"] => {
  if (object.className === "K2Node_MakeStruct") return "struct";
  if (object.className.includes("Event") || object.className === "K2Node_CustomEvent" || object.className === "K2Node_InputKey") return "event";
  if (
    object.className === "K2Node_GetSubsystem"
    || object.className === "K2Node_GetWorldSubsystem"
    || object.className === "K2Node_GetEngineSubsystem"
    || object.className === "K2Node_GetLocalPlayerSubsystem"
    || object.className === "K2Node_VariableGet"
  ) {
    return "pure";
  }
  const hasExec = [...inputs, ...outputs].some((pin) => pin.type === "exec");
  return hasExec ? "function" : "pure";
};

const eventTitle = (memberName: string) => {
  const trimmed = memberName.replace(/^Receive/, "");
  return `Event ${displayName(trimmed)}`;
};

const nodeTitle = (object: RawObject): { title: string; subtitle?: string } => {
  const event = innerProps(object.props.EventReference);
  const fn = innerProps(object.props.FunctionReference);
  const variable = innerProps(object.props.VariableReference);

  switch (object.className) {
    case "K2Node_Event":
      return {
        title: eventTitle(event.MemberName ?? "Event"),
        subtitle: event.MemberParent?.includes("WebkilnBridgeAction") ? "Webkiln Bridge Action" : undefined,
      };
    case "K2Node_CustomEvent":
      return { title: displayName(object.props.CustomFunctionName || "Custom Event") };
    case "K2Node_InputKey":
      return { title: object.props.InputKey || "Input Key" };
    case "K2Node_CallFunction":
      return {
        title: displayName(fn.MemberName ?? "Call Function"),
        subtitle: fn.MemberParent ? `Target is ${typeDisplayName(fn.MemberParent)}` : undefined,
      };
    case "K2Node_CreateWidget":
      return { title: "Create Widget", subtitle: "Target is Widget Blueprint Library" };
    case "K2Node_GetSubsystem":
      return {
        title: "Get Game Instance Subsystem",
        subtitle: object.props.CustomClass ? typeDisplayName(object.props.CustomClass) : undefined,
      };
    case "K2Node_GetWorldSubsystem":
      return { title: "Get World Subsystem", subtitle: object.props.CustomClass ? typeDisplayName(object.props.CustomClass) : undefined };
    case "K2Node_GetEngineSubsystem":
      return { title: "Get Engine Subsystem", subtitle: object.props.CustomClass ? typeDisplayName(object.props.CustomClass) : undefined };
    case "K2Node_VariableGet":
      return { title: `Get ${displayName(variable.MemberName ?? object.pins.find((pin) => pin.Direction === "EGPD_Output")?.PinName ?? "Variable")}` };
    case "K2Node_VariableSet":
      return { title: `Set ${displayName(variable.MemberName ?? "Variable")}` };
    case "K2Node_MakeStruct":
      return { title: `Make ${typeDisplayName(object.props.StructType ?? "Struct")}` };
    default:
      return { title: displayName(object.className.replace(/^K2Node_/, "")) };
  }
};

const estimateWidth = (node: Omit<BlueprintNode, "width">) => {
  const header = Math.max(node.title.length * 7.4, (node.subtitle?.length ?? 0) * 5.6) + 28;
  const column = (pins: BlueprintPin[] | undefined) =>
    Math.max(
      36,
      ...(pins ?? []).map((pin) => {
        let width = 28;
        if (pin.label) width += Math.min(pin.label.length * 6.4, 190);
        if (pin.type === "boolean" && pin.value) width += 18;
        else if (pin.value) width += Math.min(10 + pin.value.length * 6, 128);
        return width;
      }),
    );
  const left = column(node.inputs);
  const right = column(node.outputs);
  const inCount = node.inputs?.length ?? 0;
  const outCount = node.outputs?.length ?? 0;
  const body = inCount && outCount
    ? left + Math.max(96, Math.min(right, 160))
    : Math.max(left, right);
  return Math.round(Math.min(460, Math.max(200, header, body)));
};

const skippedClasses = new Set(["K2Node_Comment"]);

export const parseBlueprintTxt = (
  text: string,
  meta: { title: string; description: string; copyText?: string },
): BlueprintGraphData => {
  const objects = parseObjects(text).filter((object) => !skippedClasses.has(object.className));
  const pinIndex = new Map<string, { nodeId: string; pinName: string; hidden: boolean; output: boolean }>();
  const nodes: BlueprintNode[] = [];

  for (const object of objects) {
    const inputs: BlueprintPin[] = [];
    const outputs: BlueprintPin[] = [];
    for (const pin of object.pins) {
      const hidden = !pinVisible(object, pin);
      const output = pin.Direction === "EGPD_Output";
      const name = pin.PinName ?? pin.PinId;
      pinIndex.set(`${object.name} ${pin.PinId}`, {
        nodeId: object.name,
        pinName: name,
        hidden,
        output,
      });
      const parsed = buildPin(object, pin);
      if (!parsed) continue;
      if (output) outputs.push(parsed);
      else inputs.push(parsed);
    }
    if (object.className === "K2Node_Knot") continue;
    const { title, subtitle } = nodeTitle(object);
    const kind = nodeKind(object, inputs, outputs);
    const node: BlueprintNode = {
      id: object.name,
      title,
      subtitle,
      kind,
      x: Number(object.props.NodePosX ?? 0),
      y: Number(object.props.NodePosY ?? 0),
      inputs: inputs.length ? inputs : undefined,
      outputs: outputs.length ? outputs : undefined,
    };
    node.width = estimateWidth(node);
    nodes.push(node);
  }

  const connections: BlueprintConnection[] = [];
  const seen = new Set<string>();
  const addConnection = (from: [string, string], to: [string, string]) => {
    const key = `${from[0]}.${from[1]}->${to[0]}.${to[1]}`;
    if (seen.has(key)) return;
    seen.add(key);
    connections.push({ from, to });
  };

  for (const object of objects) {
    for (const pin of object.pins) {
      const source = pinIndex.get(`${object.name} ${pin.PinId}`);
      if (!source || source.hidden) continue;
      for (const link of parseLinks(pin.LinkedTo)) {
        const target = pinIndex.get(`${link.node} ${link.pinId}`);
        if (!target || target.hidden) continue;
        if (source.output && !target.output) addConnection([source.nodeId, source.pinName], [target.nodeId, target.pinName]);
        else if (!source.output && target.output) addConnection([target.nodeId, target.pinName], [source.nodeId, source.pinName]);
      }
    }
  }

  const minX = Math.min(...nodes.map((node) => node.x), 0);
  const minY = Math.min(...nodes.map((node) => node.y), 0);
  const offsetX = 24 - minX;
  const offsetY = 24 - minY;
  for (const node of nodes) {
    node.x += offsetX;
    node.y += offsetY;
  }

  return {
    title: meta.title,
    description: meta.description,
    copyText: meta.copyText ?? text,
    nodes,
    connections,
  };
};
