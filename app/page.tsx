import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Link2,
  Quote,
} from "lucide-react";

export default function HomePage() {
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
                Template laporan, ujian online, dan pemendek URL dalam satu
                platform yang cepat dan simpel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shorten"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-500/20 hover:bg-purple-50"
                >
                  Mulai Shorten
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Lihat fitur
                </a>
              </div>
            </div>

            <div id="fitur" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                disabled
                icon={<FileText size={28} />}
                title="Template Laporan"
                badge="Segera hadir"
              >
                Buat laporan akademik otomatis dan export ke PDF dengan cepat.
              </Card>

              <Card
                disabled
                icon={<ClipboardList size={28} />}
                title="Ujian Online"
                badge="Segera hadir"
              >
                Sistem ujian berbasis web dengan timer dan nilai otomatis.
              </Card>

              <Link href="/shorten" className="group">
                <Card icon={<Link2 size={28} />} title="URL Shortener">
                  Pendekkan link, pantau klik, dan kelola masa aktif.
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>

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
            content="Gampang banget buat shorten link buat presentasi. Ga perlu ribet lagi!"
          />
          <TestimonialCard
            name="Siti Nurhaliza"
            role="Mahasiswa SI"
            content="Fitur klik tracking-nya membantu banget buat tau seberapa banyak yang akses link tugas kelompok."
          />
          <TestimonialCard
            name="Budi Santoso"
            role="Mahasiswa Informatika"
            content="Simpel, cepat, dan gratis. Cocok banget buat mahasiswa yang butuh tools praktis."
          />
        </div>
      </section>

      <footer className="text-center text-xs md:text-sm text-purple-200/80 pb-8">
        <div>© {new Date().getFullYear()} Akhdaan The Great</div>
        <div className="mt-1 text-purple-200/70">
          Tidak terafiliasi dengan AMIKOM.
        </div>
      </footer>
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
