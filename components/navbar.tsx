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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-slate-900 transition-colors hover:text-orange-700"
            >
              AMIKOM Tools
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-400 hover:bg-orange-50"
                  >
                    <UserCircle size={16} />
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
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
          <div className="w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-6 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-semibold">Yakin mau keluar?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Kamu akan keluar dari akun ini. Bisa login lagi kapan saja.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
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
