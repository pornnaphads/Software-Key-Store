"use client";

import React from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { CartProvider } from "@/features/cart/CartProvider";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
