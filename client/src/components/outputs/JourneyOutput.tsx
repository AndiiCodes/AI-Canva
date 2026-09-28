import { useId, useState } from "react";
import {
  contiguousRuns,
  emotionScore,
  smoothPath,
  stageHasFriction,
} from "../../lib/nodeView";
import { AlertIcon, CaretIcon } from "../ui/icons";

interface Evidence {
  quote: string;
  source: string;
}

interface Issue {
  theme_id: string;
  theme: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
  evidence: Evidence[];
}

interface Stage {
  stage_name: string;
  stage_description: string;
  emotion: string;
  issues: Issue[];
}

interface JourneyMapperOutputProps {
  content: string;
}

const SENTIMENT_LABEL: Record<string, string> = {
  negative: "Pain point",
  positive: "Works well",
  neutral: "Observation",
};

/** Chart geometry (viewBox units; the SVG scales to the node width). */
const CHART_MIN_W = 468;
const CHART_H = 168;
/**
 * Minimum width per stage column (px). With many stages the chart keeps
 * this spacing and scrolls sideways inside the box instead of squashing
 * the labels together.
 */
const MIN_STAGE_W = 96;
const PAD_TOP = 26;
const PAD_BOTTOM = 30;

export default function JourneyMapperOutput({
  content,
}: JourneyMapperOutputProps) {
  // Accordion over the stage list; the first stage is open by default.
  const [openStage, setOpenStage] = useState<number | null>(0);
  // Unique gradient id — several Journey boxes can share one page.
  const gradientId = "jmfill-" + useId().replace(/:/g, "");

  let stages: Stage[] = [];
  let parseError = false;

  try {
    const parsed = JSON.parse(content);
    stages = Array.isArray(parsed.stages) ? parsed.stages : [];
  } catch {
    parseError = true;
  }

  if (parseError) {
    return (
      <div className="m-3 p-3 rounded-lg bg-[color:var(--amber-bg)] text-[color:var(--amber-text)] text-[13px]">
        <span className="flex items-center gap-1.5 font-semibold">
          <AlertIcon /> Could not parse structured output. Showing raw text below.
        </span>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11.5px] leading-5 text-ink-3">
          {content}
        </pre>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="text-ink-muted text-[13px] py-8 text-center">
        No journey stages found.
      </div>
    );
  }

  const n = stages.length;
  const friction = stages.map(stageHasFriction);
  const frictionCount = friction.filter(Boolean).length;
  const bands = contiguousRuns(friction);
  const CHART_W = Math.max(CHART_MIN_W, n * MIN_STAGE_W);
  const colW = CHART_W / n;
  const usable = CHART_H - PAD_TOP - PAD_BOTTOM;
  const points: [number, number][] = stages.map((s, i) => [
    colW * i + colW / 2,
    PAD_TOP + ((100 - emotionScore(s.emotion, s.issues ?? [])) / 100) * usable,
  ]);
  const lowest = points.reduce((lo, p, i) => (p[1] > points[lo][1] ? i : lo), 0);
  const line = smoothPath(points);
  const area =
    n > 1
      ? `${line} L${points[n - 1][0].toFixed(1)} ${CHART_H} L${points[0][0].toFixed(1)} ${CHART_H} Z`
      : "";
  const pct = (x: number) => `${(x * 100) / n}%`;

  return (
    <div className="nowheel px-4 pt-3.5">
      <div className="mono-label mb-2">Emotion by stage</div>

      {/* Horizontal scroll only when the stages need more room than the box. */}
      <div className="nodrag overflow-x-auto -mx-4 px-4">
      <div className="relative" style={{ minWidth: n * MIN_STAGE_W }}>
        {/* Friction band(s): one per run of contiguous friction stages,
          from the chart top through the stage labels. */}
        {bands.map(([a, b], k) => (
          <div
            key={`band-${a}`}
            className="absolute top-0 bottom-0 rounded-t-md bg-[color:var(--amber-band)]"
            style={{ left: pct(a), width: pct(b - a + 1) }}
          >
            {k === 0 && (
              <div className="absolute left-0 top-2 pl-2.5 flex items-center gap-[5px] font-mono text-[10.5px] font-semibold tracking-[.06em] uppercase text-[color:var(--amber-text)] whitespace-nowrap">
                <AlertIcon />
                Friction · {frictionCount} {frictionCount === 1 ? "stage" : "stages"}
              </div>
            )}
          </div>
        ))}

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="relative block w-full h-auto overflow-visible"
          role="img"
          aria-label="Emotion by journey stage"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--step-journey)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--step-journey)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill={`url(#${gradientId})`} />}
          <path
            d={line}
            fill="none"
            stroke="var(--step-journey)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {points.map(([x, y], i) =>
            i === lowest ? (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={5.5}
                fill="var(--step-journey)"
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ) : (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4.5}
                fill="var(--surface)"
                stroke="var(--step-journey)"
                strokeWidth={2}
              />
            ),
          )}
          {n > 1 && (
            <text
              x={points[lowest][0]}
              // Below the point when there's room, otherwise above it, so the
              // label never sits on the curve or the axis.
              y={
                points[lowest][1] + 22 <= CHART_H - 6
                  ? points[lowest][1] + 22
                  : points[lowest][1] - 12
              }
              // Keep it inside the chart at the first / last column.
              textAnchor={lowest === 0 ? "start" : lowest === n - 1 ? "end" : "middle"}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fill: "var(--meta-text)" }}
            >
              Lowest point
            </text>
          )}
        </svg>

        <div
          className="relative grid border-t border-line-soft"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {stages.map((stage, i) => (
            <div
              key={i}
              className="px-1.5 pt-2.5 pb-3.5 flex flex-col items-center gap-[5px] text-center"
            >
              <span className="font-mono text-[10.5px] text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[12.5px] font-semibold leading-[1.3] text-ink break-words line-clamp-2"
                title={stage.stage_name}
              >
                {stage.stage_name}
              </span>
              {stage.emotion && (
                <span
                  className="font-mono text-[10.5px] tracking-[.05em] uppercase text-ink-3 break-words line-clamp-2"
                  title={stage.emotion}
                >
                  {stage.emotion}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Stage list — the existing expandable detail. */}
      <div className="mt-3 -mx-2 pb-2 flex flex-col gap-1">
        {stages.map((stage, i) => {
          const isOpen = openStage === i;
          const issues = stage.issues ?? [];

          return (
            <div key={i} className={"acc-row" + (isOpen ? " is-open" : "")}>
              <button
                type="button"
                onClick={() => setOpenStage(isOpen ? null : i)}
                className="acc-head"
              >
                <CaretIcon className={"caret" + (isOpen ? " is-open" : "")} />
                <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-ink truncate">
                  {i + 1}. {stage.stage_name}
                </span>
                {friction[i] && (
                  <span className="chip chip-amber">
                    <AlertIcon size={11} strokeWidth={2.2} />
                    Friction
                  </span>
                )}
                {stage.emotion && (
                  <span className="w-[84px] flex-none text-right font-mono text-[10.5px] tracking-[.05em] uppercase text-ink-3 truncate">
                    {stage.emotion}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="pl-[34px] pr-3 pb-3 flex flex-col gap-2.5">
                  <p className="m-0 text-[13px] leading-[1.5] text-ink-2 [text-wrap:pretty]">
                    {stage.stage_description}
                  </p>

                  {issues.length === 0 && (
                    <div className="text-[12.5px] text-ink-muted bg-surface-sunken rounded-lg px-3 py-2.5">
                      No research evidence found for this stage.
                    </div>
                  )}

                  {issues.map((issue, j) => (
                    <div
                      key={issue.theme_id || j}
                      className="border border-line-soft rounded-lg px-3 py-2.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono-label">Linked theme</span>
                        {issue.sentiment && (
                          <span
                            className={
                              "font-mono text-[10.5px] tracking-[.04em] uppercase " +
                              (issue.sentiment === "negative"
                                ? "text-[color:var(--amber-text)] font-semibold"
                                : "text-ink-faint")
                            }
                          >
                            {SENTIMENT_LABEL[issue.sentiment] ?? issue.sentiment}
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">
                        {issue.theme}
                      </span>
                      <p className="m-0 text-[12.5px] leading-[1.5] text-ink-2 [text-wrap:pretty]">
                        {issue.description}
                      </p>

                      {issue.evidence?.map((ev, k) => (
                        <div key={k} className="quote-box">
                          <span>&ldquo;{ev.quote}&rdquo;</span>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[12px] text-[color:var(--meta-text)]">
                              — {ev.source}
                            </span>
                            <span className="font-mono text-[10px] tracking-[.06em] text-ink-icon">
                              READ-ONLY
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
