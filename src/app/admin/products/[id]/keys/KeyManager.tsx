"use client";

import { useState, useTransition } from "react";

interface ProductKey {
  id: number;
  productKey: string;
  salesStatus: string;
  orderDetailId: number | null;
  decrypted: string;
}

interface KeyManagerProps {
  productId: number;
  productName: string;
  initialKeys: ProductKey[];
  onAdd: (productId: number, keys: string[]) => Promise<{ error?: string; success?: boolean; count?: number }>;
  onDelete: (keyId: number, productId: number) => Promise<void>;
}

export function KeyManager({ productId, productName, initialKeys, onAdd, onDelete }: KeyManagerProps) {
  const [keys, setKeys] = useState<ProductKey[]>(initialKeys);
  const [textarea, setTextarea] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const availableKeys = keys.filter((k) => k.salesStatus === "AVAILABLE");
  const soldKeys = keys.filter((k) => k.salesStatus === "SOLD");

  const filteredKeys = keys.filter(
    (k) =>
      search === "" ||
      k.decrypted.toLowerCase().includes(search.toLowerCase()) ||
      k.salesStatus.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    const lines = textarea.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    startTransition(async () => {
      const result = await onAdd(productId, lines);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `เพิ่มคีย์สำเร็จ ${result.count} รายการ` });
        setTextarea("");
        // Refresh by reloading
        window.location.reload();
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleDelete = (keyId: number) => {
    if (!confirm("ลบคีย์นี้ถาวร?")) return;
    setDeletingId(keyId);
    startTransition(async () => {
      await onDelete(keyId, productId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      setDeletingId(null);
    });
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)", padding: "28px 40px", color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Admin › สินค้า › จัดการคีย์</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🔑 จัดการ Product Keys</h1>
        <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>{productName}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "คีย์ทั้งหมด", value: keys.length, color: "#1d4ed8", bg: "#eff6ff" },
            { label: "พร้อมขาย", value: availableKeys.length, color: "#15803d", bg: "#f0fdf4" },
            { label: "ขายแล้ว", value: soldKeys.length, color: "#b45309", bg: "#fffbeb" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: "20px 24px", border: `1px solid ${stat.color}20` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Keys Panel */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>➕ เพิ่มคีย์ใหม่</h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
            วางคีย์ทีละบรรทัด (รองรับหลายบรรทัดพร้อมกัน) เช่น XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
          </p>
          <textarea
            value={textarea}
            onChange={(e) => setTextarea(e.target.value)}
            placeholder={"ABCDE-FGHIJ-KLMNO-PQRST-UVWXY\nABCDE-FGHIJ-KLMNO-PQRST-UVWXZ"}
            rows={5}
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 16px",
              border: "1px solid #e2e8f0", borderRadius: 10, fontFamily: "monospace",
              fontSize: 13, background: "#f8fafc", resize: "vertical",
              outline: "none", color: "#1e293b",
            }}
          />
          {message && (
            <div style={{
              marginTop: 10, padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: message.type === "success" ? "#15803d" : "#dc2626",
              border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {message.type === "success" ? "✅" : "❌"} {message.text}
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={isPending || textarea.trim().length === 0}
            style={{
              marginTop: 14, padding: "10px 28px", background: "#1d4ed8", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
              opacity: isPending || textarea.trim().length === 0 ? 0.6 : 1,
            }}
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกคีย์"}
          </button>
        </div>

        {/* Keys Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>รายการคีย์ทั้งหมด</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาคีย์..."
              style={{
                padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, width: 220, outline: "none", color: "#1e293b",
              }}
            />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Product Key", "สถานะ", "Order", "จัดการ"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                      ไม่มีคีย์ที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((key, i) => (
                    <tr key={key.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{
                          fontFamily: "monospace", fontSize: 13, fontWeight: 600,
                          color: key.salesStatus === "SOLD" ? "#94a3b8" : "#1e293b",
                          letterSpacing: "0.5px",
                        }}>
                          {key.decrypted}
                        </code>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: key.salesStatus === "AVAILABLE" ? "#f0fdf4" : "#f1f5f9",
                          color: key.salesStatus === "AVAILABLE" ? "#15803d" : "#64748b",
                        }}>
                          {key.salesStatus === "AVAILABLE" ? "พร้อมขาย" : "ขายแล้ว"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                        {key.orderDetailId ? `#${key.orderDetailId}` : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {key.salesStatus === "AVAILABLE" && (
                          <button
                            onClick={() => handleDelete(key.id)}
                            disabled={deletingId === key.id}
                            style={{
                              padding: "5px 12px", background: "#fef2f2", color: "#dc2626",
                              border: "1px solid #fecaca", borderRadius: 6, fontSize: 12,
                              fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            {deletingId === key.id ? "กำลังลบ..." : "ลบ"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
