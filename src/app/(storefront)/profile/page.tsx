import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { ProfileClient } from "./ProfileClient";

export const metadata = { title: "โปรไฟล์ | SoftKeyStore" };

interface ProfilePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth();

  // ถ้าไม่ได้ login → redirect ไป /login ทันทีบน server
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <Suspense>
      <ProfileClient
        userId={session.user.id}
        userName={session.user.name ?? "User"}
        userEmail={session.user.email ?? ""}
        userRole={session.user.role ?? "CUSTOMER"}
        initialTab={params.tab === "orders" ? "orders" : "profile"}
      />
    </Suspense>
  );
}
