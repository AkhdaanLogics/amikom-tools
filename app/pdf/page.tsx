"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  Trash2,
  GripVertical,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Toast from "@/components/toast";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface PDFFile {
  id: string;
  file: File;
  name: string;
}

export default function PDFMergerPage() {
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

  return <PDFMergerContent />;
}

function PDFMergerContent() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "application/pdf") {
        const id = Math.random().toString(36).substr(2, 9);
        setPdfs((prev) => [...prev, { id, file, name: file.name }]);
      }
    }
  };

  const handleRemove = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = pdfs.findIndex((p) => p.id === draggedId);
    const targetIndex = pdfs.findIndex((p) => p.id === targetId);

    const newPdfs = [...pdfs];
    const [draggedItem] = newPdfs.splice(draggedIndex, 1);
    newPdfs.splice(targetIndex, 0, draggedItem);

    setPdfs(newPdfs);
    setDraggedId(null);
  };
  const handleMerge = async () => {
    if (pdfs.length < 2) {
      showToast("Pilih minimal 2 file PDF", "error");
      return;
    }

    setMerging(true);

    try {
      // Create FormData dengan semua PDF files
      const formData = new FormData();
      pdfs.forEach((pdf) => {
        formData.append("pdfs", pdf.file);
      });

      const response = await fetch("/api/merge-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal merge PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Gagal merge PDF. Coba lagi!", "error");
    } finally {
      setMerging(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">PDF Merger</h1>
          <p className="text-purple-200">
            Gabung multiple PDF dengan mudah. Atur urutan sesuai keinginan mu.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-400/50 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 transition mb-8 bg-white/5"
        >
          <Upload size={32} className="mx-auto mb-3 text-purple-300" />
          <p className="text-lg font-semibold mb-2">
            Click atau Drag PDF di sini
          </p>
          <p className="text-sm text-purple-200">
            Pilih 2 atau lebih file PDF untuk di-merge
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* PDF List */}
        {pdfs.length > 0 && (
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                File Selected: {pdfs.length}
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
              >
                <Plus size={16} />
                Tambah File
              </button>
            </div>

            {pdfs.map((pdf, index) => (
              <div
                key={pdf.id}
                draggable
                onDragStart={() => handleDragStart(pdf.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(pdf.id)}
                className={`flex items-center gap-4 p-4 bg-white/10 rounded-lg cursor-move hover:bg-white/15 transition ${
                  draggedId === pdf.id ? "opacity-50" : ""
                }`}
              >
                <GripVertical
                  size={20}
                  className="text-purple-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold bg-purple-500/30 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <p className="truncate">{pdf.name}</p>
                  </div>
                  <p className="text-xs text-purple-300">
                    {(pdf.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(pdf.id)}
                  className="text-red-400 hover:text-red-300 flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Merge Button */}
        {pdfs.length > 0 && (
          <button
            onClick={handleMerge}
            disabled={merging || pdfs.length < 2}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-lg font-semibold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Download size={18} />
            {merging ? "Sedang Merge..." : "Merge PDF"}
          </button>
        )}
      </div>

      {/* Toast Notification */}
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
