"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/CartProvider";

const navigation = [
  { href: "/all-products", label: "สินค้าทั้งหมด" },
  { href: "/how-to-buy", label: "วิธีสั่งซื้อ" },
  { href: "/contact", label: "ติดต่อ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hasMockUser = document.cookie
      .split(";")
      .some((entry) => entry.trim().startsWith("mock_user="));
    setIsLoggedIn(hasMockUser || session?.user != null);
  }, [session]);


  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const openMobile = () => {
    setMobileOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/all-products?q=${encodeURIComponent(headerSearchQuery.trim())}`);
    }
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

          <div className="site-header__actions flex items-center gap-2 md:gap-4">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative group mr-2">
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="ค้นหาซอฟต์แวร์..."
                className="w-[200px] lg:w-[280px] bg-[#1E293B] border border-[#334155] text-white rounded-full pl-5 pr-12 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all placeholder:text-[#64748B] shadow-inner"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors flex items-center cursor-pointer"
                aria-label="ค้นหา"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </form>
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
    </>
  );
}
