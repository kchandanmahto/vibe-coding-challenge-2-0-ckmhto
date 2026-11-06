import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  AuthorizationError,
  requireRole,
} from "@/server/auth/permissions";

export const instant = false;

export default async function PlayerLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireRole(["PLAYER"]);
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }
    redirect("/");
  }

  return children;
}
