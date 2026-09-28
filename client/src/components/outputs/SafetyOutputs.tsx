import { useState } from "react";
import type { Risk } from "../../types";
import { useBoardStore } from "../../store/boardStore";
import { AlertIcon, CheckIcon } from "../ui/icons";

interface SafetyReviewerOutputProps {
  content: string;
  boxId: string;
}

/**
 * Renders Patient Safety Reviewer's structured JSON output as a review list:
 * a segmented progress bar, then every flag as a compact accordion row, then
 * a row per stage that was reviewed and found clear.
 *
 * Every risk is approved by default: a card with no recorded decision still
 * flows to UX Coach, it just doesn't count as reviewed. Approving marks it as
 * researcher-confirmed; dismissing (behind a confirm step) withholds it.
 * After a decision the next unreviewed flag opens automatically.
 */

/** Severity chip — only shown when the model output carries a severity. */
const SEVERITY_STYLE: Record<string, { label: string; cls: string }> = {
  high: { label: "HIGH", cls: "bg-[color:var(--red-bg)] text-[color:var(--red-text)]" },
  medium: { label: "MEDIUM", cls: "bg-[color:var(--amber-bg)] text-[color:var(--amber-text)]" },
  med: { label: "MEDIUM", cls: "bg-[color:var(--amber-bg)] text-[color:var(--amber-text)]" },
  low: { label: "LOW", cls: "bg-[color:var(--low-bg)] text-[color:var(--low-text)]" },
};

