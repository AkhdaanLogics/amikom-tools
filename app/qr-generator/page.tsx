"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import Toast from "@/components/toast";

export default function QRGeneratorPage() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (text.trim()) {
      generateQR();
    }
  }, [text, size, errorLevel]);

  const generateQR = async () => {
    if (!text.trim()) {
      setQrDataUrl("");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      showToast("Gagal membuat QR code", "error");
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) {
      showToast("Masukkan teks terlebih dahulu", "error");
      return;
    }

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    showToast("QR Code berhasil diunduh", "success");
  };

  const copyImage = async () => {
    if (!qrDataUrl) {
      showToast("Masukkan teks terlebih dahulu", "error");
      return;
    }

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      showToast("QR Code disalin ke clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying image:", error);
      showToast("Gagal menyalin gambar", "error");
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_55%)]" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-purple-600/20 p-4">
              <QrCode size={48} className="text-purple-400" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Generator QR Code
          </h1>
          <p className="text-purple-200">
            Buat QR code untuk link, teks, atau data apapun secara gratis
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold">Input</h2>

            {/* Text Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-purple-200">
                Teks / URL / Data
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan link, teks, atau data apapun..."
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Size */}
            <div className="mb-6">
              <label className="mb-2 flex items-center justify-between text-sm font-semibold text-purple-200">
                <span>Ukuran QR Code</span>
                <span className="text-white">{size}px</span>
              </label>
              <input
                type="range"
                min="200"
                max="600"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Error Correction Level */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-purple-200">
                Tingkat Koreksi Error
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "L", label: "L (7%)" },
                  { value: "M", label: "M (15%)" },
                  { value: "Q", label: "Q (25%)" },
                  { value: "H", label: "H (30%)" },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() =>
                      setErrorLevel(level.value as "L" | "M" | "Q" | "H")
                    }
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                      errorLevel === level.value
                        ? "bg-purple-600 text-white"
                        : "border border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-purple-200/70">
                Semakin tinggi, semakin tahan terhadap kerusakan
              </p>
            </div>

            {/* Examples */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-sm font-semibold text-purple-200">
                Contoh penggunaan:
              </p>
              <ul className="space-y-1 text-xs text-purple-100/70">
                <li>• URL: https://example.com</li>
                <li>• Email: mailto:user@example.com</li>
                <li>• WhatsApp: https://wa.me/628123456789</li>
                <li>• Teks: Informasi apapun</li>
              </ul>
            </div>
          </div>

          {/* Result Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold">Hasil QR Code</h2>

            {/* QR Code Display */}
            <div className="mb-6">
              {qrDataUrl ? (
                <div className="flex justify-center rounded-xl border border-white/10 bg-white p-8">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="max-w-full"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
                  <div className="text-center">
                    <QrCode size={48} className="mx-auto mb-3 text-purple-400/50" />
                    <p className="text-sm text-purple-100/70">
                      QR code akan muncul di sini
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={copyImage}
                disabled={!qrDataUrl}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>

            {/* Info */}
            <div className="mt-6 rounded-xl border border-purple-400/20 bg-purple-400/10 p-4">
              <p className="text-xs text-purple-100">
                <strong>Tips:</strong> QR code dapat dibaca oleh aplikasi kamera
                smartphone atau aplikasi QR scanner. Pastikan ukuran cukup besar
                agar mudah di-scan.
              </p>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h3 className="mb-2 font-semibold">100% Gratis</h3>
              <p className="text-sm text-purple-100/70">
                Tidak ada batasan penggunaan atau watermark
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h3 className="mb-2 font-semibold">Resolusi Tinggi</h3>
              <p className="text-sm text-purple-100/70">
                QR code dalam kualitas terbaik untuk cetak
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h3 className="mb-2 font-semibold">Privasi Aman</h3>
              <p className="text-sm text-purple-100/70">
                Semua proses dilakukan di browser Anda
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
