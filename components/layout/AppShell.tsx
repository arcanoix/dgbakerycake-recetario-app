"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthRoute = pathname.startsWith("/auth/");
  const isBlogRoute = pathname.startsWith("/blog");

  if (isAuthRoute || isBlogRoute || !user) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
};
