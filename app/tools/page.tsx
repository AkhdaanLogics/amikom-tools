"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  GraduationCap,
  Search,
  Pen,
  Zap,
  Image as ImageIcon,
  Merge,
  Calculator,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isStudentEmail } from "@/lib/student-validator";
import Toast from "@/components/toast";

export default function ToolsPage() {
  const { user } = useAuth();
  const isStudent = user && isStudentEmail(user.email);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setToast({
        message: "Login dulu untuk membuka semua tools",
        type: "info",
      });
      setTimeout(() => setToast(null), 3000);
    }
  }, [user]);

  const tools = [
    {
      title: "Template Laporan",
      description:
        "Template laporan UTS, UAS, kelompok, individu, dan berbagai format akademik lainnya.",
      href: "/templates",
      icon: <FileText size={28} />,
      requiresStudent: true,
      badge: "Khusus Mahasiswa Amikom",
    },
    {
      title: "Bank Soal",
      description: "Kumpulan soal ujian dan latihan dari berbagai mata kuliah.",
      href: "/bank-soal",
      icon: <BookOpen size={28} />,
      requiresStudent: true,
      badge: "Khusus Mahasiswa Amikom",
    },
    {
      title: "Info Dosen",
      description:
        "Informasi dosen per prodi dengan redirect ke website resmi fakultas.",
      href: "/info-dosen",
      icon: <GraduationCap size={28} />,
      requiresStudent: true,
      badge: "Khusus Mahasiswa Amikom",
    },
    {
      title: "Plagiarism Checker",
      description:
        "Cek kesamaan teks dengan analisis semantic similarity yang akurat.",
      href: "/plagiarism-checker",
      icon: <Search size={28} />,
    },
    {
      title: "Document Summarizer",
      description:
        "Buat ringkasan otomatis dari artikel, paper, atau teks panjang.",
      href: "/document-summarizer",
      icon: <BookOpen size={28} />,
    },
    {
      title: "PDF Editor",
      description: "Edit PDF: tambah tanda tangan, gambar, atur ulang halaman.",
      href: "/pdf-editor",
      icon: <Pen size={28} />,
    },
    {
      title: "PDF Compressor",
      description: "Kompresi PDF tanpa mengurangi kualitas terlalu banyak.",
      href: "/pdf-compressor",
      icon: <Zap size={28} />,
    },
    {
      title: "Image to PDF",
      description: "Konversi gambar (JPG, PNG) menjadi PDF dengan mudah.",
      href: "/image-to-pdf",
      icon: <ImageIcon size={28} />,
    },
    {
      title: "PDF Merger",
      description:
        "Gabung multiple PDF, atur urutan, dan download dengan mudah.",
      href: "/pdf",
      icon: <Merge size={28} />,
    },
    {
      title: "Kalkulator IPK",
      description: "Hitung IPK dan prediksi nilai semester dengan mudah.",
      href: "/kalkulator-ipk",
      icon: <Calculator size={28} />,
    },
    {
      title: "QR Code Generator",
      description:
        "Generate QR code untuk link, teks, atau kontak dengan mudah.",
      href: "/qr-generator",
      icon: <QrCode size={28} />,
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
    if (!normalizedQuery) return true;
    return (
      tool.title.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.35),transparent_55%)]" />
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
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Semua Tools</h1>
            <p className="text-purple-200">
              Berikut daftar lengkap tools yang tersedia di AMIKOM Tools
            </p>
          </div>

          <div className="mx-auto mb-10 max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search size={18} className="text-purple-300" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari tools..."
                className="w-full bg-transparent text-sm text-white placeholder:text-purple-300 focus:outline-none"
              />
            </div>
            {normalizedQuery && (
              <p className="mt-2 text-xs text-purple-200">
                Menampilkan {filteredTools.length} hasil untuk “{query}”
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTools.map((tool) =>
              tool.requiresStudent && !isStudent ? (
                <Card
                  key={tool.title}
                  disabled
                  icon={tool.icon}
                  title={tool.title}
                  badge={tool.badge}
                >
                  {tool.description}
                </Card>
              ) : (
                <Link key={tool.title} href={tool.href} className="group">
                  <Card icon={tool.icon} title={tool.title} badge={tool.badge}>
                    {tool.description}
                  </Card>
                </Link>
              ),
            )}

            {filteredTools.length === 0 && (
              <div className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-purple-200">
                  Tidak ada tools yang cocok dengan pencarianmu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  icon,
  title,
  children,
  disabled,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 p-6 h-full bg-white/5 backdrop-blur shadow-xl transition ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:-translate-y-1 hover:border-purple-500/50"
      }`}
    >
      {badge && (
        <span className="absolute top-4 right-4 rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
          {badge}
        </span>
      )}
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/10 p-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-purple-200 leading-relaxed">{children}</p>
    </div>
  );
}
