"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn, Mail, CheckCircle } from "lucide-react";
import Toast from "@/components/toast";
import { isStudentEmail } from "@/lib/student-validator";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const redirectAfterLogin = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push("/");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "profiles", currentUser.uid));
      if (snap.exists()) {
        router.push("/?welcome=back");
      } else {
        router.push("/profile");
      }
    } catch {
      router.push("/");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Validasi email student saat sign up
        if (!isStudentEmail(email)) {
          showToast(
            "Gunakan email mahasiswa AMIKOM dengan format @students.amikom.ac.id untuk mendaftar.",
            "error",
          );
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password);
        setSuccess("Akun berhasil dibuat! Silakan login.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        await signInWithEmail(email, password);
        await redirectAfterLogin();
      }
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan";
      if (message.includes("Invalid login credentials")) {
        setError("Email atau password salah");
      } else if (message.includes("Email not confirmed")) {
        setError("Email belum diverifikasi. Cek inbox Anda.");
      } else if (message.includes("already in use")) {
        setError("Email sudah terdaftar");
      } else if (message.includes("invalid-email")) {
        setError("Format email tidak valid");
      } else if (message.includes("weak-password")) {
        setError("Password minimal 6 karakter");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      await redirectAfterLogin();
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan saat login Google";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.3),_transparent_55%)]" />
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
          <div className="w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-purple-200 hover:text-white mb-6"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
              <h1 className="text-3xl font-bold mb-2">
                {isSignUp ? "Buat Akun" : "Masuk"}
              </h1>
              <p className="text-purple-100 mb-6">
                {isSignUp
                  ? "Daftar untuk mulai membuat link"
                  : "Login untuk akses dashboard"}
              </p>

              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-200 flex items-center gap-2">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="text-sm text-purple-100">Email</label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <Mail size={18} className="text-purple-200" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-purple-200/60 focus:outline-none"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-purple-100">Password</label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <LogIn size={18} className="text-purple-200" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-purple-200/60 focus:outline-none"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-purple-500/20 hover:bg-purple-50 disabled:opacity-50"
                >
                  {loading ? "Loading..." : isSignUp ? "Daftar" : "Masuk"}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-purple-200">atau</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </button>

              <p className="mt-6 text-center text-sm text-purple-200">
                {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-white hover:underline"
                >
                  {isSignUp ? "Masuk" : "Daftar"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
