import { useMemo } from "react";
import { DownloadIcon } from "../ui/icons";
import { jsPDF } from "jspdf";
import { useBoardStore } from "../../store/boardStore";

type BoxType = "insight" | "journey" | "safety" | "coach";

type InsightOutput = {
  themes?: Array<{
    theme?: string;
    description?: string;
  }>;
};

type JourneyOutput = {
  stages?: Array<{
    stage_name?: string;
    stage_description?: string;
  }>;
};

type SafetyOutput = {
  risks?: Array<{
    stage?: string;
    summary?: string;
  }>;
};

type CoachOutput = {
  guidance?: Array<{
    next_steps?: string[];
  }>;
  research_next?: Array<{
    question?: string;
  }>;
};

export type SummarySection = {
  title: string;
  items: string[];
};

function trimText(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}…`;
}

function parseOutput<T>(output: string): T | null {
  if (!output.trim()) {
    return null;
  }

  try {
    return JSON.parse(output) as T;
  } catch {
    return null;
  }
}

function buildSummary(
  insight: InsightOutput | null,
  journey: JourneyOutput | null,
  safety: SafetyOutput | null,
  coach: CoachOutput | null,
): SummarySection[] {
  const sections: SummarySection[] = [];

  if (insight?.themes?.length) {
    sections.push({
      title: "Key insights",
      items: insight.themes.slice(0, 8).map((theme) => {
        const name = trimText(theme.theme ?? "", 8);
        const description = trimText(theme.description ?? "", 24);

        return description ? `${name}: ${description}` : name;
      }),
    });
  }

  if (journey?.stages?.length) {
    sections.push({
      title: "User journey",
      items: journey.stages.slice(0, 8).map((stage) => {
        const name = stage.stage_name?.trim() ?? "";
        const description = trimText(stage.stage_description ?? "", 20);

        return description ? `${name}: ${description}` : name;
      }),
    });
  }

  if (safety?.risks?.length) {
    sections.push({
      title: "Safety considerations",
      items: safety.risks.slice(0, 8).map((risk) => {
        const stage = risk.stage?.trim() ?? "";
        const summary = trimText(risk.summary ?? "", 20);

        return stage ? `${stage}: ${summary}` : summary;
      }),
    });
  }

  if (coach?.guidance?.length) {
    const recommendations = coach.guidance
      .flatMap((guidance) => guidance.next_steps ?? [])
      .filter((step) => step.trim())
      .slice(0, 8)
      .map((step) => trimText(step, 18));

    if (recommendations.length) {
      sections.push({
        title: "Recommendations",
        items: recommendations,
      });
    }
  }

  if (coach?.research_next?.length) {
    const researchNext = coach.research_next
      .map((item) => item.question?.trim() ?? "")
      .filter(Boolean)
      .slice(0, 5)
      .map((question) => trimText(question, 20));

    if (researchNext.length) {
      sections.push({
        title: "Research next",
        items: researchNext,
      });
    }
  }

  return sections;
}

/**
 * Alessio's summary logic (feature/summary-box), unchanged: reads the latest
 * output of each pipeline box on the board, by type, and turns it into
 * sections. It updates live — there is nothing to run. Shared by the node
 * header (section count) and the body below.
 */
export function useSummarySections(enabled = true): SummarySection[] {
  const nodes = useBoardStore((state) => state.nodes);
  const boxData = useBoardStore((state) => state.boxData);

  const sections = useMemo(() => {
    // Only the summary box needs this; other boxes skip the parsing.
    if (!enabled) return [];

    const getOutput = (type: BoxType): string => {
      const node = nodes.find((candidate) => candidate.type === type);

      if (!node) {
        return "";
      }

      return boxData[node.id]?.output ?? "";
    };

    const insight = parseOutput<InsightOutput>(getOutput("insight"));
    const journey = parseOutput<JourneyOutput>(getOutput("journey"));
    const safety = parseOutput<SafetyOutput>(getOutput("safety"));
    const coach = parseOutput<CoachOutput>(getOutput("coach"));

    return buildSummary(insight, journey, safety, coach);
  }, [nodes, boxData, enabled]);

  return sections;
}

type SummaryNodeProps = {
  sections: SummarySection[];
};

/**
 * PDF Summary body, restyled to the research-canvas theme. The node shell
 * (tile, title, status, ⋯ menu with Delete) comes from BoxNode.
 */
export default function SummaryNode({ sections }: SummaryNodeProps) {
  const handleDownload = () => {
    if (sections.length === 0) {
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let y = 24;

    const addPageIfNeeded = (height: number) => {
      if (y + height > pageHeight - 20) {
        pdf.addPage();
        y = 24;
      }
    };

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(15, 23, 42);

    pdf.text("Research Summary", margin, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);

    pdf.text("Latest findings from your research pipeline", margin, y);

    y += 12;

    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y, pageWidth - margin, y);

    y += 12;

    sections.forEach((section) => {
      addPageIfNeeded(20);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);

      pdf.text(section.title.toUpperCase(), margin, y);

      y += 7;

      section.items.forEach((item) => {
        const lines = pdf.splitTextToSize(item, contentWidth - 7);
        const itemHeight = lines.length * 5 + 4;

        addPageIfNeeded(itemHeight);

        pdf.setFillColor(148, 163, 184);
        pdf.circle(margin + 1.5, y - 1.5, 1.2, "F");

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        pdf.setTextColor(51, 65, 85);

        pdf.text(lines, margin + 7, y);

        y += itemHeight;
      });

      y += 6;
    });

    // Footer / page numbers
    const pageCount = pdf.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);

      pdf.text(
        `Research Summary • ${page} / ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        {
          align: "center",
        },
      );
    }

    pdf.save("research-summary.pdf");
  };

  if (sections.length === 0) {
    return (
      <div className="px-7 py-10 flex flex-col items-center gap-3.5 text-center">
        <p className="m-0 text-[14px] font-semibold text-ink">No findings yet</p>
        <p className="m-0 max-w-[300px] text-[13.5px] leading-[1.55] text-ink-3 [text-wrap:pretty]">
          Run your research pipeline to populate the summary.
        </p>
      </div>
    );
  }

  return (
    <div className="nowheel px-4 pt-3.5 pb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label">Latest findings from your research pipeline</span>
        <button
          type="button"
          onClick={handleDownload}
          className="btn btn-secondary btn-sm nodrag flex-none"
          title="Download PDF"
        >
          <DownloadIcon /> Download PDF
        </button>
      </div>

      {sections.map((section) => (
        <section
          key={section.title}
          className="summary-section pt-3 border-t border-line-divider"
        >
          <h3 className="mono-label m-0 mb-2">{section.title}</h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {section.items.map((item, index) => (
              <li
                key={`${section.title}-${index}`}
                className="flex gap-2.5 items-start text-[13px] leading-[1.5] text-ink-2"
              >
                <span
                  className="mt-[7px] w-1.5 h-1.5 flex-none rounded-full bg-[color:var(--icon-muted)]"
                  aria-hidden
                />
                <span className="[text-wrap:pretty]">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
