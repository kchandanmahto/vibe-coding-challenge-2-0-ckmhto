"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton({
  className,
}: {
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    await signOut({
      redirectTo: "/login",
    });
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      aria-busy={isLoading}
      onClick={handleLogout}
      className={className}
    >
      {isLoading ? "Signing out..." : "Log out"}
    </button>
  );
}
