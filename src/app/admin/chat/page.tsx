"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UserInfo {
  id: number;
  name: string;
  email: string;
}

interface LastMessage {
  content: string;
  senderRole: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  status: string;
  user: UserInfo;
  lastMessage: LastMessage | null;
  updatedAt: string;
}

interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} ชั่วโมงที่แล้ว`;
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollConvRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollMsgRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // Load conversation ID from URL parameters if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id");
      if (queryId) {
        setSelectedId(Number(queryId));
      }
    }
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${selectedId}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {
      // ignore
    }
  }, [selectedId]);

  // Load conversations on mount + poll
  useEffect(() => {
    fetchConversations();
    pollConvRef.current = setInterval(fetchConversations, 5000);
    return () => {
      if (pollConvRef.current) clearInterval(pollConvRef.current);
    };
  }, [fetchConversations]);

  // Load messages when selected + poll
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    fetchMessages();
    pollMsgRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollMsgRef.current) clearInterval(pollMsgRef.current);
    };
  }, [selectedId, fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendReply() {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, content }),
      });
      await fetchMessages();
      await fetchConversations();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  return (
    <div className="admin-chat">
      {/* Conversation List */}
      <div className="admin-chat__sidebar">
        <div className="admin-chat__sidebar-header">
          <h2>
            <span className="material-symbols-outlined">forum</span>
            Conversations
          </h2>
          <span className="admin-chat__badge">{conversations.length}</span>
        </div>
        <div className="admin-chat__list">
          {conversations.length === 0 ? (
            <div className="admin-chat__empty-list">
              <span className="material-symbols-outlined">inbox</span>
              <p>ยังไม่มีการสนทนา</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`admin-chat__item ${selectedId === conv.id ? "admin-chat__item--active" : ""}`}
                onClick={() => setSelectedId(conv.id)}
              >
                <div className="admin-chat__item-avatar">
                  {getInitials(conv.user.name)}
                </div>
                <div className="admin-chat__item-info">
                  <div className="admin-chat__item-top">
                    <strong>{conv.user.name}</strong>
                    <time>
                      {conv.lastMessage
                        ? formatTime(conv.lastMessage.createdAt)
                        : formatTime(conv.updatedAt)}
                    </time>
                  </div>
                  <p className="admin-chat__item-preview">
                    {conv.lastMessage
                      ? `${conv.lastMessage.senderRole === "ADMIN" ? "คุณ: " : ""}${conv.lastMessage.content}`
                      : "ยังไม่มีข้อความ"}
                  </p>
                </div>
                <span
                  className={`admin-chat__status admin-chat__status--${conv.status.toLowerCase()}`}
                >
                  {conv.status === "OPEN" ? "เปิด" : "ปิด"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="admin-chat__panel">
        {!selected ? (
          <div className="admin-chat__panel-empty">
            <span className="material-symbols-outlined">chat</span>
            <h3>เลือกการสนทนา</h3>
            <p>เลือกการสนทนาจากรายการด้านซ้ายเพื่อเริ่มตอบกลับ</p>
          </div>
        ) : (
          <>
            {/* Panel header */}
            <div className="admin-chat__panel-header">
              <div className="admin-chat__panel-avatar">
                {getInitials(selected.user.name)}
              </div>
              <div className="admin-chat__panel-user">
                <strong>{selected.user.name}</strong>
                <small>{selected.user.email}</small>
              </div>
              <span
                className={`admin-chat__status admin-chat__status--${selected.status.toLowerCase()}`}
              >
                {selected.status === "OPEN" ? "เปิด" : "ปิด"}
              </span>
            </div>

            {/* Messages */}
            <div className="admin-chat__messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`admin-chat__msg admin-chat__msg--${msg.senderRole === "ADMIN" ? "admin" : "customer"}`}
                >
                  <div className="admin-chat__msg-bubble">{msg.content}</div>
                  <span className="admin-chat__msg-time">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="admin-chat__reply">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                onClick={sendReply}
                disabled={!input.trim() || sending}
                className="admin-chat__reply-send"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
