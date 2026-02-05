"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Upload, Wand2, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Toast from "@/components/toast";

interface ScheduleItem {
  id: string;
  day: string;
  start: string;
  end: string;
  course: string;
  room?: string;
}

const DAY_MAP: Record<string, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
  minggu: 0,
};

export default function ScheduleReminderPage() {
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

  return <ScheduleReminderContent />;
}

function ScheduleReminderContent() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().slice(0, 10);
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setOcrText("");
    setItems([]);
    setProgress(0);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;

    const isPdf = f.type === "application/pdf";
    const isImage = f.type.startsWith("image/");

    if (!isPdf && !isImage) {
      showToast("Format tidak didukung. Upload PDF atau gambar.", "error");
      return;
    }

    setFile(f);
    setItems([]);
    setOcrText("");

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
  };

  const renderPdfToImage = async (pdfFile: File) => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const buffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  };

  const runOcr = async () => {
    if (!file) {
      showToast("Upload jadwal dulu", "error");
      return;
    }

    setProcessing(true);
    setProgress(10);

    try {
      let imageSource: string | null = previewUrl;

      if (!imageSource && file.type === "application/pdf") {
        imageSource = await renderPdfToImage(file);
        if (!imageSource) {
          throw new Error("Gagal render PDF");
        }
        setPreviewUrl(imageSource);
      }

      if (!imageSource) {
        throw new Error("Gagal membaca gambar");
      }

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ind+eng");

      const result = await worker.recognize(imageSource);
      await worker.terminate();

      const text = result.data.text || "";
      setOcrText(text);
      const parsed = parseSchedule(text);
      setItems(parsed);
      setProgress(100);

      showToast("OCR selesai. Cek hasil di bawah.", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal membaca jadwal", "error");
    }

    setProcessing(false);
  };

  const parseSchedule = (text: string): ScheduleItem[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const results: ScheduleItem[] = [];
    const timeRegex = /(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/i;
    const dayRegex = /(senin|selasa|rabu|kamis|jumat|sabtu|minggu)/i;
    const roomRegex = /(ruang|room|kelas|lab|r\.?\s*|rm\.?\s*)([a-z0-9-]+)/i;

    for (const line of lines) {
      const timeMatch = line.match(timeRegex);
      const dayMatch = line.match(dayRegex);

      if (!timeMatch || !dayMatch) continue;

      const start = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
      const end = `${timeMatch[3].padStart(2, "0")}:${timeMatch[4]}`;
      const day = dayMatch[1].toLowerCase();

      const roomMatch = line.match(roomRegex);
      const room = roomMatch ? `${roomMatch[1]}${roomMatch[2]}` : undefined;

      // Expected format: hari jam-jam matkul ruangan
      // Remove day + time + room, then use remaining text as course
      const cleaned = line
        .replace(dayRegex, "")
        .replace(timeRegex, "")
        .replace(roomRegex, "")
        .replace(/[|•]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      const course = cleaned || "Mata Kuliah";

      results.push({
        id: `item-${results.length}-${Date.now()}`,
        day,
        start,
        end,
        course,
        room,
      });
    }

    return results;
  };

  const buildICS = () => {
    if (items.length === 0) {
      showToast("Belum ada jadwal", "error");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const dd = `${d.getDate()}`.padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    };

    const formatDateTime = (d: Date, time: string) => {
      const [hh, mm] = time.split(":");
      const copy = new Date(d);
      copy.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      const yyyy = copy.getFullYear();
      const MM = `${copy.getMonth() + 1}`.padStart(2, "0");
      const DD = `${copy.getDate()}`.padStart(2, "0");
      const HH = `${copy.getHours()}`.padStart(2, "0");
      const MN = `${copy.getMinutes()}`.padStart(2, "0");
      return `${yyyy}${MM}${DD}T${HH}${MN}00`;
    };

    const findFirstDate = (base: Date, dayIndex: number) => {
      const date = new Date(base);
      const diff = (dayIndex - date.getDay() + 7) % 7;
      date.setDate(date.getDate() + diff);
      return date;
    };

    let ics =
      "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AMIKOM Tools//Schedule//ID\n";

    items.forEach((item) => {
      const dayIndex = DAY_MAP[item.day] ?? 1;
      const first = findFirstDate(start, dayIndex);
      const dtStart = formatDateTime(first, item.start);
      const dtEnd = formatDateTime(first, item.end);
      const until = `${formatDate(end)}T235900`;
      const summary = item.course;
      const location = item.room ? `LOCATION:${item.room}\n` : "";

      ics +=
        "BEGIN:VEVENT\n" +
        `UID:${item.id}\n` +
        `DTSTART:${dtStart}\n` +
        `DTEND:${dtEnd}\n` +
        `RRULE:FREQ=WEEKLY;UNTIL=${until}\n` +
        `SUMMARY:${summary}\n` +
        location +
        "END:VEVENT\n";
    });

    ics += "END:VCALENDAR";

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "jadwal-kuliah.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToLocal = () => {
    if (items.length === 0) {
      showToast("Belum ada jadwal", "error");
      return;
    }

    localStorage.setItem("schedule-items", JSON.stringify(items));
    showToast("Jadwal disimpan di browser", "success");
  };

  const loadFromLocal = () => {
    const raw = localStorage.getItem("schedule-items");
    if (!raw) {
      showToast("Belum ada data tersimpan", "info");
      return;
    }
    try {
      const data = JSON.parse(raw) as ScheduleItem[];
      setItems(data);
      showToast("Jadwal dimuat", "success");
    } catch {
      showToast("Gagal memuat jadwal", "error");
    }
  };

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
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-purple-600/20 p-4">
                <CalendarDays size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Pengingat Jadwal
            </h1>
            <p className="text-purple-200">
              Upload jadwal, OCR otomatis, lalu export ke kalender (ICS)
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="font-bold text-lg mb-4">Upload Jadwal</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-semibold transition-all hover:scale-105"
                  >
                    <Upload size={16} />
                    Pilih File
                  </button>
                  <button
                    onClick={runOcr}
                    disabled={processing || !file}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    <Wand2 size={16} />
                    OCR Jadwal
                  </button>
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold transition-all hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                />

                {processing && (
                  <div className="mt-4 text-sm text-purple-200">
                    OCR berjalan... {progress}%
                  </div>
                )}

                {file && (
                  <div className="mt-4 text-sm text-purple-200">
                    File: {file.name}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="font-bold text-lg mb-4">Preview</h3>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-xl border border-white/10"
                  />
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-purple-200">
                    Preview akan muncul setelah upload
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="font-bold text-lg mb-4">Hasil OCR</h3>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none"
                  placeholder="Hasil OCR akan muncul di sini"
                />
                <button
                  onClick={() => setItems(parseSchedule(ocrText))}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10"
                >
                  <Wand2 size={16} />
                  Parse Jadwal
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="font-bold text-lg mb-4">Pengaturan Kalender</h3>
                <label className="text-sm text-purple-200">Mulai dari</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-white"
                />
                <label className="mt-4 text-sm text-purple-200 block">
                  Sampai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-white"
                />

                <div className="mt-4 grid gap-2">
                  <button
                    onClick={buildICS}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
                  >
                    <Download size={16} />
                    Download ICS
                  </button>
                  <button
                    onClick={saveToLocal}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10"
                  >
                    Simpan di Browser
                  </button>
                  <button
                    onClick={loadFromLocal}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10"
                  >
                    Muat dari Browser
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="font-bold text-lg mb-4">Jadwal Terdeteksi</h3>
                {items.length === 0 ? (
                  <div className="text-sm text-purple-200">
                    Belum ada jadwal terdeteksi.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                      >
                        <div className="font-semibold capitalize">
                          {item.day} {item.start}-{item.end}
                        </div>
                        <div className="text-purple-200">{item.course}</div>
                        {item.room && (
                          <div className="text-purple-300">{item.room}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-purple-200">
            <p className="font-semibold text-white mb-2">Catatan</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                OCR gratis punya akurasi terbatas. Jika hasil kurang rapi,
                gunakan tombol <strong>Parse Jadwal</strong> setelah edit
                manual.
              </li>
              <li>
                Format terbaik: ada hari + jam (misal: "Senin 08:00-10:00") pada
                satu baris.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
