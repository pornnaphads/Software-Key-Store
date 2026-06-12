"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/Button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const links = [
  { href: "/", label: "สินค้าทั้งหมด" },
  { href: "/category/windows", label: "Windows" },
  { href: "/category/office", label: "Microsoft Office" },
  { href: "/how-to-buy", label: "วิธีสั่งซื้อ" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export function MobileNav({ onClose, open, triggerRef }: MobileNavProps) {
  const pathname = usePathname();
  const initialPath = useRef(pathname);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [onClose, open, triggerRef]);

  useEffect(() => {
    if (open && pathname !== initialPath.current) {
      queueMicrotask(onClose);
    }
  }, [onClose, open, pathname]);

  if (!open) {
    return null;
  }

  return (
    <div className="mobile-nav__backdrop" onMouseDown={onClose}>
      <aside
        aria-label="เมนูหลัก"
        aria-modal="true"
        className="mobile-nav"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mobile-nav__header">
          <span className="mobile-nav__brand">SoftKeyStore</span>
          <Button
            ref={closeRef}
            aria-label="ปิดเมนู"
            iconOnly
            onClick={onClose}
            variant="quiet"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </Button>
        </div>
        <nav aria-label="เมนูบนมือถือ" className="mobile-nav__links">
          {links.map((link) => (
            <Link
              key={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              href={link.href}
            >
              {link.label}
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_right
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
