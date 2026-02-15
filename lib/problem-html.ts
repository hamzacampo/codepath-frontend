/**
 * Strips duplicate math layers from Codeforces problem HTML so that each symbol
 * appears once. Keeps the text (MathJax_Preview); removes only the rendered
 * duplicate (MathJax_SVG and wrappers with aria-hidden) so variables like n, i stay visible.
 */
export function stripDuplicateMathLayers(html: string): string {
  if (typeof window === "undefined" || !html?.trim()) return html ?? "";

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="_cf-wrap">${html}</div>`,
      "text/html"
    );
    const root = doc.getElementById("_cf-wrap");
    if (!root) return html;

    const toRemove: Element[] = [];
    const walk = (el: Element) => {
      // Remove rendered duplicate (SVG) and the hidden duplicate (aria-hidden)
      // so we keep exactly one representation (e.g. MathJax_Preview text)
      if (el.classList?.contains("MathJax_SVG")) {
        toRemove.push(el);
        return;
      }
      if (el.getAttribute?.("aria-hidden") === "true") {
        toRemove.push(el);
        return;
      }
      for (const child of Array.from(el.children)) walk(child);
    };
    walk(root);

    toRemove.forEach((el) => el.remove());

    // Mark footnote/small blocks so we can style them
    root.querySelectorAll(".small, small").forEach((el) => {
      el.classList.add("cf-footnote");
    });
    // Codeforces may wrap asterisk explanation in a plain div/p – detect by leading ∗ or *
    const blocks = root.querySelectorAll(":scope > div, :scope > p");
    blocks.forEach((el) => {
      if (el.classList.contains("cf-footnote")) return;
      const text = (el.textContent ?? "").trim();
      const isFootnote =
        (text.startsWith("∗") || text.startsWith("*")) && text.length > 15;
      if (isFootnote) el.classList.add("cf-footnote");
    });

    return root.innerHTML;
  } catch {
    return html;
  }
}
