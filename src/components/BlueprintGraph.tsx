import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  typeName?: string;
  tooltip?: string;
};

export type BlueprintNode = {
  id: string;
  title: string;
  subtitle?: string;
  tooltip?: string;
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
  copyText?: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
};

const defaultNodeWidth = 250;
const headerHeight = 50;
const bodyPaddingTop = 5;
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

const pinTypeNames: Record<BlueprintPinType, string> = {
  exec: "Exec",
  object: "Object Reference",
  string: "String",
  name: "Name",
  struct: "Structure",
  boolean: "Boolean",
  number: "Number",
};

type TooltipState = {
  body?: string;
  colour: string;
  left: number;
  placement: "above" | "below";
  title: string;
  top: number;
  typeName?: string;
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
  pinKey: key,
  side,
  type,
}: {
  connected: boolean;
  pinKey: string;
  side: "input" | "output";
  type: BlueprintPinType;
}) => (
  <span
    className={`bp-pin-glyph${type === "exec" ? " is-exec" : ""}${connected ? " is-connected" : ""} is-${side}`}
    data-pin-key={key}
    data-pin-side={side}
    style={{ "--pin-colour": pinColours[type] } as CSSProperties}
    aria-hidden="true"
  />
);

type PinPoint = { x: number; y: number; type: BlueprintPinType };

