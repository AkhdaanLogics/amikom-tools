"use client";

import { useState } from "react";
import { BookOpen, ArrowLeft, Copy, Check, Download } from "lucide-react";
import Toast from "@/components/toast";
import Link from "next/link";

export default function DocumentSummarizerPage() {
  return <DocumentSummarizerContent />;
}

function DocumentSummarizerContent() {
  const [originalText, setOriginalText] = useState("");
  const [summaryPercentage, setSummaryPercentage] = useState(30);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // Extractive summarization algorithm
  const generateSummary = (text: string, percentage: number): string => {
    if (!text.trim()) return "";

    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) return "";

    // Calculate number of sentences to include
    const summaryLength = Math.max(
      1,
      Math.ceil((sentences.length * percentage) / 100),
    );

    // Score sentences based on keyword frequency
    const scoreWords = (text: string): Map<string, number> => {
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(
          (w) =>
            w.length > 3 &&
            ![
              "yang",
              "adalah",
              "dengan",
              "untuk",
              "dari",
              "pada",
              "atau",
              "dapat",
              "telah",
              "akan",
              "juga",
              "dalam",
              "oleh",
              "saat",
              "ini",
              "dan",
            ].includes(w),
        );

      const wordFreq = new Map<string, number>();
      words.forEach((word) => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });

      return wordFreq;
    };

    const wordFreq = scoreWords(text);

    // Score each sentence
    const scoreSentences = (
      sentences: string[],
    ): { score: number; index: number }[] => {
      return sentences.map((sentence, index) => {
        const words = sentence
          .toLowerCase()
          .replace(/[^\w\s]/g, " ")
          .split(/\s+/);

        let score = 0;
        words.forEach((word) => {
          score += wordFreq.get(word) || 0;
        });

        // Normalize by sentence length
        score = score / Math.max(words.length, 1);

        // Boost first sentence
        if (index === 0) score *= 1.5;

        return { score, index };
      });
    };

    const scoredSentences = scoreSentences(sentences);

    // Get top sentences and maintain order
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .sort((a, b) => a.index - b.index)
      .map((s) => sentences[s.index]);

    return topSentences.join(". ") + ".";
  };

  const handleSummarize = async () => {
    if (!originalText.trim()) {
      showToast("Masukkan teks terlebih dahulu", "error");
      return;
    }

    setSummarizing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const summaryText = generateSummary(originalText, summaryPercentage);
    setSummary(summaryText);
    setSummarizing(false);

    showToast("Ringkasan berhasil dibuat!", "success");
  };

  const handleCopy = async () => {
    if (!summary) {
      showToast("Tidak ada ringkasan untuk disalin", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast("Ringkasan disalin ke clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin", "error");
    }
  };

  const handleDownload = () => {
    if (!summary) {
      showToast("Tidak ada ringkasan untuk diunduh", "error");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ringkasan-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Ringkasan berhasil diunduh", "success");
  };

  const resetForm = () => {
    setOriginalText("");
    setSummary("");
    setSummaryPercentage(30);
  };

  const characterReduction = originalText.length - summary.length;
  const reductionPercentage =
    originalText.length > 0
      ? Math.round((characterReduction / originalText.length) * 100)
      : 0;

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
                <BookOpen size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Document Summarizer
            </h1>
            <p className="text-purple-200">
              Buat ringkasan otomatis dari artikel, paper, atau teks panjang
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Input Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold">Input Dokumen</h2>

                {/* Text Input */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-purple-200">
                    Teks yang Akan Diringkas
                  </label>
                  <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Paste artikel, paper, atau teks panjang di sini..."
                    rows={8}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-purple-100/70">
                    {originalText.length} karakter
                  </p>
                </div>

                {/* Summary Percentage */}
                <div className="mb-6">
                  <label className="mb-2 flex items-center justify-between text-sm font-semibold text-purple-200">
                    <span>Panjang Ringkasan</span>
                    <span className="text-white">{summaryPercentage}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={summaryPercentage}
                    onChange={(e) =>
                      setSummaryPercentage(Number(e.target.value))
                    }
                    disabled={summarizing}
                    className="w-full accent-purple-600"
                  />
                  <p className="mt-2 text-xs text-purple-100/70">
                    Semakin rendah persentase = ringkasan lebih singkat
                  </p>
                </div>

                {/* Info Box */}
                <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-4 mb-6">
                  <p className="text-xs text-blue-100">
                    <strong>Cara Kerja:</strong> Algoritma extractive summary
                    memilih kalimat penting berdasarkan keyword frequency dan
                    relevansi. Semua proses berjalan di browser, data aman.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSummarize}
                    disabled={summarizing || !originalText.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {summarizing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Meringkas...
                      </>
                    ) : (
                      <>
                        <BookOpen size={18} />
                        Buat Ringkasan
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Result Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold">Ringkasan</h2>

                {summary ? (
                  <div className="space-y-6">
                    {/* Summary Content */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <p className="text-sm leading-relaxed text-purple-100">
                        {summary}
                      </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-purple-200 mb-1">
                          Jumlah Kalimat
                        </p>
                        <p className="text-lg font-semibold">
                          {summary.split(".").filter((s) => s.trim()).length}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-purple-200 mb-1">Reduksi</p>
                        <p className="text-lg font-semibold text-green-400">
                          {reductionPercentage}%
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
                      >
                        {copied ? (
                          <>
                            <Check size={18} />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            Salin
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
                      >
                        <Download size={18} />
                        Unduh
                      </button>
                    </div>

                    {/* Tips */}
                    <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 p-4">
                      <p className="text-xs text-purple-100">
                        <strong>Tip:</strong> Untuk hasil lebih baik, pastikan
                        teks input sudah terstruktur dengan baik (dengan kalimat
                        yang jelas).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
                    <BookOpen
                      size={48}
                      className="mx-auto mb-3 text-purple-400/50"
                    />
                    <p className="text-sm text-purple-100/70">
                      Ringkasan akan muncul di sini
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Extractive Summary</h3>
                <p className="text-sm text-purple-100/70">
                  Memilih kalimat penting berdasarkan analisis keyword dan
                  konteks
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Instant & Free</h3>
                <p className="text-sm text-purple-100/70">
                  Hasil langsung tanpa API. Tidak ada data yang disimpan.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Customizable</h3>
                <p className="text-sm text-purple-100/70">
                  Atur panjang ringkasan sesuai kebutuhan (10-50%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
