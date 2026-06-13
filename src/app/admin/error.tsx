"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="admin-error" role="alert">
      <span aria-hidden="true" className="material-symbols-outlined">
        error
      </span>
      <h1>ไม่สามารถโหลดข้อมูลแอดมินได้</h1>
      <p>กรุณาลองอีกครั้ง ข้อมูลของคุณยังไม่ถูกเปลี่ยนแปลง</p>
      <button
        className="ui-button ui-button--primary"
        onClick={unstable_retry}
        type="button"
      >
        ลองใหม่
      </button>
    </section>
  );
}
