"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Quote,
  GraduationCap,
  BookOpen,
  Search,
  Plus,
} from "lucide-react";
import AddToHomeButton from "@/components/add-to-home-button";
import { useAuth } from "@/lib/auth-context";
import { isStudentEmail } from "@/lib/student-validator";
import Toast from "@/components/toast";

export default function HomePage() {
  const { user } = useAuth();
  const isStudent = user && isStudentEmail(user.email);
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
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const welcome = params.get("welcome");
    if (welcome) {
      showToast(
        welcome === "back" ? "Selamat datang kembali!" : "Login berhasil!",
        "success",
      );
      params.delete("welcome");
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      window.history.replaceState(null, "", newUrl);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_55%)]" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <section className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col gap-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-purple-100">
                Platform mahasiswa • gratis
              </span>
              <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">
                AMIKOM Tools
                <span className="block text-purple-200">
                  semua kebutuhan akademik
                </span>
              </h1>
              <p className="mt-4 text-lg text-purple-100">
                Template laporan, bank soal, info dosen, dan berbagai tools
                untuk mendukung produktivitas akademik kamu.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AddToHomeButton />
                <a
                  href="#fitur"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Lihat fitur
                </a>
              </div>
            </div>

            <div id="fitur" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isStudent ? (
                <Link href="/templates" className="group">
                  <Card
                    icon={<FileText size={28} />}
                    title="Template Laporan"
                    badge="Khusus Mahasiswa Amikom"
                  >
                    Template laporan UTS, UAS, kelompok, individu, dan berbagai
                    format akademik lainnya.
                  </Card>
                </Link>
              ) : (
                <Card
                  disabled
                  icon={<FileText size={28} />}
                  title="Template Laporan"
                  badge="Khusus Mahasiswa Amikom"
                >
                  Template laporan UTS, UAS, kelompok, individu, dan berbagai
                  format akademik lainnya.
                </Card>
              )}

              {isStudent ? (
                <Link href="/bank-soal" className="group">
                  <Card
                    icon={<BookOpen size={28} />}
                    title="Bank Soal"
                    badge="Khusus Mahasiswa Amikom"
                  >
                    Kumpulan soal ujian dan latihan dari berbagai mata kuliah.
                  </Card>
                </Link>
              ) : (
                <Card
                  disabled
                  icon={<BookOpen size={28} />}
                  title="Bank Soal"
                  badge="Khusus Mahasiswa Amikom"
                >
                  Kumpulan soal ujian dan latihan dari berbagai mata kuliah.
                </Card>
              )}

              {isStudent ? (
                <Link href="/info-dosen" className="group">
                  <Card
                    icon={<GraduationCap size={28} />}
                    title="Info Dosen"
                    badge="Khusus Mahasiswa Amikom"
                  >
                    Informasi dosen per prodi dengan redirect ke website resmi
                    fakultas.
                  </Card>
                </Link>
              ) : (
                <Card
                  disabled
                  icon={<GraduationCap size={28} />}
                  title="Info Dosen"
                  badge="Khusus Mahasiswa Amikom"
                >
                  Informasi dosen per prodi dengan redirect ke website resmi
                  fakultas.
                </Card>
              )}

              <Link href="/plagiarism-checker" className="group">
                <Card icon={<Search size={28} />} title="Plagiarism Checker">
                  Cek kesamaan teks dengan analisis semantic similarity yang
                  akurat.
                </Card>
              </Link>

              <Link href="/document-summarizer" className="group">
                <Card icon={<BookOpen size={28} />} title="Document Summarizer">
                  Buat ringkasan otomatis dari artikel, paper, atau teks
                  panjang.
                </Card>
              </Link>

              <Link href="/tools" className="group">
                <Card icon={<Plus size={28} />} title="Tools Lainnya">
                  Lihat semua tools yang tersedia di AMIKOM Tools.
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center">
            <div className="mx-auto md:mx-0">
              <div className="h-36 w-36 rounded-full border border-white/20 bg-white/10 overflow-hidden">
                <Image
                  src="/akhdaan.jpg"
                  alt="Akhdaan"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="inline-flex items-center justify-center md:justify-start gap-2 rounded-full bg-white/10 px-4 py-1 text-xs text-purple-100 w-fit mx-auto md:mx-0">
                Catatan Pembuat
              </span>
              <p className="text-sm text-purple-200/90">
                Akhdaan • Developer & Owner
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Semoga AMIKOM Tools jadi teman produktif kamu
              </h2>
              <p className="text-purple-200 text-sm md:text-base max-w-3xl">
                Saya berharap platform ini bisa membantu rekan mahasiswa
                menghemat waktu, menyederhanakan tugas akademik, dan membuat
                proses belajar terasa lebih ringan. Semua fitur dibuat supaya
                kamu bisa fokus pada hal yang penting: belajar, berkarya, dan
                berkembang.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">Apa Kata Mereka</h2>
          <p className="mt-2 text-purple-200">
            Pengalaman pengguna AMIKOM Tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Andi Pratama"
            role="Mahasiswa TI"
            content="Merge PDF jadi lebih mudah! Bisa gabung puluhan file dalam hitungan detik tanpa install aplikasi."
          />
          <TestimonialCard
            name="Siti Nurhaliza"
            role="Mahasiswa SI"
            content="Interface-nya simple banget, cocok buat yang ga teknis. Langsung bisa bikin laporan gabungan."
          />
          <TestimonialCard
            name="Budi Santoso"
            role="Mahasiswa Informatika"
            content="Simpel, cepat, dan gratis. Cocok banget buat mahasiswa yang butuh tools praktis."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          FAQ
        </h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2 text-purple-300">
              Apakah gratis?
            </h3>
            <p className="text-purple-200/80">
              Ya, semua tools 100% gratis tanpa batasan.
            </p>
          </div>
          <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2 text-purple-300">
              File PDF saya aman?
            </h3>
            <p className="text-purple-200/80">
              Sangat aman! Semua proses merge dilakukan di browser kamu. File
              tidak pernah diupload ke server.
            </p>
          </div>
          <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2 text-purple-300">
              Butuh install aplikasi?
            </h3>
            <p className="text-purple-200/80">
              Tidak perlu! Bisa langsung diakses lewat browser. Atau klik
              "Pasang di Layar Utama" untuk akses lebih cepat.
            </p>
          </div>
          <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2 text-purple-300">
              Ada fitur lain yang akan ditambahkan?
            </h3>
            <p className="text-purple-200/80">
              Tentu! Sedang dikembangkan fitur-fitur lain yang berguna untuk
              mahasiswa. Stay tuned!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-20 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Hubungi Saya
        </h2>
        <p className="text-purple-200/80 mb-8">
          Ada saran, pertanyaan, atau mau lapor bug? Kontak aja!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:makhdaan7@gmail.com"
            className="inline-flex items-center gap-2 bg-white/5 border border-purple-500/20 hover:bg-white/10 px-6 py-3 rounded-lg transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email
          </a>
          <a
            href="https://instagram.com/m.akhdaan__"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 border border-purple-500/20 hover:bg-white/10 px-6 py-3 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Instagram
          </a>
          <a
            href="https://github.com/AkhdaanLogics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 border border-purple-500/20 hover:bg-white/10 px-6 py-3 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </section>

      <footer className="text-center text-xs md:text-sm text-purple-200/80 pb-8">
        <div>© {new Date().getFullYear()} Akhdaan The Great</div>
        <div className="mt-2 text-purple-200/70 max-w-2xl mx-auto px-6">
          <p>Tidak terafiliasi dengan AMIKOM Yogyakarta.</p>
          <p className="mt-1">
            Website ini dibuat secara independen untuk memudahkan mahasiswa
            dalam mengerjakan tugas.
          </p>
        </div>
      </footer>

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
      className={`relative rounded-2xl border border-white/10 p-6 h-full bg-white/5 backdrop-blur shadow-xl transition
      ${disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1 hover:bg-white/10"}`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] text-purple-100">
          {badge}
        </span>
      )}
      <div className="mb-4 text-purple-100">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-purple-100/90">{children}</p>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  content,
}: {
  name: string;
  role: string;
  content: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <Quote size={24} className="mb-3 text-purple-200" />
      <p className="text-sm text-purple-100 leading-relaxed">{content}</p>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-purple-200">{role}</p>
      </div>
    </div>
  );
}
