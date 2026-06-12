"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { MobileNav } from "@/components/layout/MobileNav";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/CartProvider";

const navigation = [
  { href: "/#all-products", label: "สินค้าทั้งหมด" },
  { href: "/category/windows", label: "Windows" },
  { href: "/category/office", label: "Microsoft Office" },
  { href: "/how-to-buy", label: "วิธีสั่งซื้อ" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoggedIn(
        document.cookie
          .split(";")
          .some((entry) => entry.trim().startsWith("mock_user=")),
      );
    });
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const openMobile = () => {
    setSearchOpen(false);
    setMobileOpen(true);
  };

  const openSearch = () => {
    setMobileOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Button
            ref={mobileTriggerRef}
            aria-expanded={mobileOpen}
            aria-label="เปิดเมนู"
            className="site-header__mobile-trigger"
            iconOnly
            onClick={openMobile}
            variant="quiet"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              menu
            </span>
          </Button>

          <Link className="site-header__brand" href="/">
            SoftKeyStore
          </Link>

          <nav aria-label="เมนูหลัก" className="site-header__nav">
            {navigation.map((link) => (
              <Link
                key={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <Button
              ref={searchTriggerRef}
              aria-expanded={searchOpen}
              aria-label="เปิดการค้นหา"
              iconOnly
              onClick={openSearch}
              variant="quiet"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                search
              </span>
            </Button>
            <Link
              aria-label={`ตะกร้าสินค้า ${itemCount} รายการ`}
              className="site-header__icon-link"
              href="/cart"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                shopping_bag
              </span>
              {itemCount > 0 ? (
                <span aria-hidden="true" className="site-header__count">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>
            <Link
              aria-label={isLoggedIn ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
              className="site-header__icon-link"
              href={isLoggedIn ? "/profile" : "/login"}
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                person
              </span>
            </Link>
          </div>
        </div>
      </header>

      <MobileNav
        onClose={closeMobile}
        open={mobileOpen}
        triggerRef={mobileTriggerRef}
      />
      <SearchOverlay
        onClose={closeSearch}
        open={searchOpen}
        triggerRef={searchTriggerRef}
      />
    </>
  );
}
