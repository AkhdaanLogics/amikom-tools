"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        alert("Akun berhasil dibuat! Silakan login.");
        setIsSignUp(false);
      } else {
        await signInWithEmail(email, password);
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan";
      if (message.includes("Invalid login credentials")) {
        setError("Email atau password salah");
      } else if (message.includes("Email not confirmed")) {
        setError("Email belum diverifikasi. Cek inbox Anda.");
      } else {
        setError(message);
      }
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
    </div>
  );
}
