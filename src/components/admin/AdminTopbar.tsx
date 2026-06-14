"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminCalendar } from "./AdminCalendar";
import { AdminMobileNav } from "./AdminMobileNav";

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

function getInitials(name: string): string {
  if (!name) return "US";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const showDashboardControls = pathname === "/admin";
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetchConversations();
    // Poll for notifications every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOutside = (event: PointerEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  // Determine title and breadcrumbs from pathname
  let title = "แดชบอร์ด";
  let breadcrumb = ["หน้าแรก", "แดชบอร์ด"];

  if (pathname.startsWith("/admin/orders")) {
    title = "รายการสั่งซื้อ";
    breadcrumb = ["หน้าแรก", "รายการสั่งซื้อ"];
  } else if (pathname.startsWith("/admin/products")) {
    title = "จัดการสินค้า";
    breadcrumb = ["หน้าแรก", "จัดการสินค้า"];
    } else if (pathname === "/admin/discounts/new") {
      title = "จัดการส่วนลด";
      breadcrumb = ["จัดการส่วนลด", "เพิ่มโค้ดส่วนลด"];
    } else if (pathname.startsWith("/admin/discounts")) {
    title = "จัดการส่วนลด";
    breadcrumb = ["หน้าแรก", "จัดการส่วนลด"];
    } else if (pathname.startsWith("/admin/members")) {
      title = "รายการสมาชิก";
      breadcrumb = [];
  } else if (pathname.startsWith("/admin/chat")) {
    title = "จัดการคำร้อง";
    breadcrumb = ["หน้าแรก", "จัดการคำร้อง"];
  }

  // Filter conversations that need admin attention (OPEN and last message is from CUSTOMER)
  const pendingNotifications = conversations.filter(
    (conv) => conv.status === "OPEN" && conv.lastMessage?.senderRole === "CUSTOMER"
  );

  const handleNotificationClick = (id: number) => {
    setOpen(false);
    router.push(`/admin/chat?id=${id}`);
  };

  return (
    <header className="admin-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <AdminMobileNav />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 750, color: "#172033" }}>{title}</h1>
          <nav aria-label="เส้นทางนำทาง" style={{ marginTop: "4px", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 550 }}>
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 ? <span aria-hidden="true" style={{ margin: "0 6px" }}>&gt;</span> : null}
                {item}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {showDashboardControls ? (
        <div className="admin-header-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AdminCalendar />
  
          <div className="admin-notification" ref={notificationRef} style={{ position: "relative" }}>
            <button
              aria-controls="admin-notification-dialog"
              aria-expanded={open}
              aria-label="การแจ้งเตือน"
              className="admin-header-bell"
              onClick={() => setOpen((current) => !current)}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                notifications
              </span>
              {pendingNotifications.length > 0 && (
                <span 
                  className="admin-header-bell__badge" 
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#ff4a5a",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 0 0 2px white"
                  }}
                >
                  {pendingNotifications.length}
                </span>
              )}
            </button>
  
            {open ? (
              <div
                aria-label="การแจ้งเตือน"
                className="admin-notification-popover"
                id="admin-notification-dialog"
                ref={dialogRef}
                role="dialog"
                tabIndex={-1}
                style={{
                  position: "absolute",
                  zIndex: 60,
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: "320px",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "16px",
                  background: "white",
                  boxShadow: "0 14px 36px rgba(15, 39, 79, 0.16)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "8px" }}>
                  <strong style={{ fontSize: "0.85rem", color: "#172033" }}>การแจ้งเตือนใหม่</strong>
                  {pendingNotifications.length > 0 && (
                    <span style={{ fontSize: "0.72rem", background: "#feeceb", color: "#b42318", padding: "2px 8px", borderRadius: "999px", fontWeight: "bold" }}>
                      {pendingNotifications.length} แชทใหม่
                    </span>
                  )}
                </div>
  
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                  {pendingNotifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 8px", color: "#64748b" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "28px", opacity: 0.4, marginBottom: "4px", display: "block" }}>
                        notifications_off
                      </span>
                      <span style={{ fontSize: "0.78rem" }}>ไม่มีการแจ้งเตือนใหม่</span>
                    </div>
                  ) : (
                    pendingNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "100%",
                          padding: "8px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#edf5ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}
                      >
                        <div style={{
                          display: "grid",
                          width: "36px",
                          height: "36px",
                          placeItems: "center",
                          borderRadius: "50%",
                          background: "#0c2d6b",
                          color: "white",
                          fontSize: "0.72rem",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}>
                          {getInitials(notif.user.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <strong style={{ fontSize: "0.78rem", color: "#172033", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {notif.user.name}
                            </strong>
                            <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
                              {formatTime(notif.lastMessage?.createdAt || notif.updatedAt)}
                            </span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {notif.lastMessage?.content || "ส่งข้อความใหม่"}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
