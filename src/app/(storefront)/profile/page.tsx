import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { ProfileClient } from "./ProfileClient";

export const metadata = { title: "โปรไฟล์ | SoftKeyStore" };

export default async function ProfilePage() {
  const session = await auth();

  // ถ้าไม่ได้ login → redirect ไป /login ทันทีบน server
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <ProfileClient
      userId={session.user.id}
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
      userRole={session.user.role ?? "CUSTOMER"}
    />
  );
}
