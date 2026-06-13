"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/CartProvider";
import { getAvatarGradient } from "@/lib/avatar";

const navigation = [
  { href: "/all-products", label: "สินค้าทั้งหมด" },
  { href: "/how-to-buy", label: "วิธีสั่งซื้อ" },
  { href: "/contact", label: "ติดต่อ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { data: session, status } = useSession();
  const [hasMockUser, setHasMockUser] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState(searchParams.get("q") || "");
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  // Sync headerSearchQuery with URL query parameter 'q'
  useEffect(() => {
    setHeaderSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setHeaderSearchQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    const newUrl = `/all-products?${params.toString()}`;
    if (pathname === "/all-products") {
      router.replace(newUrl);
    } else {
      router.push(newUrl);
    }
  };

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dbUserName, setDbUserName] = useState<string | null>(null);

  // อ่าน cookie
  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )mock_user=([^;]+)'));
    if (match) {
      setHasMockUser(true);
      setUserName(decodeURIComponent(match[2]));
    } else {
      setHasMockUser(false);
      setUserName(null);
    }
  }, [pathname]);

  const isLoggedIn = hasMockUser || status === "authenticated";

  // Fetch updated profile data (name and avatar) from DB when logged in
  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined" && !process.env.VITEST) {
      const origin = window.location.origin;
      fetch(`${origin}/api/profile`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfilePicture(data.profilePicture || null);
            setDbUserName(`${data.firstName} ${data.lastName}`);
          }
        })
        .catch((err) => console.error("Error fetching header profile:", err));
    } else {
      setProfilePicture(null);
      setDbUserName(null);
    }
  }, [isLoggedIn, status, session]);

  // คำนวณจาก session โดยตรง — ไม่มี race condition
  const displayUserName = dbUserName || (status === "authenticated" ? session?.user?.name : userName);

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
                onChange={(e) => handleSearchChange(e.target.value)}
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
              href={isLoggedIn ? "/cart" : "/login?callbackUrl=/cart"}
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                shopping_cart
              </span>
              {itemCount > 0 && isLoggedIn ? (
                <span aria-hidden="true" className="site-header__count">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>
            <Link
              aria-label={isLoggedIn ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
              className={`site-header__icon-link ${isLoggedIn && displayUserName ? "site-header__icon-link--has-name" : ""}`}
              href={isLoggedIn ? "/profile" : "/login"}
            >
              {isLoggedIn ? (
                profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full ${getAvatarGradient(displayUserName)} flex items-center justify-center text-white text-[11px] font-bold select-none flex-shrink-0 shadow-sm`}>
                    {displayUserName ? displayUserName.trim().slice(0, 1).toUpperCase() : "U"}
                  </div>
                )
              ) : (
                <span aria-hidden="true" className="material-symbols-outlined">
                  person
                </span>
              )}
              {isLoggedIn && displayUserName && (
                <span className="site-header__user-name">
                  {displayUserName}
                </span>
              )}
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
