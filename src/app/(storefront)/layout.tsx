import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ContactChat } from "@/components/contact/ContactChat";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="app-main">{children}</main>
      <SiteFooter />
      <ContactChat />
    </>
  );
}
