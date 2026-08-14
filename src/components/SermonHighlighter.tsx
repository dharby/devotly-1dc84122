import { useRef, useState } from "react";
import { Highlighter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const COLORS = [
  { name: "yellow", cls: "bg-yellow-300" },
  { name: "green", cls: "bg-green-300" },
  { name: "blue", cls: "bg-sky-300" },
  { name: "pink", cls: "bg-pink-300" },
];

export default function SermonHighlighter({
  sermonId,
  children,
}: {
  sermonId: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ top: number; left: number; text: string } | null>(null);

  const { user } = useAuth();

  const onSelect = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || sel.rangeCount === 0 || text.length < 2 || !containerRef.current) {
      setPill(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const base = containerRef.current.getBoundingClientRect();
    setPill({ top: rect.top - base.top - 46, left: Math.max(8, rect.left - base.left), text });
  };

  const save = async (color: string) => {
    if (!pill) return;
    if (!user) { toast.error("Sign in to save highlights"); return; }
    const { error } = await supabase.from("devotional_highlights" as any).insert({
      user_id: user.id,
      sermon_id: sermonId,
      source_type: "sermon",
      text: pill.text,
      section: "sermon",
      color,
    });
    if (error) toast.error("Could not save highlight");
    else toast.success("Highlight saved");
    setPill(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={containerRef} className="relative" onMouseUp={onSelect} onTouchEnd={onSelect}>
      {children}
      {pill && (
        <div
          style={{ top: pill.top, left: pill.left }}
          className="absolute z-50 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg animate-fade-in"
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
