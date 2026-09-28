import { describe, expect, it } from "vitest";
import { MIN_AREA_SIZE, fitGroupFrames, isValidAreaSize, normalizeRect } from "./areas.js";

describe("normalizeRect", () => {
  it("anchors top-left for a left→right, up→down drag", () => {
    expect(normalizeRect({ x: 100, y: 100 }, { x: 200, y: 260 })).toEqual({
      x: 100,
      y: 100,
      width: 100,
      height: 160,
    });
  });

  it("normalizes a right→left drag", () => {
    expect(normalizeRect({ x: 300, y: 100 }, { x: 100, y: 260 })).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 160,
    });
  });

  it("normalizes a down→up drag", () => {
    expect(normalizeRect({ x: 100, y: 400 }, { x: 200, y: 200 })).toEqual({
      x: 100,
      y: 200,
      width: 100,
      height: 200,
    });
  });

  it("handles a diagonal drag in the opposite corner direction", () => {
    expect(normalizeRect({ x: 500, y: 500 }, { x: 200, y: 100 })).toEqual({
      x: 200,
      y: 100,
      width: 300,
      height: 400,
    });
  });

  it("produces zero size for a click in place", () => {
    expect(normalizeRect({ x: 10, y: 10 }, { x: 10, y: 10 })).toEqual({
      x: 10,
      y: 10,
      width: 0,
      height: 0,
    });
  });
});

describe("isValidAreaSize", () => {
  it("accepts areas at or above the minimum size", () => {
    expect(isValidAreaSize({ x: 0, y: 0, width: MIN_AREA_SIZE, height: MIN_AREA_SIZE })).toBe(true);
    expect(isValidAreaSize({ x: 0, y: 0, width: 400, height: 300 })).toBe(true);
  });

  it("rejects stray clicks and thin drags", () => {
    expect(isValidAreaSize({ x: 0, y: 0, width: 0, height: 0 })).toBe(false);
    expect(isValidAreaSize({ x: 0, y: 0, width: 10, height: 400 })).toBe(false);
    expect(isValidAreaSize({ x: 0, y: 0, width: 400, height: 10 })).toBe(false);
  });
});
describe("fitGroupFrames", () => {
  const frame = {
    id: "f",
    position: { x: 0, y: 0 },
    style: { width: 100, height: 100 },
    data: { fit: { ids: ["a", "b"], pad: 20 } },
  };
  it("sizes a frame to hug its measured boxes, keeping its corner", () => {
    const nodes = [
      frame,
      { id: "a", position: { x: 20, y: 46 }, measured: { width: 300, height: 200 } },
      { id: "b", position: { x: 400, y: 46 }, measured: { width: 300, height: 500 } },
    ];
    const out = fitGroupFrames(nodes as any)[0] as any;
    expect(out.position).toEqual({ x: 0, y: 0 });
    expect(out.style).toMatchObject({ width: 720, height: 566 });
  });
  it("stops fitting once the frame has been resized by hand", () => {
    const resized = { ...frame, width: 900, height: 400 };
    const nodes = [resized, { id: "a", position: { x: 20, y: 46 }, measured: { width: 300, height: 200 } }];
    expect(fitGroupFrames(nodes as any)[0]).toBe(resized);
  });
  it("keeps the stored size until the boxes are measured", () => {
    const nodes = [frame, { id: "a", position: { x: 20, y: 46 } }];
    expect(fitGroupFrames(nodes as any)[0]).toBe(frame);
  });
});
