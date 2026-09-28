/**
 * Pure geometry helpers for drawing rectangular areas on the canvas.
 * Areas are React Flow nodes (type "area", zIndex -1 so they render BELOW
 * boxes) whose bounds come from a drag gesture: `start` is where the mouse
 * went down and `end` where it was released — in flow coordinates.
 */

/**
 * The neutral group-frame look (design tokens group-fill / group-border).
 * Used by the demo board's frames and offered in the area colour picker.
 */
export const NEUTRAL_AREA = {
  fill: "rgba(255,255,255,0.45)",
  border: "rgba(22,24,29,0.1)",
  name: "Neutral",
};

/** Drags smaller than this (in flow units) are treated as accidental clicks. */
export const MIN_AREA_SIZE = 24;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Normalizes a drag into a top-left anchored rectangle, regardless of the
 * direction the user dragged (left→right, right→left, up→down, down→up).
 */
export function normalizeRect(start: { x: number; y: number }, end: { x: number; y: number }): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/** True when a rect is big enough to be a deliberate area, not a stray click. */
export function isValidAreaSize(rect: Rect): boolean {
  return rect.width >= MIN_AREA_SIZE && rect.height >= MIN_AREA_SIZE;
}
/**
 * Group frames that hug their boxes. A frame node with `data.fit = { ids, pad }`
 * keeps its stored top-left corner (its caption is anchored there) but its
 * size follows the boxes inside: right/bottom edge = furthest box edge + pad.
 * Box sizes come from React Flow's measurements, so auto-height boxes that
 * grow after a run stretch the frame with them. Display only — the returned
 * nodes are not written back to the store.
 *
 * Once someone resizes the frame by hand (React Flow stores width/height on
 * the node), it stops following its boxes and keeps that size.
 */
export function fitGroupFrames<
  N extends {
    id: string;
    position: { x: number; y: number };
    style?: Record<string, any>;
    data?: any;
    width?: number;
    height?: number;
    measured?: { width?: number; height?: number };
  },
>(nodes: N[]): N[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const size = (n: N) => ({
    w: n.measured?.width ?? n.width ?? (Number(n.style?.width) || 0),
    h: n.measured?.height ?? n.height ?? (Number(n.style?.height) || 0),
  });
  return nodes.map((frame) => {
    const fit = frame.data?.fit as { ids: string[]; pad: number } | undefined;
    if (!fit || frame.width || frame.height) return frame;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const id of fit.ids) {
      const child = byId.get(id);
      if (!child) continue;
      const { w, h } = size(child);
      if (!w || !h) return frame; // not measured yet — keep the stored size
      right = Math.max(right, child.position.x + w);
      bottom = Math.max(bottom, child.position.y + h);
    }
    if (!isFinite(right) || !isFinite(bottom)) return frame;
    const width = Math.round(right + fit.pad - frame.position.x);
    const height = Math.round(bottom + fit.pad - frame.position.y);
    if (frame.style?.width === width && frame.style?.height === height) return frame;
    return { ...frame, style: { ...frame.style, width, height } };
  });
}
