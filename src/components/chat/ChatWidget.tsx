"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import "./ChatWidget.css";

interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface Session {
  user?: { id?: string; name?: string } | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s: Session) => {
        setSession(s);
        setSessionLoaded(true);
      })
      .catch(() => setSessionLoaded(true));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch or create conversation when panel opens
  useEffect(() => {
    if (!open || !session?.user?.id) return;

    setLoading(true);
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((data: { id: number } | null) => {
        if (data?.id) {
          setConversationId(data.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, session]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {
      // silently ignore polling errors
    }
  }, [conversationId]);

  // Poll messages while open
  useEffect(() => {
    if (!open || !conversationId) return;

    fetchMessages();

    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversationId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function startConversation() {
    try {
      const res = await fetch("/api/chat/conversations", { method: "POST" });
      if (res.ok) {
        const data: { id: number } = await res.json();
        setConversationId(data.id);
      }
    } catch {
      // ignore
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;

    // If no conversation yet, create one
    let convId = conversationId;
    if (!convId) {
      try {
        const res = await fetch("/api/chat/conversations", { method: "POST" });
        if (res.ok) {
          const data: { id: number } = await res.json();
          convId = data.id;
          setConversationId(convId);
        }
      } catch {
        return;
      }
    }

    if (!convId) return;

    setSending(true);
    const content = input.trim();
    setInput("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, content }),
      });
      if (res.ok) {
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isLoggedIn = !!session?.user?.id;

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          className="chat-bubble"
          onClick={() => setOpen(true)}
          aria-label="เปิดแชท"
          id="chat-bubble"
        >
          <span className="material-symbols-outlined">chat</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="chat-panel" role="dialog" aria-label="แชทกับทีมงาน">
          {/* Header */}
          <div className="chat-panel__header">
            <div className="chat-panel__header-avatar">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div className="chat-panel__header-info">
              <strong>SoftKeyStore Support</strong>
              <small>ออนไลน์อยู่</small>
            </div>
            <button
              className="chat-panel__close"
              onClick={() => setOpen(false)}
              aria-label="ปิดแชท"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          {!sessionLoaded || loading ? (
            <div className="chat-panel__loading">
              <div className="chat-panel__loading-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="chat-panel__login">
              <span className="material-symbols-outlined">lock</span>
              <p>กรุณาเข้าสู่ระบบเพื่อเริ่มแชทกับทีมงาน</p>
              <Link href="/login">
                <span className="material-symbols-outlined">login</span>
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <>
              <div className="chat-panel__messages">
                {messages.length === 0 && !conversationId ? (
                  <div className="chat-panel__empty">
                    <span className="material-symbols-outlined">
                      forum
                    </span>
                    <p>
                      สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?
                      <br />
                      พิมพ์ข้อความเพื่อเริ่มสนทนา
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-panel__empty">
                    <span className="material-symbols-outlined">
                      forum
                    </span>
                    <p>เริ่มสนทนาได้เลยครับ</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-msg chat-msg--${msg.senderRole === "ADMIN" ? "admin" : "customer"}`}
                    >
                      {msg.senderRole === "ADMIN" && (
                        <span className="chat-msg__sender">Admin</span>
                      )}
                      <div className="chat-msg__bubble">{msg.content}</div>
                      <span className="chat-msg__time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-panel__input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  className="chat-panel__send"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  aria-label="ส่งข้อความ"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
