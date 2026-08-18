import { useRef, useState, useCallback, useEffect } from "react";
import { Highlighter } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  { name: "yellow", cls: "bg-yellow-300" },
  { name: "green", cls: "bg-green-300" },
  { name: "blue", cls: "bg-sky-300" },
  { name: "pink", cls: "bg-pink-300" },
];

export default function SermonHighlighter({
  addHighlight,
  children,
}: {
  addHighlight: (hl: { text: string; section: string; color: string; note?: string }) => Promise<void>;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ top: number; left: number; text: string } | null>(null);

  const captureSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !containerRef.current) {
      setPill(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 2) {
      setPill(null);
      return;
    }
    const a = sel.anchorNode;
    const f = sel.focusNode;
    if (!(a && f && containerRef.current.contains(a) && containerRef.current.contains(f))) {
      setPill(null);
      return;
    }
    try {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      const base = containerRef.current.getBoundingClientRect();
      const barW = 200;
      const top = Math.max(4, rect.top - base.top - 46);
      const left = rect.left - base.left + rect.width / 2 - barW / 2;
      const clampedLeft = Math.max(4, Math.min(Math.max(4, base.width - barW - 4), left));
      setPill({ top, left: clampedLeft, text });
    } catch {
      setPill({ top: 8, left: 8, text });
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", captureSelection);
    return () => document.removeEventListener("selectionchange", captureSelection);
  }, [captureSelection]);

  const save = async (color: string) => {
    if (!pill) return;
    try {
      await addHighlight({ text: pill.text, section: "sermon", color });
      toast.success("Highlight saved");
    } catch {
      toast.error("Could not save highlight");
    }
    setPill(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseUp={captureSelection}
      onTouchEnd={captureSelection}
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
    >
      {children}
      {pill && (
        <div
          style={{ top: pill.top, left: pill.left }}
          className="absolute z-[60] flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg animate-fade-in max-w-[calc(100%-2rem)]"
        >
          <Highlighter className="h-3.5 w-3.5 text-primary" />
          {COLORS.map((c) => (
            <button
              key={c.name}
              aria-label={`Highlight ${c.name}`}
              onClick={() => save(c.name)}
              className={`h-5 w-5 rounded-full ${c.cls} ring-1 ring-border`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
