"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import Toast from "@/components/toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, profile, profileLoading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("");
  const [faculty, setFaculty] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setNim(profile.nim || "");
      setProdi(profile.prodi || "");
      setFaculty(profile.faculty || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || !nim || !prodi || !faculty) {
      showToast(
        "Lengkapi semua data wajib (nama, NIM, prodi, fakultas).",
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          fullName,
          nim,
          prodi,
          faculty,
          phone,
          email: user.email || "",
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      await refreshProfile();
      showToast("Profil berhasil disimpan.", "success");
    } catch (error) {
      showToast("Gagal menyimpan profil. Coba lagi!", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white pt-28 px-6">
        <div className="max-w-xl mx-auto text-center text-purple-200">
          Memuat profil...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Profil Mahasiswa
        </h1>
        <p className="text-purple-200 mb-8">
          Lengkapi profil agar akses fitur khusus mahasiswa lebih mudah.
        </p>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-5"
        >
          <div>
            <label className="block text-sm text-purple-200 mb-2">
              Nama Lengkap *
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">NIM *</label>
            <input
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Masukkan NIM"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">
              Program Studi *
            </label>
            <input
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Contoh: Informatika"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">
              Fakultas *
            </label>
            <input
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Contoh: Ilmu Komputer"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">
              No. HP (opsional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Contoh: 08xxxxxxxxxx"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-purple-50 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-white/20 px-6 py-3 text-white/90 hover:bg-white/10"
            >
              Kembali ke Beranda
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
