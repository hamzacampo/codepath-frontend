"use client";

import React, { useRef, useCallback } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split("\n");

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange],
  );

  return (
    <div
      className="relative w-full overflow-auto bg-[#05001E]"
      style={{ height }}
    >
      <div className="flex min-h-full">
        {/* Line numbers */}
        <div
          className="shrink-0 select-none text-right pr-3 pl-3 pt-3 pb-3 text-[#555577] text-xs font-mono leading-[1.7]"
          aria-hidden
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Editor area */}
        <div className="relative flex-1 min-w-0">
          {/* Visible syntax layer (read-only, sits behind textarea) */}
          <pre
            className="absolute inset-0 w-full h-full text-[#d4d4d4] text-xs font-mono leading-[1.7] p-3 pl-0 whitespace-pre-wrap wrap-break-word pointer-events-none"
            aria-hidden
          >
            {value}
          </pre>

          {/* Editable textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent text-xs font-mono leading-[1.7] p-3 pl-0 resize-none outline-none caret-[#ffffff]"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
}

