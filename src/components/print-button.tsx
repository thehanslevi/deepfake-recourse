"use client";

// Single-file export. Print-to-PDF is an explicit v1 option: the browser's
// print dialog saves the assembled case file as one PDF.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print border border-accent bg-accent px-5 py-2 font-mono text-sm btn-accent no-underline transition-colors hover:bg-accent-ink"
    >
      Export to PDF →
    </button>
  );
}
