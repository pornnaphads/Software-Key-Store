"use client";

import { useId, useRef, useState } from "react";

export interface AdminConfirmDialogProps {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
}

export function AdminConfirmDialog({
  confirmLabel,
  description,
  onConfirm,
  title,
  triggerLabel,
}: AdminConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [pending, setPending] = useState(false);

  function restoreFocus() {
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeDialog() {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      restoreFocus();
    }
  }

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      closeDialog();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className="admin-icon-button admin-icon-button--danger"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          archive
        </span>
        <span className="sr-only">{triggerLabel}</span>
      </button>
      <dialog
        aria-labelledby={titleId}
        className="admin-confirm-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={restoreFocus}
        ref={dialogRef}
      >
        <div className="admin-confirm-dialog__icon">
          <span aria-hidden="true" className="material-symbols-outlined">
            warning
          </span>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        <div className="admin-confirm-dialog__actions">
          <button
            className="ui-button ui-button--secondary"
            disabled={pending}
            onClick={closeDialog}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            className="ui-button ui-button--danger"
            disabled={pending}
            onClick={handleConfirm}
            type="button"
          >
            {pending ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
