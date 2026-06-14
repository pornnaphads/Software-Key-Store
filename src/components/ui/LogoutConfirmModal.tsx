"use client";

import { useEffect } from "react";

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  onConfirm,
  onCancel,
  isLoading = false,
}: LogoutConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="logout-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="logout-modal-card">
        {/* Icon */}
        <div className="logout-modal-icon">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: '"FILL" 1', fontSize: "2rem" }}
          >
            logout
          </span>
        </div>

        {/* Content */}
        <h2 id="logout-modal-title" className="logout-modal-title">
          ออกจากระบบ?
        </h2>
        <p className="logout-modal-desc">
          คุณต้องการออกจากระบบจริงๆ ใช่หรือไม่?
        </p>

        {/* Buttons */}
        <div className="logout-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="logout-modal-btn logout-modal-btn--cancel"
            id="logout-cancel-btn"
          >
            ไม่
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="logout-modal-btn logout-modal-btn--confirm"
            id="logout-confirm-btn"
          >
            {isLoading ? (
              <span className="logout-modal-spinner" />
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  logout
                </span>
                ใช่ ออกจากระบบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
