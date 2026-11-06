import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  AuthorizationError,
  requireScoutAccess,
} from "@/server/auth/permissions";

export const instant = false;

export default async function ScoutLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireScoutAccess();
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }
    redirect("/");
  }

  return children;
}
