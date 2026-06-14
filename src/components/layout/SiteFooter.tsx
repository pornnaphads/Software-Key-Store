import Link from "next/link";

const categoryLinks = [
  { href: "/category/windows", label: "Windows" },
  { href: "/category/office", label: "Microsoft Office" },
  { href: "/category/adobe", label: "Adobe CC" },
];

const supportLinks = [
  { href: "/how-to-buy", label: "วิธีสั่งซื้อ" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/profile", label: "บัญชีและสิทธิ์การใช้งาน" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__intro">
          <Link className="site-footer__brand" href="/">
            SoftKeyStore
          </Link>
          <p>
            ร้านซอฟต์แวร์ลิขสิทธิ์แท้ พร้อมคำแนะนำและบริการหลังการขาย
            สำหรับทุกการใช้งาน
          </p>
          <a className="site-footer__contact" href="mailto:support@softkeystore.com">
            <span aria-hidden="true" className="material-symbols-outlined">
              mail
            </span>
            support@softkeystore.com
          </a>
        </div>

        <nav aria-label="หมวดหมู่สินค้า" className="site-footer__links">
          <h2>หมวดหมู่</h2>
          {categoryLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="บริการลูกค้า" className="site-footer__links">
          <h2>บริการลูกค้า</h2>
          {supportLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="site-footer__legal">
        <p>© {new Date().getFullYear()} SoftKeyStore. All rights reserved.</p>
        <p>ชำระเงินอย่างปลอดภัย · ส่งรหัสดิจิทัลทางอีเมล</p>
      </div>
    </footer>
  );
}
