import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type BlueprintPinType =
  | "exec"
  | "object"
  | "string"
  | "name"
  | "struct"
  | "boolean"
  | "number";

export type BlueprintPin = {
  id: string;
  label: string;
  type: BlueprintPinType;
  value?: string;
};

export type BlueprintNode = {
  id: string;
  title: string;
  subtitle?: string;
  kind: "event" | "function" | "pure" | "struct";
  x: number;
  y: number;
  width?: number;
  inputs?: BlueprintPin[];
  outputs?: BlueprintPin[];
};

export type BlueprintConnection = {
  from: [nodeId: string, pinId: string];
  to: [nodeId: string, pinId: string];
};

export type BlueprintGraphData = {
  title: string;
  description: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
};

const defaultNodeWidth = 250;
const headerHeight = 50;
const pinHeight = 30;
const nodePadding = 12;

const pinColours: Record<BlueprintPinType, string> = {
  exec: "#f1f1f1",
  object: "#56a8d8",
  string: "#ef69bd",
  name: "#cb63df",
  struct: "#66d5c4",
  boolean: "#9c2430",
  number: "#85d34f",
};

const nodeAccentColours: Record<BlueprintNode["kind"], string> = {
  event: "#b52d38",
  function: "#2f79ae",
  pure: "#4b914f",
  struct: "#3f7891",
};

const nodeHeight = (node: BlueprintNode) =>
  headerHeight + Math.max(node.inputs?.length ?? 0, node.outputs?.length ?? 0, 1) * pinHeight + nodePadding;

const pinKey = (nodeId: string, pinId: string) => `${nodeId}.${pinId}`;

type TooltipState = {
  left: number;
  text: string;
  top: number;
};

