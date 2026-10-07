"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Github,
  GraduationCap,
  Instagram,
  Mail,
  Plus,
  Pen,
  Zap,
  Image as ImageIcon,
  Merge,
  Calculator,
  QrCode,
  ListTodo,
  Search,
} from "lucide-react";
import AddToHomeButton from "@/components/add-to-home-button";
import { useAuth } from "@/lib/auth-context";
import { isStudentEmail } from "@/lib/student-validator";
import Toast from "@/components/toast";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const pageRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const isStudent = user && isStudentEmail(user.email);
  const [toolQuery, setToolQuery] = useState("");
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
      const toastTimeout = window.setTimeout(() => {
        showToast(
          welcome === "back" ? "Selamat datang kembali!" : "Login berhasil!",
          "success",
        );
      }, 0);
      params.delete("welcome");
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      window.history.replaceState(null, "", newUrl);
      return () => window.clearTimeout(toastTimeout);
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from("[data-gsap='hero-copy'] > *", {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.1,
        })
        .from(
          "[data-gsap='hero-card']",
          { y: 28, opacity: 0, scale: 0.98, duration: 0.75 },
          "-=0.45",
        );

      gsap.utils
        .toArray<HTMLElement>("[data-gsap='reveal']")
        .forEach((element) => {
          gsap.from(element, {
            y: 22,
            opacity: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true,
            },
          });
        });
    }, pageRef);

    return () => context.revert();
  }, []);

  const tools = [
    {
      title: "Template Laporan",
      description:
        "Template laporan UTS, UAS, kelompok, individu, dan format akademik lainnya.",
      href: "/templates",
      icon: <FileText size={22} />,
      requiresStudent: true,
      featured: true,
    },
    {
      title: "Bank Soal",
      description: "Kumpulan soal ujian dan latihan dari berbagai mata kuliah.",
      href: "/bank-soal",
      icon: <BookOpen size={22} />,
      requiresStudent: true,
      featured: true,
    },
    {
      title: "Info Dosen",
      description: "Informasi dosen per program studi dari website fakultas.",
      href: "/info-dosen",
      icon: <GraduationCap size={22} />,
      requiresStudent: true,
      featured: true,
    },
    {
      title: "Pengingat Jadwal",
      description: "Ubah jadwal kuliah menjadi pengingat kalender.",
      href: "/schedule-reminder",
      icon: <CalendarDays size={22} />,
      featured: true,
    },
    {
      title: "Planner Tugas",
      description:
        "Catat tugas kuliah dan pantau tenggat supaya tidak ada deadline terlewat.",
      href: "/planner-tugas",
      icon: <ListTodo size={22} />,
      featured: true,
    },
    {
      title: "Plagiarism Checker",
      description: "Periksa kemiripan teks sebelum mengumpulkan tugas.",
      href: "/plagiarism-checker",
      icon: <Search size={22} />,
      featured: true,
    },
    {
      title: "Document Summarizer",
      description: "Buat ringkasan dari artikel, paper, atau teks panjang.",
      href: "/document-summarizer",
      icon: <ClipboardList size={22} />,
      featured: true,
    },
    {
      title: "PDF Editor",
      description: "Edit PDF, tambah tanda tangan atau gambar, dan atur halaman.",
      href: "/pdf-editor",
      icon: <Pen size={22} />,
      featured: false,
    },
    {
      title: "PDF Compressor",
      description: "Kompresi PDF dengan tetap menjaga kualitas dokumen.",
      href: "/pdf-compressor",
      icon: <Zap size={22} />,
      featured: false,
    },
    {
      title: "Image to PDF",
      description: "Konversi gambar JPG atau PNG menjadi dokumen PDF.",
      href: "/image-to-pdf",
      icon: <ImageIcon size={22} />,
      featured: false,
    },
    {
      title: "PDF Merger",
      description: "Gabungkan beberapa PDF dan atur urutan halamannya.",
      href: "/pdf",
      icon: <Merge size={22} />,
      featured: false,
    },
    {
      title: "Kalkulator IPK",
      description: "Hitung IPK dan prediksi nilai semester.",
      href: "/kalkulator-ipk",
      icon: <Calculator size={22} />,
      featured: false,
    },
    {
      title: "QR Code Generator",
      description: "Buat QR code dari tautan, teks, atau informasi kontak.",
      href: "/qr-generator",
      icon: <QrCode size={22} />,
      featured: false,
    },
  ];
  const normalizedToolQuery = toolQuery.trim().toLowerCase();
  const visibleTools = tools.filter((tool) => {
    if (!normalizedToolQuery) return tool.featured;
    return (
      tool.title.toLowerCase().includes(normalizedToolQuery) ||
      tool.description.toLowerCase().includes(normalizedToolQuery)
    );
  });

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-transparent pt-20 text-slate-900"
    >
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div data-gsap="hero-copy">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            Ruang kerja akademik
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 md:text-7xl">
            Kuliah lebih teratur, tugas lebih ringan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            AMIKOM Tools mengumpulkan alat bantu akademik dalam satu tempat,
            dari mengelola dokumen sampai menyiapkan kebutuhan kuliah.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#fitur"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Jelajahi fitur
              <ArrowRight size={17} />
            </Link>
            <AddToHomeButton />
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-orange-100 pt-6 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Alat bantu kuliah dalam satu tempat
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Mudah digunakan langsung dari browser
            </span>
          </div>
        </div>

        <div className="relative" data-gsap="hero-card">
          <div className="absolute -inset-4 rounded-[2rem] border border-orange-200/70" />
          <div className="relative rounded-3xl bg-orange-500 p-7 text-white shadow-xl shadow-orange-200/60 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-orange-100">
                  AMIKOM Tools
                </p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                  Semua yang kamu perlukan, lebih dekat.
                </h2>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <ClipboardList size={28} />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <QuickFeature
                icon={<FileText size={18} />}
                label="Dokumen & tugas"
              />
              <QuickFeature
                icon={<CalendarDays size={18} />}
                label="Jadwal kuliah"
              />
              <QuickFeature
                icon={<GraduationCap size={18} />}
                label="Kebutuhan akademik"
              />
            </div>
            <Link
              href="/tools"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:gap-3"
            >
              Lihat semua tools
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-28 border-y border-orange-100 bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
                Pilih kebutuhanmu
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Tools untuk aktivitas kuliah
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Mulai dari fitur yang paling sering dipakai, atau buka katalog
                untuk melihat pilihan lainnya.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Semua tools
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mb-7 max-w-xl">
            <label
              htmlFor="home-tool-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Cari fitur yang kamu butuhkan
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
              <Search size={18} className="shrink-0 text-orange-600" />
              <input
                id="home-tool-search"
                type="search"
                value={toolQuery}
                onChange={(event) => setToolQuery(event.target.value)}
                placeholder="Contoh: jadwal, PDF, atau IPK"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {normalizedToolQuery && (
              <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                {visibleTools.length} fitur ditemukan dari semua tools.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTools.map((tool) => {
              const locked = tool.requiresStudent && !isStudent;
              const card = (
                <FeatureCard
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  locked={locked}
                />
              );

              return locked ? (
                <div key={tool.title} aria-disabled="true">
                  {card}
                </div>
              ) : (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                >
                  {card}
                </Link>
              );
            })}
            {!normalizedToolQuery && (
              <Link
                href="/tools"
                className="group flex min-h-48 flex-col justify-between rounded-2xl border border-dashed border-orange-300 bg-orange-50/70 p-6 transition hover:border-orange-500 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-700 shadow-sm">
                  <Plus size={22} />
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Lihat semua tools
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Buka katalog lengkap AMIKOM Tools.
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-orange-700 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            )}
            {normalizedToolQuery && visibleTools.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:col-span-2 lg:col-span-3">
                <p className="font-medium text-slate-800">
                  Belum ada tools yang cocok.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Coba kata kunci lain seperti PDF, jadwal, atau dokumen.
                </p>
              </div>
            )}
          </div>
          {!isStudent && (
            <p className="mt-5 text-sm text-slate-500">
              Template, bank soal, dan info dosen tersedia untuk mahasiswa
              Amikom yang sudah masuk dengan akun kampus.
            </p>
          )}
        </div>
      </section>

      <section
        data-gsap="reveal"
        className="mx-auto max-w-7xl px-6 py-16 md:py-20"
      >
        <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            Catatan pembuat
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Dibuat untuk membantu kuliah terasa lebih ringan.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            AMIKOM Tools dibuat agar rekan mahasiswa dapat menghemat waktu,
            menyederhanakan tugas akademik, dan fokus pada hal yang penting:
            belajar, berkarya, dan berkembang.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Akhdaan{" "}
            <span className="font-normal text-slate-500">
              · Developer & Owner
            </span>
          </p>
        </div>
      </section>

      <section
        data-gsap="reveal"
        className="border-y border-orange-100 bg-white/80"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
              Tanya jawab
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Hal yang sering ditanyakan
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FaqCard
              question="Apakah AMIKOM Tools gratis?"
              answer="Ya, semua tools tersedia gratis untuk digunakan."
            />
            <FaqCard
              question="Apakah file PDF saya aman?"
              answer="Pemrosesan PDF dilakukan di browser kamu. File tidak diunggah ke server untuk fitur merge."
            />
            <FaqCard
              question="Apakah perlu memasang aplikasi?"
              answer="Tidak perlu. Website bisa langsung digunakan dari browser, dan bisa ditambahkan ke layar utama."
            />
            <FaqCard
              question="Siapa yang bisa memakai fitur khusus mahasiswa?"
              answer="Template laporan, bank soal, dan info dosen memerlukan akun mahasiswa Amikom."
            />
          </div>
        </div>
      </section>

      <section
        data-gsap="reveal"
        className="mx-auto max-w-7xl px-6 py-16 md:py-20"
      >
        <div className="flex flex-col justify-between gap-8 rounded-3xl bg-slate-950 p-8 text-white md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-300">
              Ada masukan?
            </p>
            <h2 className="mt-2 text-3xl font-bold">Hubungi saya</h2>
            <p className="mt-3 max-w-xl text-slate-300">
              Punya saran, pertanyaan, atau ingin melaporkan kendala? Silakan
              hubungi melalui kanal berikut.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ContactLink href="mailto:makhdaan7@gmail.com" label="Email">
              <Mail size={17} />
            </ContactLink>
            <ContactLink
              href="https://instagram.com/m.akhdaan__"
              label="Instagram"
              external
            >
              <Instagram size={17} />
            </ContactLink>
            <ContactLink
              href="https://github.com/AkhdaanLogics"
              label="GitHub"
              external
            >
              <Github size={17} />
            </ContactLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-orange-100 bg-white/70 px-6 py-7 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Akhdaan The Great</p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-5">
          Tidak terafiliasi dengan AMIKOM Yogyakarta. Website ini dibuat secara
          independen untuk membantu mahasiswa dalam mengerjakan tugas.
        </p>
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

function QuickFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
      <span className="text-orange-100">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto h-2 w-2 rounded-full bg-orange-200" />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  locked = false,
  ...props
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  locked?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`h-full min-h-48 rounded-2xl border bg-white p-6 transition ${
        locked
          ? "border-slate-200 opacity-65"
          : "border-slate-200 shadow-sm group-hover:-translate-y-0.5 group-hover:border-orange-300 group-hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          {icon}
        </div>
        {locked ? (
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-800">
            Khusus mahasiswa
          </span>
        ) : (
          <ArrowRight
            size={18}
            className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
          />
        )}
      </div>
      <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function FaqCard({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
    </article>
  );
}

function ContactLink({
  href,
  label,
  external = false,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-300 hover:bg-white/10"
    >
      {children}
      {label}
    </a>
  );
}
