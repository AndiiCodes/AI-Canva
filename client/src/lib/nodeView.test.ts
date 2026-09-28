import { describe, expect, it } from "vitest";
import {
  coachReviewCounts,
  contiguousRuns,
  displayTitle,
  emotionScore,
  resultSummary,
  safetyReviewCounts,
  sourceCode,
  tileText,
} from "./nodeView.js";

describe("displayTitle / tileText", () => {
  it("drops the Box suffix for display only", () => {
    expect(displayTitle("Insight Weaver Box")).toBe("Insight Weaver");
    expect(displayTitle("Participant P1")).toBe("Participant P1");
  });
  it("numbers AI steps and codes participants", () => {
    expect(tileText("journey", "Journey Mapper Box")).toBe("2");
    expect(tileText("text", "Participant P3")).toBe("P3");
    expect(tileText("text", "Text Context Box")).toBe("T");
  });
  it("shortens evidence sources", () => {
    expect(sourceCode("Participant P4")).toBe("P4");
    expect(sourceCode("notes.pdf")).toBe("notes.pdf");
  });
});

describe("resultSummary", () => {
  it("summarises each step", () => {
    expect(
      resultSummary("insight", JSON.stringify({ themes: [{}, {}] }), { inputCount: 3 }),
    ).toBe("2 themes · from 3 transcripts");
    expect(
      resultSummary(
        "journey",
        JSON.stringify({
          stages: [{ issues: [{ sentiment: "negative" }] }, { issues: [] }],
        }),
      ),
    ).toBe("2 stages · friction in 1");
    expect(
      resultSummary("safety", JSON.stringify({ risks: [{}], clear_stages: ["a"] })),
    ).toBe("1 flag · 1 stage clear");
  });
  it("returns null for unparseable output", () => {
    expect(resultSummary("insight", "not json")).toBeNull();
  });
});

describe("review counts", () => {
  const safety = JSON.stringify({ risks: [{ id: "r1" }, { id: "r2" }, { id: "r3" }] });
  const approvals = {
    r1: { status: "approved" as const, by: "a", at: 1 },
    r2: { status: "dismissed" as const, by: "a", at: 1 },
    stale: { status: "approved" as const, by: "a", at: 1 },
  };
  it("counts only current risks for Safety", () => {
    expect(safetyReviewCounts(safety, approvals)).toEqual({ total: 3, reviewed: 2 });
  });
  it("mirrors Safety decisions for Coach, hiding dismissed risks", () => {
    const coach = JSON.stringify({
      guidance: [{ risk_id: "r1" }, { risk_id: "r2" }, { risk_id: "r3" }],
    });
    expect(coachReviewCounts(coach, safety, approvals)).toEqual({ total: 2, reviewed: 1 });
  });
});

describe("journey chart helpers", () => {
  it("scores emotion words, falling back to sentiment", () => {
    expect(emotionScore("Exasperated")).toBeLessThan(emotionScore("Frustrated"));
    expect(emotionScore("Optimistic")).toBeGreaterThan(emotionScore("Uncertain"));
    expect(emotionScore("blorp", [{ sentiment: "negative" }])).toBeLessThan(50);
    expect(emotionScore(undefined)).toBe(50);
  });
  it("groups contiguous friction stages into bands", () => {
    expect(contiguousRuns([false, true, true, true, false])).toEqual([[1, 3]]);
    expect(contiguousRuns([true, false, true])).toEqual([
      [0, 0],
      [2, 2],
    ]);
  });
});
