import { useState, useEffect } from "react";
import type { Theme } from "../../types";
import { useBoardStore } from "../../store/boardStore";
import { sourceCode } from "../../lib/nodeView";
import { AlertIcon, CaretIcon, RerunIcon, Spinner } from "../ui/icons";

interface InsightWeaverOutputProps {
  content: string;
  boxId: string;
  showHistory: boolean;
  onRevertComplete?: () => void;
}

/**
 * Theme Finder (Insight Weaver) themes as cards, ranked by how many
 * supporting quotes they have (shown as a count). One card open at a time;
 * the first is open by default. Per-theme Rerun is always visible on each
 * card.
 */
export default function InsightWeaverOutput({
  content,
  boxId,
  showHistory,
  onRevertComplete,
}: InsightWeaverOutputProps) {
  // Accordion: index into the ORIGINAL themes array (null = all closed,
  // undefined = default to the top-ranked theme).
  const [openTheme, setOpenTheme] = useState<number | null | undefined>(undefined);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(
    null,
  );
  const [viewingVersion, setViewingVersion] = useState<string | null>(null);
  const [showConfirmRevert, setShowConfirmRevert] = useState(false);

  const rerunTheme = useBoardStore((s) => s.rerunTheme);
  const revertToVersion = useBoardStore((s) => s.revertToVersion);
  const boxData = useBoardStore((s) => s.boxData[boxId]);

  useEffect(() => {
    if (!showHistory) setViewingVersion(null);
  }, [showHistory]);

  async function handleReject(themeIndex: number) {
    setRegeneratingIndex(themeIndex);
    await rerunTheme(boxId, themeIndex);
    setRegeneratingIndex(null);
  }

  const viewingEntry =
    viewingVersion !== null
      ? boxData.history?.find((entry) => entry.id === viewingVersion)
      : null;

  const displayContent = viewingEntry?.output ?? content;

  let themes: Theme[] = [];
  let parseError = false;

  try {
    const parsed = JSON.parse(displayContent);
    themes = Array.isArray(parsed.themes) ? parsed.themes : [];
  } catch {
    parseError = true;
  }

  // Rank by supporting quotes, highest first. Keep each theme's original
  // index: the store's rerunTheme addresses themes by their position in the
  // output.
  const ranked = themes
    .map((theme, index) => ({ theme, index, count: theme.evidence?.length ?? 0 }))
    .sort((a, b) => b.count - a.count || a.index - b.index);
  const openIndex = openTheme === undefined ? ranked[0]?.index ?? null : openTheme;

  const renderThemeCards = (readOnly: boolean) => (
    <>
      {parseError ? (
        <div className="m-2 p-3 rounded-lg bg-[color:var(--amber-bg)] text-[color:var(--amber-text)] text-[13px]">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertIcon /> Could not parse structured output. Showing raw text below.
          </span>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[11.5px] text-ink-3">
            {displayContent}
          </pre>
        </div>
      ) : themes.length === 0 ? (
        <div className="text-ink-muted text-[13px] py-8 text-center">
          No themes found in the research material.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between pt-2 pb-0.5 pl-[35px] pr-3 mono-label">
            <span>Theme</span>
            <span>Quotes</span>
          </div>
          {ranked.map(({ theme, index: i, count }) => {
            const isOpen = openIndex === i;
            const isRegenerating = regeneratingIndex === i;
            return (
              <div key={i} className={"acc-row" + (isOpen ? " is-open" : "")}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setOpenTheme(isOpen ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenTheme(isOpen ? null : i);
                    }
                  }}
                  className="acc-head nodrag"
                >
                  <CaretIcon className={"caret" + (isOpen ? " is-open" : "")} />
                  <span className="flex-1 min-w-0 text-[13.5px] leading-[1.35] font-medium text-ink [text-wrap:pretty]">
                    {isRegenerating ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-muted">
                        <Spinner /> Regenerating…
                      </span>
                    ) : (
                      theme.theme
                    )}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(i);
                      }}
                      disabled={regeneratingIndex !== null}
                      className="btn btn-secondary btn-sm !h-[26px] !px-2 flex-none"
                      title="Reject & regenerate this theme"
                    >
                      <RerunIcon size={12} /> Rerun
                    </button>
                  )}
                  <span
                    className="min-w-[26px] h-[22px] px-1.5 flex-none grid place-items-center rounded-[6px] bg-surface-muted font-mono text-[12px] font-semibold text-ink"
                    title={`${count} supporting ${count === 1 ? "quote" : "quotes"}`}
                  >
                    {count}
                  </span>
                </div>

                {isOpen && (
                  <div className="pl-[35px] pr-3 pt-0.5 pb-3 flex flex-col gap-1.5 anim-fade-up">
                    {theme.description && (
                      <p className="m-0 mb-0.5 text-[13px] leading-[1.5] text-ink-2 [text-wrap:pretty]">
                        {theme.description}
                      </p>
                    )}
                    {theme.evidence?.map((ev, j) => (
                      <div
                        key={j}
                        className="flex gap-2.5 items-start bg-surface-sunken rounded-lg px-[11px] py-[9px] text-[12.5px] leading-[1.5] text-[color:var(--quote-text)]"
                      >
                        <span
                          className="flex-none mt-px font-mono text-[10.5px] font-semibold px-[5px] py-px rounded bg-ink text-on-ink"
                          title={ev.source}
                        >
                          {sourceCode(ev.source)}
                        </span>
                        <span className="flex-1 min-w-0">
                          &ldquo;{ev.quote}&rdquo;
                          <span
                            title={
                              ev.verified
                                ? "This quote appears word for word in the source transcript."
                                : "This quote does not match the transcript exactly — the wording may have been altered. Check it against the source before using it."
                            }
                            className={
                              "ml-1.5 align-middle inline-flex items-center h-[18px] px-1.5 rounded font-mono text-[10.5px] font-semibold uppercase tracking-[.04em] cursor-help " +
                              (ev.verified
                                ? "bg-surface-muted text-ink-muted"
                                : "bg-[color:var(--amber-bg)] text-[color:var(--amber-text)]")
                            }
                          >
                            {ev.verified ? "Verified" : "Unverified"}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="nowheel px-2 pt-1 pb-2.5">
      {viewingVersion !== null ? (
        <div>
          <div className="flex items-center justify-between px-2.5 py-1.5 my-1.5 bg-surface-sunken rounded-lg text-[12px]">
            <button
              onClick={() => setViewingVersion(null)}
              className="flex items-center gap-1 text-ink-3 hover:text-ink font-medium"
              title="Back to history list"
            >
              ←{" "}
              {viewingEntry &&
                new Date(viewingEntry.timestamp).toLocaleString()}
            </button>
            <button
              onClick={() => setShowConfirmRevert(true)}
              className="btn btn-secondary btn-sm !h-[26px]"
            >
              Revert
            </button>
          </div>
          {renderThemeCards(true)}
        </div>
      ) : showHistory ? (
        <div className="pt-1.5">
          <div className="mono-label px-2.5 pb-1.5">Run history</div>
          {!boxData.history?.length ? (
            <div className="text-ink-muted text-[13px] py-6 text-center">
              No history yet.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {boxData.history.map((entry) => {
                const isCurrent = entry.id === boxData.currentVersionId;

                return (
                  <button
                    key={entry.id}
                    onClick={() => setViewingVersion(entry.id)}
                    disabled={isCurrent}
                    className={
                      "w-full text-left px-2.5 py-2 rounded-[9px] border text-[13px] transition-colors " +
                      (isCurrent
                        ? "border-line bg-surface text-ink cursor-default"
                        : "border-transparent text-ink-2 hover:bg-surface-sunken")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>

                      {isCurrent && (
                        <span className="mono-label !text-ink-3 font-semibold">
                          current
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        renderThemeCards(false)
      )}

      {showConfirmRevert && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,.35)] flex items-center justify-center z-50"
          onClick={() => setShowConfirmRevert(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-xl border border-line p-4 [box-shadow:var(--shadow-node)] max-w-xs"
          >
            <p className="text-[13px] text-ink-2 mb-3">
              Revert to this version?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmRevert(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  revertToVersion(boxId, viewingVersion!);
                  setShowConfirmRevert(false);
                  setViewingVersion(null);
                  onRevertComplete?.();
                }}
                className="btn btn-primary btn-sm"
              >
                Revert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
