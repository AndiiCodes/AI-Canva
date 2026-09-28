import { jsPDF } from "jspdf";

export type PdfSection = {
  title: string;
  items: string[];
};

/**
 * jsPDF's built-in Helvetica only covers Latin-1. A single character outside
 * it (curly quotes, "…", "—", emoji) makes jsPDF encode the whole string
 * differently and the line comes out garbled / letter-spaced. Map the common
 * typographic characters to plain equivalents and drop anything else.
 */
export function toPdfText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●◦‣]/g, "-")
    .replace(/[  -​ ]/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA1-\xFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Splits "Label: description" so the label can be set in bold. */
export function splitLabel(item: string): { label: string; body: string } {
  const match = /^([^:]{1,60}):\s+(.+)$/s.exec(item);
  if (!match) return { label: "", body: item };
  return { label: match[1].trim(), body: match[2].trim() };
}

const MM_PER_PT = 25.4 / 72;
const LINE_FACTOR = 1.4;

const INK: [number, number, number] = [22, 24, 29];
const TEXT: [number, number, number] = [55, 60, 70];
const MUTED: [number, number, number] = [110, 116, 128];
const RULE: [number, number, number] = [226, 229, 234];

export function buildSummaryPdf(sections: PdfSection[], date = new Date()): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.setLineHeightFactor(LINE_FACTOR);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const bottom = pageHeight - 22;
  const bodySize = 10.5;
  const lineHeight = bodySize * MM_PER_PT * LINE_FACTOR;
  const indent = 6;

  let y = margin + 6;

  const fits = (height: number) => y + height <= bottom;
  const newPage = () => {
    pdf.addPage();
    y = margin + 6;
  };

  // Title block
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...INK);
  pdf.text("Research Summary", margin, y);
  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...MUTED);
  const dateLabel = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  pdf.text(toPdfText(`Latest findings from your research pipeline - ${dateLabel}`), margin, y);
  y += 6;

  pdf.setDrawColor(...RULE);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Lays out one item; returns its lines so height can be measured first.
  const layoutItem = (raw: string) => {
    const { label, body } = splitLabel(toPdfText(raw));
    pdf.setFontSize(bodySize);
    // Label on its own bold line keeps wrapping simple and readable.
    pdf.setFont("helvetica", "bold");
    const labelLines: string[] = label ? pdf.splitTextToSize(label, contentWidth - indent) : [];
    pdf.setFont("helvetica", "normal");
    const bodyLines: string[] = body ? pdf.splitTextToSize(body, contentWidth - indent) : [];
    const height = (labelLines.length + bodyLines.length) * lineHeight;
    return { labelLines, bodyLines, height };
  };

  const headingHeight = 9;
  const itemGap = 3;

  sections.forEach((section, sectionIndex) => {
    const items = section.items.map(toPdfText).filter(Boolean);
    if (!items.length) return;

    const first = layoutItem(items[0]);
    // Keep the heading with its first item.
    if (!fits(headingHeight + first.height)) newPage();
    else if (sectionIndex > 0) y += 7;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.setCharSpace(0.4);
    pdf.text(toPdfText(section.title).toUpperCase(), margin, y);
    pdf.setCharSpace(0);
    y += headingHeight - 3;

    items.forEach((item) => {
      const { labelLines, bodyLines, height } = layoutItem(item);
      if (!fits(height)) newPage();

      // Baseline of the first line sits ~0.75 of a line below y.
      const baseline = y + lineHeight * 0.75;

      pdf.setFillColor(...MUTED);
      pdf.circle(margin + 1.4, baseline - 1.2, 0.8, "F");

      pdf.setFontSize(bodySize);
      let lineY = baseline;
      if (labelLines.length) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...INK);
        pdf.text(labelLines, margin + indent, lineY);
        lineY += labelLines.length * lineHeight;
      }
      if (bodyLines.length) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...TEXT);
        pdf.text(bodyLines, margin + indent, lineY);
      }

      y += height + itemGap;
    });
  });

  // Footer on every page
  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(...RULE);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text("Research Summary", margin, pageHeight - 10);
    pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  return pdf;
}
