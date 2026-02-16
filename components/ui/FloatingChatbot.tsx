"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function getReplyText(data: { answer?: string; response?: string; message?: string }): string {
  return data.answer ?? data.response ?? data.message ?? "Sorry, I couldn't get a response.";
}

export function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const data = await apiService.askChatbot(text);
      const reply = getReplyText(data);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message ?? "Chatbot is unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-xl border border-border bg-card shadow-lg flex flex-col overflow-hidden"
          style={{ height: "420px" }}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary">
            <span className="font-semibold text-foreground">Chat</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close chat"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask a question about your learning or coding practice.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type a message…"
              className="flex-1 min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50 disabled:pointer-events-none hover:opacity-90"
            >
              <Icon icon="mdi:send" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <Icon icon={open ? "mdi:close" : "mdi:chat-outline"} className="w-7 h-7" />
      </button>
    </>
  );
}