export default function SafetyReviewerOutput({
  content,
  boxId,
}: SafetyReviewerOutputProps) {
  // Which card is mid-confirmation. Local state: a half-finished dismissal is
  // not a decision, so it never reaches the store or Firestore.
  const [confirming, setConfirming] = useState<string | null>(null);
  // Accordion (view state only). undefined = default to the first
  // unreviewed flag; null = everything closed.
  const [openFlag, setOpenFlag] = useState<string | null | undefined>(undefined);

  const setApproval = useBoardStore((s) => s.setApproval);
  const approvals = useBoardStore((s) => s.boxData[boxId]?.approvals);

  let risks: Risk[] = [];
  let clearStages: string[] = [];
  let parseError = false;

  try {
    const parsed = JSON.parse(content);
    risks = Array.isArray(parsed.risks) ? parsed.risks : [];
    clearStages = Array.isArray(parsed.clear_stages) ? parsed.clear_stages : [];
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

  if (risks.length === 0 && clearStages.length === 0) {
    return (
      <div className="text-ink-muted text-[13px] py-8 text-center">
        No safety review produced.
      </div>
    );
  }

  // Counted from the risks array rather than the approvals map so decisions
  // left over from a previous run can never inflate the total.
  const reviewedCount = risks.filter((r) => approvals?.[r.id]).length;
  const firstPending = risks.find((r) => !approvals?.[r.id])?.id ?? null;
  const openId = openFlag === undefined ? firstPending ?? risks[0]?.id ?? null : openFlag;

  // Record a decision, then open the next unreviewed flag (after this one,
  // wrapping around).
  const decide = (riskId: string, status: "approved" | "dismissed") => {
    setApproval(boxId, riskId, status);
    const idx = risks.findIndex((r) => r.id === riskId);
    const order = [...risks.slice(idx + 1), ...risks.slice(0, idx)];
    const next = order.find((r) => !approvals?.[r.id]);
    setOpenFlag(next ? next.id : null);
  };

  return (
    <div className="nowheel">
      {risks.length > 0 && (
        <div className="px-3.5 py-3 border-b border-line-divider flex flex-col gap-[9px]">
          <span className="text-[13px] font-semibold text-ink">
            {reviewedCount === risks.length
              ? `All ${risks.length} flag${risks.length === 1 ? "" : "s"} reviewed`
              : `${reviewedCount} of ${risks.length} reviewed`}
          </span>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${risks.length}, minmax(0, 1fr))` }}
          >
            {risks.map((r) => {
              const d = approvals?.[r.id]?.status;
              return (
                <div
                  key={r.id}
                  className="h-1.5 rounded-[3px] transition-colors duration-200"
                  style={{
                    background:
                      d === "approved"
                        ? "var(--step-safety)"
                        : d === "dismissed"
                          ? "var(--dismissed)"
                          : "var(--divider-soft)",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="p-2 flex flex-col gap-1">
        {risks.map((risk) => {
          const decision = approvals?.[risk.id]?.status;
          const isDismissed = decision === "dismissed";
          const isApproved = decision === "approved";
          const isConfirming = confirming === risk.id;
          const isOpen = openId === risk.id;
          const severity = SEVERITY_STYLE[String((risk as any).severity ?? "").toLowerCase()];

          return (
            <div
              key={risk.id}
              className={"acc-row has-shadow" + (isOpen ? " is-open" : "")}
            >
              <button
                type="button"
                onClick={() => setOpenFlag(isOpen ? null : risk.id)}
                className="acc-head !items-start"
              >
                {severity && (
                  <span
                    className={
                      "w-[58px] h-5 flex-none grid place-items-center rounded-[5px] font-mono text-[10.5px] font-semibold tracking-[.04em] " +
                      severity.cls
                    }
                  >
                    {severity.label}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={
                      "text-[13.5px] font-semibold leading-[1.35] [text-wrap:pretty] " +
                      (decision ? "text-ink-muted" : "text-ink")
                    }
                  >
                    {risk.summary}
                  </div>
                  <div className="text-[12px] text-ink-muted mt-0.5">
                    {risk.category} · {risk.stage}
                  </div>
                </div>
                {isApproved && (
                  <span className="flex-none mt-0.5 font-mono text-[11px] font-semibold text-[color:var(--step-safety)]">
                    Approved
                  </span>
                )}
                {isDismissed && (
                  <span className="flex-none mt-0.5 font-mono text-[11px] font-semibold text-ink-faint">
                    Dismissed
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-3 pt-0.5 pb-3 flex flex-col gap-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip chip-red !h-[22px] !px-2">
                      {risk.category}
                    </span>
                    {!decision && (
                      <span className="chip !h-[22px] !px-2 font-medium border border-[color:var(--red-border)] text-[color:var(--red-text)]">
                        Human review required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap gap-2 text-[12.5px] text-ink-3">
                    Affected journey stage
                    <span className="chip chip-violet">{risk.stage}</span>
                  </div>

                  <div>
                    <div className="mono-label">Reason for flagging</div>
                    <p className="mt-1 mb-0 text-[13px] leading-[1.5] text-ink-2 [text-wrap:pretty]">
                      {risk.reason}
                    </p>
                  </div>

                  {/* Evidence trace: stage → theme → the original quote. */}
                  <div>
                    <div className="mono-label">Evidence trace</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="chip chip-neutral !h-auto !py-[3px] !px-2">
                        {risk.stage}
                      </span>
                      <span className="text-ink-icon text-[12px]">→</span>
                      <span className="chip chip-neutral !h-auto !py-[3px] !px-2 whitespace-normal">
                        {risk.theme}
                      </span>
                    </div>
                  </div>

                  {risk.evidence?.map((ev, i) => (
                    <div key={i} className="quote-box">
                      <span>&ldquo;{ev.quote}&rdquo;</span>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[12px] text-[color:var(--meta-text)]">— {ev.source}</span>
                        <span className="font-mono text-[10px] tracking-[.06em] text-ink-icon">
                          READ-ONLY
                        </span>
                      </div>
                    </div>
                  ))}

                  {isConfirming ? (
                    <div className="flex flex-col gap-2">
                      <p className="m-0 text-[13px] leading-[1.5] text-ink-2">
                        Remove this flag from UX Coach&apos;s advice?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            decide(risk.id, "dismissed");
                            setConfirming(null);
                          }}
                          className="btn btn-primary flex-1 !h-8"
                        >
                          Yes, dismiss
                        </button>
                        <button
                          onClick={() => setConfirming(null)}
                          className="btn btn-secondary flex-1 !h-8"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(risk.id, "approved")}
                        className={
                          "btn flex-1 !h-8 " +
                          (isApproved || !decision ? "btn-primary" : "btn-secondary")
                        }
                      >
                        {isApproved && <CheckIcon />}
                        {isApproved ? "Approved" : "Approve"}
                      </button>

                      {!isDismissed && (
                        <button
                          onClick={() => setConfirming(risk.id)}
                          className="btn btn-secondary flex-1 !h-8"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Stages the reviewer checked and found clear. */}
        {clearStages.map((stage) => (
          <div
            key={stage}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] border border-dashed border-line-soft"
          >
            <span className="chip chip-violet">{stage}</span>
            <span className="text-[12.5px] text-ink-muted">
              No safety concerns identified for this stage
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
