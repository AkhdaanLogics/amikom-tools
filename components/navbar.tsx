"use client";

import Link from "next/link";
import { User, LogOut, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import Toast from "@/components/toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    showToast("Berhasil keluar. Sampai jumpa lagi!", "success");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  // Don't show navbar on login page
  if (pathname === "/login") return null;

  return (
    <>
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
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  >
                    <UserCircle size={16} />
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-purple-50"
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-semibold">Yakin mau keluar?</h3>
            <p className="mt-2 text-sm text-purple-200">
              Kamu akan keluar dari akun ini. Bisa login lagi kapan saja.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-purple-50"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
