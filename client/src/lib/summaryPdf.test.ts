import { describe, expect, it } from "vitest";
import { buildSummaryPdf, splitLabel, toPdfText } from "./summaryPdf";

describe("toPdfText", () => {
  it("maps typographic characters to Latin-1", () => {
    expect(toPdfText("“Quote” — it’s fine…")).toBe('"Quote" - it\'s fine...');
  });

  it("drops characters Helvetica cannot draw", () => {
    expect(toPdfText("Great 🎉 result  ✓")).toBe("Great result");
  });
});

describe("splitLabel", () => {
  it("splits a short label from its description", () => {
    expect(splitLabel("Trust: users doubt the data")).toEqual({
      label: "Trust",
      body: "users doubt the data",
    });
  });

  it("leaves plain items alone", () => {
    expect(splitLabel("Interview five more nurses")).toEqual({
      label: "",
      body: "Interview five more nurses",
    });
  });
});

describe("buildSummaryPdf", () => {
  it("paginates long summaries", () => {
    const long = "word ".repeat(60).trim();
    const sections = Array.from({ length: 6 }, (_, i) => ({
      title: `Section ${i}`,
      items: Array.from({ length: 8 }, (_, j) => `Item ${j}: ${long}`),
    }));
    const pdf = buildSummaryPdf(sections, new Date(2026, 0, 1));
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
  });
});
