import jsPDF from "jspdf";

export interface PdfBlock {
  heading?: string;
  text?: string;
  italic?: boolean;
  small?: boolean;
}

interface BuildOptions {
  title: string;
  subtitle?: string;
  blocks: PdfBlock[];
  footer?: string;
}

const MARGIN = 54;
const PAGE_W = 595.28; // A4 portrait pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

function buildPdf({ title, subtitle, blocks, footer }: BuildOptions): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const write = (text: string, size: number, style: "normal" | "bold" | "italic", gap = 10) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    const lineHeight = size * 1.45;
    lines.forEach((line) => {
      newPageIfNeeded(lineHeight);
      doc.text(line, MARGIN, y);
      y += lineHeight;
    });
    y += gap;
  };

  write(title, 22, "bold", 6);
  if (subtitle) write(subtitle, 11, "italic", 14);

  doc.setDrawColor(180);
  newPageIfNeeded(20);
  doc.line(MARGIN, y - 6, PAGE_W - MARGIN, y - 6);
  y += 10;

  blocks.forEach((b) => {
    if (b.heading) write(b.heading, 13, "bold", 4);
    if (b.text) write(b.text, b.small ? 9.5 : 11.5, b.italic ? "italic" : "normal", 12);
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(130);
    doc.text(footer || "Devotly", MARGIN, PAGE_H - 26);
    doc.text(`${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 26, { align: "right" });
    doc.setTextColor(0);
  }

  return doc;
}

function safeName(title: string) {
  return `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "devotly"}.pdf`;
}

/** Build the PDF, then share it natively when possible, otherwise download it. */
export async function sharePdf(options: BuildOptions): Promise<"shared" | "downloaded"> {
  const doc = buildPdf(options);
  const fileName = safeName(options.title);
  const blob = doc.output("blob");
  const file = new File([blob], fileName, { type: "application/pdf" });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: options.title, text: options.subtitle || options.title });
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "shared";
    }
  }

  doc.save(fileName);
  return "downloaded";
}

export function downloadPdf(options: BuildOptions) {
  buildPdf(options).save(safeName(options.title));
}