export const BlueprintGraph = ({ graph }: { graph: BlueprintGraphData }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
  } | null>(null);
  const zoomRef = useRef(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoomMode, setZoomMode] = useState<"automatic" | "fit" | "manual">("automatic");
  const [manualZoom, setManualZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [copied, setCopied] = useState(false);
  const [pinLayout, setPinLayout] = useState<Record<string, { x: number; y: number }>>({});
  const hideTooltipTimer = useRef(0);

  const copyNodes = async () => {
    if (!graph.copyText) return;
    try {
      await navigator.clipboard.writeText(graph.copyText);
    } catch {
      const field = document.createElement("textarea");
      field.value = graph.copyText;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const dimensions = useMemo(() => ({
    width: Math.max(...graph.nodes.map((node) => node.x + (node.width ?? defaultNodeWidth)), 600) + 44,
    height: Math.max(...graph.nodes.map((node) => node.y + nodeHeight(node)), 260) + 44,
  }), [graph.nodes]);

  const fitZoom = viewportSize.width > 0
    ? Math.min(
      1,
      Math.max(
        0.25,
        Math.min(
          (viewportSize.width - 2) / dimensions.width,
          (viewportSize.height - 2) / dimensions.height,
        ),
      ),
    )
    : 1;
  const zoom = zoomMode === "manual"
    ? manualZoom
    : zoomMode === "fit"
      ? fitZoom
      : 1;
  zoomRef.current = zoom;
  const isFitZoom = zoomMode === "fit";

  const applyZoom = (nextZoom: number, originX?: number, originY?: number) => {
    const viewport = viewportRef.current;
    const clamped = Math.min(1.3, Math.max(0.25, nextZoom));
    if (viewport) {
      const ox = originX ?? viewport.clientWidth / 2;
      const oy = originY ?? viewport.clientHeight / 2;
      const worldX = (viewport.scrollLeft + ox) / zoomRef.current;
      const worldY = (viewport.scrollTop + oy) / zoomRef.current;
      requestAnimationFrame(() => {
        viewport.scrollLeft = worldX * clamped - ox;
        viewport.scrollTop = worldY * clamped - oy;
      });
    }
    setManualZoom(clamped);
    setZoomMode("manual");
  };
  const applyZoomRef = useRef(applyZoom);
  applyZoomRef.current = applyZoom;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;

    const measure = () => {
      const origin = surface.getBoundingClientRect();
      const scale = zoomRef.current || 1;
      if (origin.width === 0) return;
      const next: Record<string, { x: number; y: number }> = {};
      surface.querySelectorAll<HTMLElement>("[data-pin-key]").forEach((element) => {
        const key = element.dataset.pinKey;
        if (!key) return;
        const bounds = element.getBoundingClientRect();
        const exec = element.classList.contains("is-exec");
        const side = element.dataset.pinSide;
        const x = exec
          ? (side === "output" ? bounds.right : bounds.left) - origin.left
          : bounds.left + bounds.width / 2 - origin.left;
        next[key] = {
          x: x / scale,
          y: (bounds.top + bounds.height / 2 - origin.top) / scale,
        };
      });
      setPinLayout((current) => {
        const keys = Object.keys(next);
        if (
          keys.length === Object.keys(current).length
          && keys.every((key) => current[key] && Math.abs(current[key].x - next[key].x) < 0.5 && Math.abs(current[key].y - next[key].y) < 0.5)
        ) {
          return current;
        }
        return next;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    surface.querySelectorAll(".bp-node").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [graph, zoom]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 1) return;
      viewport.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        moved: false,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved) {
        if (dx * dx + dy * dy < 16) return;
        drag.moved = true;
        setTooltip(null);
        setDragging(true);
      }
      viewport.scrollLeft = drag.scrollLeft - dx;
      viewport.scrollTop = drag.scrollTop - dy;
    };

    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      setDragging(false);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault();
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      applyZoomRef.current(
        zoomRef.current * (event.deltaY < 0 ? 1.1 : 1 / 1.1),
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("lostpointercapture", onPointerUp);
    viewport.addEventListener("mousedown", onMouseDown);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
      viewport.removeEventListener("lostpointercapture", onPointerUp);
      viewport.removeEventListener("mousedown", onMouseDown);
      viewport.removeEventListener("wheel", onWheel);
    };
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

  const pinPoint = (nodeId: string, pinId: string, side: "input" | "output"): PinPoint | null => {
    const node = nodeById.get(nodeId);
    if (!node) return null;
    const pins = side === "input" ? node.inputs ?? [] : node.outputs ?? [];
    const index = pins.findIndex((pin) => pin.id === pinId);
    if (index < 0) return null;
    const measured = pinLayout[pinKey(nodeId, pinId)];
    const width = node.width ?? defaultNodeWidth;
    const inset = pins[index].type === "exec" ? 14 : 13;
    return {
      x: measured?.x ?? node.x + (side === "output" ? width - inset : inset),
      y: measured?.y ?? node.y + headerHeight + bodyPaddingTop + index * pinHeight + pinHeight / 2,
      type: pins[index].type,
    };
  };

  const showTooltip = (
    element: HTMLElement,
    content: { title: string; typeName?: string; body?: string; colour: string },
  ) => {
    if (dragRef.current?.moved) return;
    window.clearTimeout(hideTooltipTimer.current);
    const bounds = element.getBoundingClientRect();
    const halfWidth = Math.min(160, window.innerWidth / 2 - 12);
    const placement = bounds.top < 96 ? "below" : "above";
    setTooltip({
      ...content,
      left: Math.min(window.innerWidth - halfWidth, Math.max(halfWidth, bounds.left + bounds.width / 2)),
      placement,
      top: placement === "above" ? bounds.top - 6 : bounds.bottom + 6,
    });
  };

  const showPinTooltip = (pin: BlueprintPin, element: HTMLElement) => {
    if (pin.type === "exec" && !pin.tooltip && !pin.label) return;
    showTooltip(element, {
      title: pin.label || pin.id,
      typeName: pin.typeName ?? pinTypeNames[pin.type],
      body: pin.tooltip,
      colour: pinColours[pin.type],
    });
  };

  const hideHover = () => {
    window.clearTimeout(hideTooltipTimer.current);
    hideTooltipTimer.current = window.setTimeout(() => {
      setHoveredPin(null);
      setTooltip(null);
    }, 60);
  };

  return (
    <figure className="bp-figure" aria-label={graph.title}>
      <figcaption>
        <div className="bp-caption-copy">
          <strong>{graph.title}</strong>
          <span>{graph.description}</span>
        </div>
        <div className="bp-toolbar">
          {graph.copyText && (
            <button
              type="button"
              className="bp-copy"
              aria-label="Copy Blueprint nodes for the Unreal editor"
              onClick={copyNodes}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <div className="bp-zoom-controls" aria-label="Blueprint graph zoom controls">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => applyZoom(zoom - 0.1)}
            >
              -
            </button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => applyZoom(zoom + 0.1)}
            >
              +
            </button>
            <button
              className={isFitZoom ? "is-active" : ""}
              type="button"
              onClick={() => {
                const viewport = viewportRef.current;
                setZoomMode("fit");
                if (viewport) {
                  viewport.scrollLeft = 0;
                  viewport.scrollTop = 0;
                }
              }}
            >
              Fit
            </button>
          </div>
        </div>
      </figcaption>
      <div
        className={`bp-scroll${dragging ? " is-dragging" : ""}`}
        ref={viewportRef}
      >
        <div
          className="bp-stage"
          style={{
            width: dimensions.width * zoom,
            height: dimensions.height * zoom,
          }}
        >
          <div
            className="bp-surface"
            ref={surfaceRef}
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
              const hot = hoveredPin === pinKey(connection.from[0], connection.from[1])
                || hoveredPin === pinKey(connection.to[0], connection.to[1]);
              return (
                <g className={`bp-wire is-${from.type}${hot ? " is-hot" : ""}`} key={key}>
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
              <header
                onMouseEnter={(event) => {
                  if (!node.tooltip) return;
                  showTooltip(event.currentTarget, {
                    title: node.title,
                    body: node.tooltip,
                    colour: nodeAccentColours[node.kind],
                  });
                }}
                onMouseLeave={hideHover}
              >
                <strong>{node.title}</strong>
                {node.subtitle && <span>{node.subtitle}</span>}
              </header>
              <div className="bp-node-body">
                <div className="bp-pin-column is-input">
                  {(node.inputs ?? []).map((pin) => (
                    <div
                      className={`bp-pin${hoveredPin === pinKey(node.id, pin.id) ? " is-hot" : ""}`}
                      key={pin.id}
                      onMouseEnter={(event) => {
                        window.clearTimeout(hideTooltipTimer.current);
                        setHoveredPin(pinKey(node.id, pin.id));
                        showPinTooltip(pin, event.currentTarget);
                      }}
                      onMouseLeave={hideHover}
                    >
                      <BlueprintPinGlyph
                        connected={connectedPins.has(pinKey(node.id, pin.id))}
                        pinKey={pinKey(node.id, pin.id)}
                        side="input"
                        type={pin.type}
                      />
                      {pin.label && (
                        <BlueprintPinText
                          text={pin.label}
                          onHide={() => undefined}
                          onShow={(_text, element) => showTooltip(element, {
                            title: pin.label,
                            typeName: pin.typeName ?? pinTypeNames[pin.type],
                            body: pin.tooltip,
                            colour: pinColours[pin.type],
                          })}
                        />
                      )}
                      {pin.type === "boolean" && pin.value
                        ? <span className={`bp-checkbox${pin.value === "true" ? " is-on" : ""}`} aria-hidden="true" />
                        : pin.value && (
                          <BlueprintPinText
                            isValue
                            text={pin.value}
                            onHide={() => undefined}
                            onShow={(text, element) => showTooltip(element, {
                              title: pin.label || pin.id,
                              typeName: pin.typeName ?? pinTypeNames[pin.type],
                              body: pin.tooltip ?? text,
                              colour: pinColours[pin.type],
                            })}
                          />
                        )}
                    </div>
                  ))}
                </div>
                <div className="bp-pin-column is-output">
                  {(node.outputs ?? []).map((pin) => (
                    <div
                      className={`bp-pin${hoveredPin === pinKey(node.id, pin.id) ? " is-hot" : ""}`}
                      key={pin.id}
                      onMouseEnter={(event) => {
                        window.clearTimeout(hideTooltipTimer.current);
                        setHoveredPin(pinKey(node.id, pin.id));
                        showPinTooltip(pin, event.currentTarget);
                      }}
                      onMouseLeave={hideHover}
                    >
                      {pin.value && (
                        <BlueprintPinText
                          isValue
                          text={pin.value}
                          onHide={() => undefined}
                          onShow={(text, element) => showTooltip(element, {
                            title: pin.label || pin.id,
                            typeName: pin.typeName ?? pinTypeNames[pin.type],
                            body: pin.tooltip ?? text,
                            colour: pinColours[pin.type],
                          })}
                        />
                      )}
                      {pin.label && (
                        <BlueprintPinText
                          text={pin.label}
                          onHide={() => undefined}
                          onShow={(_text, element) => showTooltip(element, {
                            title: pin.label,
                            typeName: pin.typeName ?? pinTypeNames[pin.type],
                            body: pin.tooltip,
                            colour: pinColours[pin.type],
                          })}
                        />
                      )}
                      <BlueprintPinGlyph
                        connected={connectedPins.has(pinKey(node.id, pin.id))}
                        pinKey={pinKey(node.id, pin.id)}
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
          className={`bp-tooltip is-${tooltip.placement}`}
          role="tooltip"
          style={{
            "--tooltip-accent": tooltip.colour,
            left: tooltip.left,
            top: tooltip.top,
          } as CSSProperties}
        >
          <strong>{tooltip.title}</strong>
          {tooltip.typeName && <span className="bp-tooltip-type">{tooltip.typeName}</span>}
          {tooltip.body && <p>{tooltip.body}</p>}
        </div>
      )}
    </figure>
  );
};
