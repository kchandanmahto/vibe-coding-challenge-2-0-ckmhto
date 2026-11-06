import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  AuthorizationError,
  requireCoachAccess,
} from "@/server/auth/permissions";

export const instant = false;

export default async function CoachLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireCoachAccess();
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }
    redirect("/");
  }

  return children;
}
