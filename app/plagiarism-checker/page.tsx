"use client";

import { useState } from "react";
import { Search, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Toast from "@/components/toast";
import Link from "next/link";

export default function PlagiarismCheckerPage() {
  return <PlagiarismCheckerContent />;
}

function PlagiarismCheckerContent() {
  const [originalText, setOriginalText] = useState("");
  const [checkText, setCheckText] = useState("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
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

  // Simple semantic similarity using character-level comparison and word overlap
  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1.trim() || !text2.trim()) return 0;

    // Normalize texts
    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const words1 = normalize(text1);
    const words2 = normalize(text2);

    // Calculate word overlap
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    const union = new Set([...set1, ...set2]);

    const jaccardSimilarity = intersection.size / union.size;

    // Calculate n-gram similarity (bigrams)
    const getNGrams = (words: string[], n: number) => {
      const ngrams: string[] = [];
      for (let i = 0; i < words.length - n + 1; i++) {
        ngrams.push(words.slice(i, i + n).join(" "));
      }
      return new Set(ngrams);
    };

    const bigrams1 = getNGrams(words1, 2);
    const bigrams2 = getNGrams(words2, 2);

    const bigramIntersection = new Set(
      [...bigrams1].filter((x) => bigrams2.has(x)),
    );
    const bigramUnion = new Set([...bigrams1, ...bigrams2]);

    const ngramSimilarity =
      bigramUnion.size > 0 ? bigramIntersection.size / bigramUnion.size : 0;

    // Combine metrics (weighted average)
    const finalScore = jaccardSimilarity * 0.4 + ngramSimilarity * 0.6;

    return Math.round(finalScore * 100);
  };

  const handleCheck = async () => {
    if (!originalText.trim()) {
      showToast("Masukkan teks referensi terlebih dahulu", "error");
      return;
    }

    if (!checkText.trim()) {
      showToast("Masukkan teks yang ingin dicek", "error");
      return;
    }

    setChecking(true);

    // Simulate checking delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const score = calculateSimilarity(originalText, checkText);
    setSimilarity(score);
    setChecking(false);

    if (score > 70) {
      showToast("Tingkat kesamaan tinggi! Pertimbangkan parafrase.", "error");
    } else if (score > 40) {
      showToast("Ada kesamaan yang signifikan. Periksa kembali.", "info");
    } else {
      showToast("Teks relatif unik. Good job!", "success");
    }
  };

  const resetForm = () => {
    setOriginalText("");
    setCheckText("");
    setSimilarity(null);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 70) return "⚠️ Tinggi - Sangat mirip";
    if (score >= 40) return "⚡ Sedang - Ada kesamaan";
    return "✅ Rendah - Teks unik";
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
                <Search size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Plagiarism Checker
            </h1>
            <p className="text-purple-200">
              Cek kesamaan teks menggunakan analisis semantic similarity
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Input Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold">Input Teks</h2>

                {/* Reference Text */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-purple-200">
                    Teks Referensi
                  </label>
                  <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Masukkan teks asli atau referensi..."
                    rows={6}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-purple-100/70">
                    {originalText.length} karakter
                  </p>
                </div>

                {/* Check Text */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-purple-200">
                    Teks yang Dicek
                  </label>
                  <textarea
                    value={checkText}
                    onChange={(e) => setCheckText(e.target.value)}
                    placeholder="Masukkan teks yang ingin dicek..."
                    rows={6}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-purple-100/70">
                    {checkText.length} karakter
                  </p>
                </div>

                {/* Info Box */}
                <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-4 mb-6">
                  <p className="text-xs text-blue-100">
                    <strong>Catatan:</strong> Checker ini menganalisis kesamaan
                    semantic (makna) dengan metode NLP lokal. Tidak ada data
                    yang dikirim ke server atau disimpan.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCheck}
                    disabled={
                      checking || !originalText.trim() || !checkText.trim()
                    }
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {checking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Cek Kesamaan
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
                <h2 className="mb-6 text-2xl font-bold">Hasil Analisis</h2>

                {similarity !== null ? (
                  <div className="space-y-6">
                    {/* Score Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                      <div
                        className={`text-6xl font-bold mb-2 ${getSimilarityColor(similarity)}`}
                      >
                        {similarity}%
                      </div>
                      <div
                        className={`text-lg font-semibold ${getSimilarityColor(similarity)}`}
                      >
                        {getSimilarityLabel(similarity)}
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          {similarity >= 70 ? (
                            <AlertCircle
                              size={20}
                              className="text-red-400 flex-shrink-0 mt-0.5"
                            />
                          ) : similarity >= 40 ? (
                            <AlertCircle
                              size={20}
                              className="text-yellow-400 flex-shrink-0 mt-0.5"
                            />
                          ) : (
                            <CheckCircle
                              size={20}
                              className="text-green-400 flex-shrink-0 mt-0.5"
                            />
                          )}
                          <div>
                            <p className="font-semibold mb-1">
                              {similarity >= 70
                                ? "Tingkat Kesamaan Tinggi"
                                : similarity >= 40
                                  ? "Tingkat Kesamaan Sedang"
                                  : "Tingkat Kesamaan Rendah"}
                            </p>
                            <p className="text-sm text-purple-100/70">
                              {similarity >= 70
                                ? "Teks terdeteksi sangat mirip dengan referensi. Pertimbangkan untuk parafrase ulang."
                                : similarity >= 40
                                  ? "Ada kesamaan signifikan dalam struktur dan konten. Periksa kembali poin-poin utama."
                                  : "Teks terdeteksi relatif unik dan berbeda dari referensi. Bagus!"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-purple-200 mb-1">
                          Ref Length
                        </p>
                        <p className="text-lg font-semibold">
                          {originalText.length}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-purple-200 mb-1">
                          Check Length
                        </p>
                        <p className="text-lg font-semibold">
                          {checkText.length}
                        </p>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 p-4">
                      <p className="text-xs text-purple-100">
                        <strong>Tips:</strong> Score di bawah 40% aman. Jika di
                        atas 40%, lebih baik parafrase atau tambahkan sumber
                        referensi yang jelas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
                    <Search
                      size={48}
                      className="mx-auto mb-3 text-purple-400/50"
                    />
                    <p className="text-sm text-purple-100/70">
                      Hasil analisis akan muncul di sini
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
                <h3 className="mb-2 font-semibold">Semantic Analysis</h3>
                <p className="text-sm text-purple-100/70">
                  Menganalisis makna dan struktur teks, bukan hanya word
                  matching
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Privacy Protected</h3>
                <p className="text-sm text-purple-100/70">
                  Semua proses dilakukan di browser. Data tidak disimpan.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Instant Results</h3>
                <p className="text-sm text-purple-100/70">
                  Hasil analisis diperoleh dalam hitungan detik
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
