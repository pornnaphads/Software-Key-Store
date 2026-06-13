"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import "./ContactChat.css";

interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function ContactChat() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [mockUser, setMockUser] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check mock_user cookie whenever the panel state or status changes
  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )mock_user=([^;]+)'));
    if (match) {
      setMockUser(decodeURIComponent(match[2]));
    } else {
      setMockUser(null);
    }
  }, [open, status]);

  // Listen to open storefront chat event from header
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-storefront-chat", handleOpen);
    return () => window.removeEventListener("open-storefront-chat", handleOpen);
  }, []);

  // Update last seen message ID in localStorage when messages are viewed
  useEffect(() => {
    if (open && messages.length > 0) {
      const maxId = Math.max(...messages.map((m) => m.id));
      localStorage.setItem("chat_last_seen_msg_id", String(maxId));
      window.dispatchEvent(new CustomEvent("chat-messages-read"));
    }
  }, [open, messages]);

  const isLoggedIn = status === "authenticated" || !!mockUser;
  const displayName = session?.user?.name || mockUser || "Guest User";
  
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch or create conversation when panel opens
  useEffect(() => {
    if (!open || !isLoggedIn) return;

    setLoading(true);
    fetch("/api/chat/conversations")
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data: { id: number } | null) => {
        if (data?.id) {
          setConversationId(data.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, isLoggedIn]);

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

  async function sendMessage() {
    if (!input.trim() || sending) return;

    let convId = conversationId;
    // If no conversation yet, create one
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

  // Get preview text of last message
  const getLastMessagePreview = () => {
    if (messages.length === 0) return "ยังไม่มีข้อความ";
    const last = messages[messages.length - 1];
    return last.senderRole === "ADMIN" ? last.content : `คุณ: ${last.content}`;
  };

  // Get time of last message
  const getLastMessageTime = () => {
    if (messages.length === 0) return "";
    const last = messages[messages.length - 1];
    return formatTime(last.createdAt);
  };

  return (
    <div className="contact-chat-wrapper">
      {/* Floating bubble button in bottom-left */}
      {!open && (
        <button
          className="contact-chat-bubble"
          onClick={() => setOpen(true)}
          aria-label="เปิดแชทกับแอดมิน"
          id="contact-chat-bubble"
        >
          <span className="material-symbols-outlined">chat</span>
        </button>
      )}

      {/* Main Chat Panel Container */}
      {open && (
        <div className="contact-chat-panel" role="dialog" aria-label="แชทติดต่อสอบถาม">
          
          {/* Two Column Layout */}
          <div className="contact-chat-container">
            
            {/* Left Column: Sidebar Conversations */}
            <div className="contact-chat-sidebar">
              <div className="contact-chat-sidebar__header">
                <h2>Conversations</h2>
                <p>Admin Dashboard</p>
              </div>
              <div className="contact-chat-sidebar__list">
                <button className="contact-chat-sidebar__item active">
                  <div className="contact-chat-sidebar__avatar-wrapper">
                    <div className="contact-chat-sidebar__avatar">AM</div>
                    <span className="contact-chat-sidebar__online-indicator"></span>
                  </div>
                  <div className="contact-chat-sidebar__info">
                    <div className="contact-chat-sidebar__meta">
                      <strong className="contact-chat-sidebar__name">Admin</strong>
                      <span className="contact-chat-sidebar__time">
                        {getLastMessageTime() || "10:02"}
                      </span>
                    </div>
                    <p className="contact-chat-sidebar__preview">
                      {getLastMessagePreview()}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column: Chat Window Pane */}
            <div className="contact-chat-main">
              
              {/* Blue Header */}
              <div className="contact-chat-header">
                <div className="contact-chat-header__profile">
                  <div className="contact-chat-header__avatar">
                    {isLoggedIn ? getInitials(displayName) : "US"}
                  </div>
                  <div className="contact-chat-header__info">
                    <strong>{isLoggedIn ? displayName : "Support Team"}</strong>
                    <small>Viewing: Windows 11 Pro Retail</small>
                  </div>
                </div>
                <div className="contact-chat-header__actions">
                  <button
                    className="contact-chat-header__btn"
                    onClick={() => setOpen(false)}
                    title="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Body */}
              {status === "loading" || loading ? (
                <div className="contact-chat-loading">
                  <div className="contact-chat-loading__dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : !isLoggedIn ? (
                <div className="contact-chat-login-prompt">
                  <span className="material-symbols-outlined">lock</span>
                  <p>กรุณาเข้าสู่ระบบก่อนเพื่อเริ่มแชทกับทีมงานได้เลยครับ</p>
                </div>
              ) : (
                <>
                  <div className="contact-chat-messages">
                    {messages.length === 0 ? (
                      <div className="contact-chat-empty">
                        <span className="material-symbols-outlined">forum</span>
                        <p>
                          สวัสดีค่ะ สอบถามเรื่องอะไรดีคะ
                          <br />
                          สามารถส่งข้อความสอบถามทางร้านได้เลยค่ะ
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`contact-chat-msg contact-chat-msg--${
                            msg.senderRole === "ADMIN" ? "admin" : "customer"
                          }`}
                        >
                          <div className="contact-chat-msg__bubble">
                            {msg.content}
                          </div>
                          <span className="contact-chat-msg__time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Footer */}
                  <div className="contact-chat-input-area">
                    <div className="contact-chat-input-wrapper">
                      <span className="material-symbols-outlined contact-chat-input__icon">
                        attach_file
                      </span>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                      />
                      <button
                        className="contact-chat-input__send"
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        aria-label="ส่งข้อความ"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
