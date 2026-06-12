import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-layout">
      <header className="auth-layout__header">
        <Link className="auth-layout__brand" href="/">
          SoftKeyStore
        </Link>
      </header>
      <main className="auth-layout__main">{children}</main>
    </div>
  );
}
