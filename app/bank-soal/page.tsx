"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type Program = {
  name: string;
  shortName: string;
  link?: string;
};

type Faculty = {
  name: string;
  programs: Program[];
};

const faculties: Faculty[] = [
  {
    name: "Fakultas Ilmu Komputer (FIK)",
    programs: [
      {
        name: "S1 Informatika",
        shortName: "IF",
        link: "https://drive.google.com/drive/folders/1YZWO_uPJ8R3AE6kmbxGAccENbtJjPVzH",
      },
      { name: "S1 Sistem Informasi", shortName: "SI", link: "" },
      { name: "S1 Teknologi Informasi", shortName: "TI", link: "" },
      { name: "S1 Teknik Komputer", shortName: "TK", link: "" },
      { name: "D3 Teknik Informatika", shortName: "D3-TI", link: "" },
      { name: "D3 Manajemen Informatika", shortName: "D3-MI", link: "" },
      { name: "Prodi Internasional", shortName: "INTL", link: "" },
    ],
  },
  {
    name: "Fakultas Ekonomi dan Sosial (FES)",
    programs: [
      { name: "S1 Ekonomi", shortName: "EK", link: "" },
      { name: "S1 Akuntansi", shortName: "AK", link: "" },
      { name: "S1 Ilmu Komunikasi", shortName: "KOM", link: "" },
      { name: "S1 Kewirausahaan", shortName: "KWU", link: "" },
      { name: "S1 Ilmu Pemerintahan", shortName: "IP", link: "" },
      { name: "S1 Hubungan Internasional", shortName: "HI", link: "" },
    ],
  },
  {
    name: "Fakultas Sains dan Teknologi (FST)",
    programs: [
      { name: "S1 Arsitektur", shortName: "AR", link: "" },
      { name: "S1 Geografi", shortName: "GG", link: "" },
      { name: "S1 Perencanaan Wilayah dan Kota", shortName: "PWK", link: "" },
    ],
  },
];

export default function BankSoalPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          <p className="mt-4 text-purple-200">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <BankSoalContent />;
}

function BankSoalContent() {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_55%)]" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative container mx-auto px-4 py-16">
          {selectedFaculty ? (
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Kembali ke Beranda
              </Link>
              <div className="hidden h-6 w-px bg-white/20 md:block" />
              <button
                onClick={() => setSelectedFaculty(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Kembali ke Beranda
            </Link>
          )}

          {!selectedFaculty ? (
            <>
              <div className="mb-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-purple-600/20 p-4">
                    <BookOpen size={48} className="text-purple-400" />
                  </div>
                </div>
                <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                  Bank Soal
                </h1>
                <p className="text-purple-200">
                  Kumpulan soal ujian dan latihan dari himpunan prodi
                </p>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="grid gap-4 md:grid-cols-2">
                  {faculties.map((faculty) => (
                    <button
                      key={faculty.name}
                      onClick={() => setSelectedFaculty(faculty)}
                      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 transition-all hover:bg-white/10 hover:-translate-y-1"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                          {faculty.name}
                        </h2>
                        <ArrowRight
                          size={20}
                          className="text-purple-400 transition-transform group-hover:translate-x-1"
                        />
                      </div>
                      <p className="text-sm text-purple-100/70">
                        {faculty.programs.length} program studi
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-12">
                <h1 className="mb-2 text-4xl font-bold">
                  {selectedFaculty.name}
                </h1>
                <p className="text-purple-200">
                  Pilih program studi untuk mengakses bank soal
                </p>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedFaculty.programs.map((program) => (
                    <div
                      key={program.shortName}
                      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {program.name}
                        </h3>
                        <p className="text-sm text-purple-200">
                          {program.shortName}
                        </p>
                      </div>

                      {program.link ? (
                        <a
                          href={program.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition-all hover:scale-105"
                        >
                          Akses Bank Soal
                          <ArrowRight size={16} />
                        </a>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/50">
                          Link belum tersedia
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Per Prodi</h3>
                <p className="text-sm text-purple-100/70">
                  Soal dikelola oleh masing-masing himpunan prodi
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Google Drive</h3>
                <p className="text-sm text-purple-100/70">
                  Akses langsung ke koleksi soal di Google Drive
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Selalu Update</h3>
                <p className="text-sm text-purple-100/70">
                  Soal terus ditambahkan oleh himpunan prodi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
