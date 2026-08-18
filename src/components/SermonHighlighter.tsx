import { useRef, useState, useCallback, useEffect } from "react";
import { Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  const isMobile = useIsMobile();

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
      setPill({ top: rect.top - base.top - 46, left: Math.max(8, rect.left - base.left), text });
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
    <div ref={containerRef} className="relative" onMouseUp={captureSelection} onTouchEnd={captureSelection}>
      {children}
      {pill && (
        <div
          style={!isMobile && pill ? { top: pill.top, left: pill.left } : undefined}
          className={cn(
            "z-[60] flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg animate-fade-in",
            isMobile
              ? "fixed bottom-[5.5rem] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md justify-center rounded-2xl"
              : "absolute",
          )}
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
