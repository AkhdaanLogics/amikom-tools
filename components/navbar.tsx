"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BarChart3, LogOut, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setTimeout(() => window.location.reload(), 100);
  };

  // Don't show navbar on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-purple-200"
          >
            AMIKOM Tools
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                  <BarChart3 size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-purple-50"
              >
                <User size={16} />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
