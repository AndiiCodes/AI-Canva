import { memo, type CSSProperties } from "react";
import type { NodeProps } from "@xyflow/react";
import { useBoardStore } from "../store/boardStore.js";
import { AREA_COLORS } from "../types.js";
import { CloseIcon } from "./ui/icons.js";

/**
 * A drawn rectangular area — a background grouping region that sits UNDER
 * the boxes (created via zIndex -1 by `addArea` in boardStore). Renders as a
 * group frame: a light fill, 1px border and 16px radius. When selected, it shows a color
 * picker (very light palette) and a delete button; areas can also be moved
 * by dragging and deleted with the keyboard.
 */
function AreaNodeInner({ id, data, selected }: NodeProps) {
  const setAreaColor = useBoardStore((s) => s.setAreaColor);
  const deleteBox = useBoardStore((s) => s.deleteBox);

  const fill = (data?.fill as string) || AREA_COLORS[0].fill;
  const border = (data?.border as string) || AREA_COLORS[0].border;
  // The demo board's neutral group frames follow the theme tokens.
  const isNeutral = fill.replace(/\s/g, "") === "rgba(255,255,255,0.45)";


  return (
    <div
      className={"area-frame w-full h-full rounded-2xl" + (isNeutral ? " is-neutral" : "")}
      style={
        {
          "--area-fill": isNeutral ? "var(--group-fill)" : fill,
          "--area-border": isNeutral ? "var(--group-border)" : border,
        } as CSSProperties
      }
      title="Area — drag to move, select to recolor"
    >
      {selected && (
        <>
          {/* Color picker — very light shades only, so areas never compete
              with the boxes on top of them. */}
          <div className="nodrag absolute -top-10 left-0 flex items-center gap-1.5 rounded-[10px] bg-surface px-2 py-1.5 border border-line [box-shadow:var(--shadow-float)]">
            {AREA_COLORS.map((c) => (
              <button
                key={c.fill}
                onClick={() => setAreaColor(id, c.fill, c.border)}
                title={`Area color — ${c.name}`}
                className={
                  "area-color-dot w-5 h-5 rounded-md border transition hover:scale-110 " +
                  (fill === c.fill ? "border-slate-600 scale-110" : "border-slate-300")
                }
                style={{ backgroundColor: c.fill, borderColor: fill === c.fill ? c.border : undefined }}
              />
            ))}
          </div>
          {/* Delete */}
          <button
            onClick={() => deleteBox(id)}
            title="Delete area"
            className="box-delete nodrag absolute -top-4 -right-4 w-7 h-7 rounded-full bg-surface text-ink-muted hover:text-[color:var(--red-text)] border border-line [box-shadow:var(--shadow-float)] flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </>
      )}
    </div>
  );
}

export default memo(AreaNodeInner);