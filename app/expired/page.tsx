import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export default function ExpiredPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.3),_transparent_55%)]" />
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-purple-100">
              <Clock size={28} />
            </div>
            <h1 className="mt-5 text-3xl font-bold">Link Expired</h1>
            <p className="mt-2 text-purple-100">
              Link ini sudah melewati masa aktif 7 hari. Buat link baru agar
              bisa dibagikan lagi.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/shorten"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-purple-500/20 hover:bg-purple-50"
              >
                Buat link baru
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
