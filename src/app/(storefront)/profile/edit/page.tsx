import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { EditProfileClient } from "./EditProfileClient";

export const metadata = { title: "แก้ไขข้อมูลส่วนตัว | SoftKeyStore" };

export default async function EditProfilePage() {
  const session = await auth();

  // ถ้าไม่ได้ login → redirect ไป /login ทันทีบน server
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <Suspense>
      <EditProfileClient
        userId={session.user.id}
        userName={session.user.name ?? "User"}
        userEmail={session.user.email ?? ""}
        userRole={session.user.role ?? "CUSTOMER"}
      />
    </Suspense>
  );
}