const BlueprintPinText = ({
  isValue = false,
  onHide,
  onShow,
  text,
}: {
  isValue?: boolean;
  onHide: () => void;
  onShow: (text: string, element: HTMLElement) => void;
  text: string;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(() => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  const show = () => {
    if (isTruncated && textRef.current) onShow(text, textRef.current);
  };

  return (
    <span
      className={`${isValue ? "bp-pin-value" : "bp-pin-label"}${isTruncated ? " is-truncated" : ""}`}
      ref={textRef}
      tabIndex={isTruncated ? 0 : undefined}
      aria-label={isTruncated ? text : undefined}
      onBlur={onHide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={onHide}
      onPointerEnter={show}
      onPointerLeave={onHide}
    >
      {text}
    </span>
  );
};

const BlueprintPinGlyph = ({
  connected,
  side,
  type,
}: {
  connected: boolean;
  side: "input" | "output";
  type: BlueprintPinType;
}) => (
  <span
    className={`bp-pin-glyph${type === "exec" ? " is-exec" : ""}${connected ? " is-connected" : ""} is-${side}`}
    style={{ "--pin-colour": pinColours[type] } as CSSProperties}
    aria-hidden="true"
  />
);

export const BlueprintGraph = ({ graph }: { graph: BlueprintGraphData }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [zoomMode, setZoomMode] = useState<"automatic" | "fit" | "manual">("automatic");
  const [manualZoom, setManualZoom] = useState(1);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const dimensions = useMemo(() => ({
    width: Math.max(...graph.nodes.map((node) => node.x + (node.width ?? defaultNodeWidth)), 600) + 44,
    height: Math.max(...graph.nodes.map((node) => node.y + nodeHeight(node)), 260) + 44,
  }), [graph.nodes]);

  const fitZoom = viewportWidth > 0
    ? Math.min(1, Math.max(0.25, (viewportWidth - 2) / dimensions.width))
    : 1;
  const automaticZoom = viewportWidth > 0 && viewportWidth < 700
    ? Math.max(0.55, fitZoom)
    : fitZoom;
  const zoom = zoomMode === "manual"
    ? manualZoom
    : zoomMode === "fit"
      ? fitZoom
      : automaticZoom;
  const isFitZoom = zoomMode === "fit" || (zoomMode === "automatic" && automaticZoom === fitZoom);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(entry.contentRect.width);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const nodeById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );

  const connectedPins = useMemo(() => {
    const pins = new Set<string>();
    graph.connections.forEach((connection) => {
      pins.add(pinKey(connection.from[0], connection.from[1]));
      pins.add(pinKey(connection.to[0], connection.to[1]));
    });
    return pins;
  }, [graph.connections]);

  const pinPoint = (nodeId: string, pinId: string, side: "input" | "output") => {
    const node = nodeById.get(nodeId);
    if (!node) return null;
    const pins = side === "input" ? node.inputs ?? [] : node.outputs ?? [];
    const index = pins.findIndex((pin) => pin.id === pinId);
    if (index < 0) return null;
    return {
      x: node.x + (side === "output" ? node.width ?? defaultNodeWidth : 0),
      y: node.y + headerHeight + index * pinHeight + pinHeight / 2,
      type: pins[index].type,
    };
  };

  const showTooltip = (text: string, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    const halfWidth = Math.min(140, window.innerWidth / 2 - 12);
    setTooltip({
      left: Math.min(window.innerWidth - halfWidth, Math.max(halfWidth, bounds.left + bounds.width / 2)),
      text,
      top: bounds.top - 6,
    });
  };

  return (
    <figure className="bp-figure" aria-label={graph.title}>
      <figcaption>
        <div className="bp-caption-copy">
          <strong>{graph.title}</strong>
          <span>{graph.description}</span>
        </div>
        <div className="bp-zoom-controls" aria-label="Blueprint graph zoom controls">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              setManualZoom(Math.max(0.25, zoom - 0.1));
              setZoomMode("manual");
            }}
          >
            -
          </button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              setManualZoom(Math.min(1.3, zoom + 0.1));
              setZoomMode("manual");
            }}
          >
            +
          </button>
          <button
            className={isFitZoom ? "is-active" : ""}
            type="button"
            onClick={() => setZoomMode("fit")}
          >
            Fit
          </button>
        </div>
      </figcaption>
      <div className="bp-scroll" ref={viewportRef}>
        <div
          className="bp-stage"
          style={{
            width: dimensions.width * zoom,
            height: dimensions.height * zoom,
          }}
        >
          <div
            className="bp-surface"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `scale(${zoom})`,
            }}
          >
          <svg
            className="bp-wires"
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            aria-hidden="true"
          >
            {graph.connections.map((connection, index) => {
              const from = pinPoint(connection.from[0], connection.from[1], "output");
              const to = pinPoint(connection.to[0], connection.to[1], "input");
              if (!from || !to) return null;
              const bend = Math.max(70, Math.abs(to.x - from.x) * 0.45);
              const path = `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
              const key = `${connection.from.join(".")}-${connection.to.join(".")}-${index}`;
              return (
                <g className={`bp-wire is-${from.type}`} key={key}>
                  <path className="bp-wire-shadow" d={path} />
                  <path className="bp-wire-line" d={path} stroke={pinColours[from.type]} />
                </g>
              );
            })}
          </svg>

          {graph.nodes.map((node) => (
            <section
              className={`bp-node bp-node-${node.kind}`}
              style={{
                "--node-accent": nodeAccentColours[node.kind],
                left: node.x,
                top: node.y,
                width: node.width ?? defaultNodeWidth,
                minHeight: nodeHeight(node),
              } as CSSProperties}
              key={node.id}
              aria-label={`${node.title} Blueprint node`}
            >
              <header>
                <strong>{node.title}</strong>
                {node.subtitle && <span>{node.subtitle}</span>}
              </header>
              <div className="bp-node-body">
                <div className="bp-pin-column is-input">
                  {(node.inputs ?? []).map((pin) => (
                    <div className="bp-pin" key={pin.id}>
                      <BlueprintPinGlyph
                        connected={connectedPins.has(pinKey(node.id, pin.id))}
                        side="input"
                        type={pin.type}
                      />
                      {pin.label && (
                        <BlueprintPinText
                          text={pin.label}
                          onHide={() => setTooltip(null)}
                          onShow={showTooltip}
                        />
                      )}
                      {pin.value && (
                        <BlueprintPinText
                          isValue
                          text={pin.value}
                          onHide={() => setTooltip(null)}
                          onShow={showTooltip}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="bp-pin-column is-output">
                  {(node.outputs ?? []).map((pin) => (
                    <div className="bp-pin" key={pin.id}>
                      {pin.value && (
                        <BlueprintPinText
                          isValue
                          text={pin.value}
                          onHide={() => setTooltip(null)}
                          onShow={showTooltip}
                        />
                      )}
                      {pin.label && (
                        <BlueprintPinText
                          text={pin.label}
                          onHide={() => setTooltip(null)}
                          onShow={showTooltip}
                        />
                      )}
                      <BlueprintPinGlyph
                        connected={connectedPins.has(pinKey(node.id, pin.id))}
                        side="output"
                        type={pin.type}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
          </div>
        </div>
      </div>
      {tooltip && (
        <div
          className="bp-tooltip"
          role="tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.text}
        </div>
      )}
    </figure>
  );
};
