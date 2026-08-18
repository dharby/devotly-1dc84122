import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SermonHighlighter from "./SermonHighlighter";

function mockSelection(active: boolean, node: Node | null) {
  const sel = {
    rangeCount: active ? 1 : 0,
    isCollapsed: !active,
    toString: () => (active ? "sermon text" : ""),
    anchorNode: node,
    focusNode: node,
    getRangeAt: () => ({
      getBoundingClientRect: () => ({ top: 100, left: 50, bottom: 0, right: 0, width: 10, height: 10, x: 0, y: 0, toJSON: () => ({}) }),
    }),
    removeAllRanges: () => {},
  };
  vi.spyOn(window, "getSelection").mockReturnValue(sel as unknown as Selection);
}

describe("SermonHighlighter", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows the highlight bar when text is selected within the container", async () => {
    render(
      <SermonHighlighter addHighlight={async () => {}}>
        <p>Hello world this is a sermon text</p>
      </SermonHighlighter>,
    );
    mockSelection(true, screen.getByText(/Hello world/).firstChild);
    document.dispatchEvent(new Event("selectionchange"));

    expect(await screen.findByLabelText("Highlight yellow")).toBeTruthy();
    expect(screen.getByLabelText("Highlight green")).toBeTruthy();
    expect(screen.getByLabelText("Highlight blue")).toBeTruthy();
    expect(screen.getByLabelText("Highlight pink")).toBeTruthy();
  });

  it("hides the bar when the selection is collapsed", async () => {
    render(
      <SermonHighlighter addHighlight={async () => {}}>
        <p>Another sermon text here</p>
      </SermonHighlighter>,
    );
    mockSelection(false, null);
    document.dispatchEvent(new Event("selectionchange"));

    await waitFor(() => {
      expect(screen.queryByLabelText("Highlight yellow")).toBeNull();
    });
  });
});
