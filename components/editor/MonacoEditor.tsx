"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { EditorProps } from "@monaco-editor/react";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading editor...</div>,
});

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: "cpp" | "java" | "python" | "javascript";
  theme?: "vs-dark" | "light";
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "cpp",
  theme = "vs-dark",
  height = "500px",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="border rounded-md ">
      <MonacoEditor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

