"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Trash2,
} from "lucide-react";

type ShortUrl = {
  id: string;
  slug: string;
  original_url: string;
  clicks: number;
  created_at: string;
  expires_at: string;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/links", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Re-fetch data untuk ensure data terbaru
        await fetchLinks();
      } else {
        const text = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || `HTTP ${res.status}` };
        }
        console.error("Delete failed:", res.status, errorData);
        alert("Gagal menghapus link: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus link");
    } finally {
      setDeleteLoading(false);
      setDeleteModal(null);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-purple-200">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.3),_transparent_55%)]" />
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <BarChart3 size={32} />
              Dashboard
            </h1>
            <p className="mt-2 text-purple-100">
              Kelola semua tools dan pantau aktivitas Anda
            </p>
          </div>

          {/* Tools Cards */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/shorten">
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl transition hover:-translate-y-1 hover:bg-white/10">
                <div className="mb-4 text-purple-100">
                  <Link2 size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">URL Shortener</h3>
                <p className="text-sm text-purple-100/90">
                  Buat link pendek dan pantau statistiknya
                </p>
              </div>
            </Link>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl opacity-60 cursor-not-allowed">
              <div className="mb-4 text-purple-100">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Template Laporan</h3>
              <p className="text-sm text-purple-100/90">
                Buat laporan akademik otomatis
              </p>
              <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] text-purple-100">
                Segera hadir
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl opacity-60 cursor-not-allowed">
              <div className="mb-4 text-purple-100">
                <ClipboardList size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ujian Online</h3>
              <p className="text-sm text-purple-100/90">
                Sistem ujian dengan timer otomatis
              </p>
              <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] text-purple-100">
                Segera hadir
              </span>
            </div>
          </div>

          {/* URL Shortener Stats */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Link Saya</h2>

            {links.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
                <p className="text-purple-200">
                  Belum ada link. Buat link pertama Anda!
                </p>
                <Link
                  href="/shorten"
                  className="mt-4 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-purple-50"
                >
                  Buat Link
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => {
                  const shortUrl = `${window.location.origin}/${link.slug}`;
                  const isExpired =
                    link.expires_at && new Date(link.expires_at) < new Date();

                  return (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <a
                              href={shortUrl}
                              target="_blank"
                              className="text-lg font-semibold text-white hover:text-purple-200 flex items-center gap-2"
                            >
                              /{link.slug}
                              <ExternalLink size={16} />
                            </a>
                            {isExpired && (
                              <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-200">
                                Expired
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-purple-200 truncate">
                            {link.original_url}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-purple-200/80">
                            <span>{link.clicks} klik</span>
                            <span>•</span>
                            <span>
                              {new Date(link.created_at).toLocaleDateString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(link.slug)}
                            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                          >
                            <Copy size={16} />
                            Salin
                          </button>
                          <button
                            onClick={() => setDeleteModal(link.id)}
                            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Hapus Link?</h3>
            <p className="mt-2 text-sm text-purple-200">
              Link ini akan dihapus secara permanen dan tidak bisa dikembalikan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => deleteLink(deleteModal)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Menghapus...
                  </span>
                ) : (
                  "Hapus"
                )}
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
