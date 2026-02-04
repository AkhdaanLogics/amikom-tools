"use client";

import { FileText, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const wordTemplateLink = "";
const docsTemplateLink = "";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white pt-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_55%)]" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative container mx-auto px-4 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-purple-600/20 p-4">
                <FileText size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Template Laporan
            </h1>
            <p className="text-purple-200">
              Unduh template laporan versi Word atau Google Docs
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Template Word
                  </h3>
                  <p className="text-sm text-purple-200">
                    Format .docx untuk Microsoft Word
                  </p>
                </div>

                {wordTemplateLink ? (
                  <a
                    href={wordTemplateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition-all hover:scale-105"
                  >
                    Unduh Word
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/50">
                    Link Word belum tersedia
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Template Google Docs
                  </h3>
                  <p className="text-sm text-purple-200">
                    Format Docs untuk edit online
                  </p>
                </div>

                {docsTemplateLink ? (
                  <a
                    href={docsTemplateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
                  >
                    Buka Docs
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/50">
                    Link Docs belum tersedia
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Sederhana</h3>
                <p className="text-sm text-purple-100/70">
                  Langsung unduh template tanpa pilih prodi
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Dua Format</h3>
                <p className="text-sm text-purple-100/70">
                  Word untuk offline, Docs untuk online
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Selalu Update</h3>
                <p className="text-sm text-purple-100/70">
                  Template selalu diperbarui mengikuti aturan terbaru
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
