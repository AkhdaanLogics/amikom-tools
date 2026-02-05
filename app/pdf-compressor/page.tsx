"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Upload, Download, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Toast from "@/components/toast";
import Link from "next/link";
import { PDFDocument, PDFName } from "pdf-lib";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  ratio: number;
}

export default function PDFCompressorPage() {
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

  return <PDFCompressorContent />;
}

function PDFCompressorContent() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Handle PDF upload
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Hanya file PDF yang diterima", "error");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast("File terlalu besar (max 100MB)", "error");
      return;
    }

    setPdfFile(file);
    setResult(null);
    setCompressedBlob(null);
    showToast(`PDF siap dikompres: ${formatFileSize(file.size)}`, "info");
  };

  // Compress PDF
  const compressPDF = async () => {
    if (!pdfFile) {
      showToast("Pilih PDF terlebih dahulu", "error");
      return;
    }

    setProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get compression level based on quality slider (0-100)
      // Higher quality = less compression, lower quality = more compression
      const compressionQuality = quality / 100; // 0-1

      // Compress images in the PDF
      const pages = pdfDoc.getPages();
      let imageCount = 0;

      for (const page of pages) {
        const pageDict = page.node;
        const resources = pageDict.lookup(PDFName.of("Resources"));

        if (!resources) continue;

        const resourcesDict = resources as any;
        const xObjects = resourcesDict.lookup?.(PDFName.of("XObject"));
        if (!xObjects) continue;

        const xObjectsDict = (xObjects as any).asDict?.();
        if (!xObjectsDict) continue;

        const xObjectsList = xObjectsDict.entries();

        for (const [key, value] of xObjectsList) {
          const xObject = value.asStream();
          if (!xObject) continue;

          const subtype = xObject.lookup(PDFName.of("Subtype"));
          const subtypeName = subtype?.asName?.().name;

          if (subtypeName === "Image") {
            imageCount++;

            try {
              // Try to reduce image resolution/quality
              const width = xObject.lookup(PDFName.of("Width"));
              const height = xObject.lookup(PDFName.of("Height"));
              const colorSpace = xObject.lookup(PDFName.of("ColorSpace"));

              // Reduce image dimensions if quality is low
              if (compressionQuality < 0.5) {
                const scaleFactor = compressionQuality + 0.5; // 0.5-1.0
                const newWidth = Math.max(
                  100,
                  (width?.asNumber() || 800) * scaleFactor,
                );
                const newHeight = Math.max(
                  100,
                  (height?.asNumber() || 600) * scaleFactor,
                );

                // Update dimensions
                xObject.set(PDFName.of("Width"), newWidth);
                xObject.set(PDFName.of("Height"), newHeight);
              }

              // Reduce compression for medium/low quality
              if (compressionQuality < 0.7) {
                const filter = xObject.lookup(PDFName.of("Filter"));
                if (filter?.asName?.().name === "FlateDecode") {
                  // Keep FlateDecode but reduce color depth for low quality
                  if (compressionQuality < 0.4) {
                    xObject.set(PDFName.of("BitsPerComponent"), 4); // Reduced from 8
                  }
                }
              }
            } catch (e) {
              console.warn("Could not compress image:", e);
            }
          }
        }
      }

      console.log(`Processed ${imageCount} images`);

      // Remove unused objects to reduce file size
      pdfDoc.flush();

      // Save compressed PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      setCompressedBlob(blob);

      const ratio = ((1 - blob.size / pdfFile.size) * 100).toFixed(2);
      setResult({
        originalSize: pdfFile.size,
        compressedSize: blob.size,
        ratio: parseFloat(ratio),
      });

      showToast(
        `✅ Berhasil! Kompresi ${ratio}% - ${formatFileSize(blob.size)}`,
        "success",
      );
    } catch (error) {
      showToast("Gagal mengkompresi PDF", "error");
      console.error(error);
    }

    setProcessing(false);
  };

  // Download compressed PDF
  const downloadCompressed = () => {
    if (!compressedBlob || !pdfFile) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(compressedBlob);
    link.download = `compressed-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset form
  const reset = () => {
    setPdfFile(null);
    setResult(null);
    setCompressedBlob(null);
    setQuality(50);
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
                <Zap size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              PDF Compressor
            </h1>
            <p className="text-purple-200">
              Kompresi PDF tanpa mengurangi kualitas terlalu banyak
            </p>
          </div>

          {!pdfFile ? (
            // Upload Section
            <div className="mx-auto max-w-2xl">
              <div className="rounded-2xl border-2 border-dashed border-purple-500/50 bg-white/5 p-12 text-center">
                <FileText
                  size={64}
                  className="mx-auto mb-4 text-purple-400/50"
                />
                <h2 className="mb-2 text-2xl font-bold">Upload PDF</h2>
                <p className="mb-6 text-purple-200">
                  Pilih file PDF untuk dikompres (max 100MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
                >
                  <Upload size={24} />
                  Pilih PDF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            // Compression Section
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-8">
                {/* File Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">File PDF</h3>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {pdfFile.name}
                        </p>
                        <p className="text-sm text-purple-200">
                          {formatFileSize(pdfFile.size)}
                        </p>
                      </div>
                      <FileText size={32} className="text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Compression Quality Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Kualitas Kompresi</h3>
                    <span className="text-2xl font-bold text-purple-400">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="grid grid-cols-3 gap-2 text-xs text-purple-200">
                    <div>🟢 Tinggi (10-30%)</div>
                    <div>🟡 Sedang (40-60%)</div>
                    <div>🔴 Rendah (70-100%)</div>
                  </div>
                  <p className="text-sm text-purple-300">
                    {quality <= 30
                      ? "Kompresi maksimal, ukuran file kecil tapi kualitas berkurang"
                      : quality <= 60
                        ? "Kompresi sedang, keseimbangan ukuran & kualitas"
                        : "Kompresi minimal, kualitas terjaga tapi ukuran lebih besar"}
                  </p>
                </div>

                {/* Result */}
                {result && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Hasil Kompresi</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-purple-300 mb-1">Original</p>
                        <p className="text-lg font-bold text-white">
                          {formatFileSize(result.originalSize)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-purple-300 mb-1">
                          Compressed
                        </p>
                        <p className="text-lg font-bold text-green-400">
                          {formatFileSize(result.compressedSize)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-purple-300 mb-1">Hemat</p>
                        <p className="text-lg font-bold text-purple-400">
                          {result.ratio}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-semibold transition-all hover:bg-white/10"
                  >
                    <Upload size={18} />
                    PDF Baru
                  </button>
                  {!result ? (
                    <button
                      onClick={compressPDF}
                      disabled={processing}
                      className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Kompressing...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Kompresi
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={downloadCompressed}
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold transition-all hover:scale-105"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
