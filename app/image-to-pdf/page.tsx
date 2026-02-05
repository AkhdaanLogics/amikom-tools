"use client";

import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  GripVertical,
} from "lucide-react";
import Toast from "@/components/toast";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

export default function ImageToPDFPage() {
  return <ImageToPDFContent />;
}

function ImageToPDFContent() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
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

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        showToast(`${file.name} bukan file gambar`, "error");
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = () => {
          const newImage: ImageItem = {
            id: `img-${Date.now()}-${i}`,
            file: file,
            preview: event.target?.result as string,
            width: img.width,
            height: img.height,
          };
          setImages((prev) => [...prev, newImage]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    showToast(`${files.length} gambar ditambahkan`, "success");
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  // Reorder images
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = images.findIndex((img) => img.id === draggedId);
    const targetIndex = images.findIndex((img) => img.id === targetId);

    const newImages = [...images];
    const [movedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, movedImage);

    setImages(newImages);
    setDraggedId(null);
    showToast("Urutan gambar diubah", "info");
  };

  // Generate PDF
  const generatePDF = async () => {
    if (images.length === 0) {
      showToast("Tambahkan minimal 1 gambar", "error");
      return;
    }

    setProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        try {
          // Get image dimensions
          let imgWidth = image.width;
          let imgHeight = image.height;
          const aspectRatio = imgWidth / imgHeight;

          // PDF page sizes (in points, 72 points = 1 inch)
          const A4_WIDTH = 595;
          const A4_HEIGHT = 842;
          const LETTER_WIDTH = 612;
          const LETTER_HEIGHT = 792;

          let pageWidth = orientation === "portrait" ? A4_WIDTH : A4_HEIGHT;
          let pageHeight = orientation === "portrait" ? A4_HEIGHT : A4_WIDTH;

          // Scale image to fit page with padding
          const padding = 40;
          let maxWidth = pageWidth - padding * 2;
          let maxHeight = pageHeight - padding * 2;

          if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const widthScale = maxWidth / imgWidth;
            const heightScale = maxHeight / imgHeight;
            const scale = Math.min(widthScale, heightScale);
            imgWidth *= scale;
            imgHeight *= scale;
          }

          // Center image on page
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          // Read image file
          const imageArrayBuffer = await image.file.arrayBuffer();
          let embeddedImage;

          // Determine image type and embed accordingly
          if (image.file.type === "image/png") {
            embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
          } else if (
            image.file.type === "image/jpeg" ||
            image.file.type === "image/jpg"
          ) {
            embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
          } else {
            // Try JPEG for other formats
            embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
          }

          // Add page and draw image
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImage, {
            x: x,
            y: pageHeight - y - imgHeight,
            width: imgWidth,
            height: imgHeight,
          });
        } catch (error) {
          console.warn(`Error processing ${image.file.name}:`, error);
          showToast(`Error pada ${image.file.name}`, "error");
        }
      }

      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `images-to-pdf-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        `✅ PDF berhasil dibuat! (${images.length} halaman)`,
        "success",
      );
    } catch (error) {
      showToast("Gagal membuat PDF", "error");
      console.error(error);
    }

    setProcessing(false);
  };

  // Clear all images
  const clearAll = () => {
    setImages([]);
    showToast("Semua gambar dihapus", "info");
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
                <ImageIcon size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Image to PDF
            </h1>
            <p className="text-purple-200">
              Konversi gambar menjadi PDF dengan mudah, susun urutan sesuai
              keinginan
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Settings */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4">
                <h3 className="font-bold text-lg">Pengaturan</h3>

                {/* Orientation */}
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">
                    Orientasi Halaman
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrientation("portrait")}
                      className={`px-3 py-2 rounded-lg transition text-sm font-semibold ${
                        orientation === "portrait"
                          ? "bg-purple-600 text-white"
                          : "border border-white/20 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation("landscape")}
                      className={`px-3 py-2 rounded-lg transition text-sm font-semibold ${
                        orientation === "landscape"
                          ? "bg-purple-600 text-white"
                          : "border border-white/20 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm">
                    <p className="text-purple-200">Gambar yang ditambahkan</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {images.length}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold transition-all hover:bg-white/10"
                  >
                    <Upload size={16} />
                    Tambah Gambar
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {images.length > 0 && (
                    <>
                      <button
                        onClick={generatePDF}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Generate PDF
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearAll}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/50 px-4 py-2 font-semibold text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Images List */}
              <div className="lg:col-span-2">
                {images.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-purple-500/50 bg-white/5 p-12 text-center">
                    <ImageIcon
                      size={64}
                      className="mx-auto mb-4 text-purple-400/50"
                    />
                    <h2 className="mb-2 text-2xl font-bold">
                      Belum Ada Gambar
                    </h2>
                    <p className="mb-6 text-purple-200">
                      Upload gambar (JPG, PNG, WebP) untuk mulai
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
                    >
                      <Upload size={24} />
                      Pilih Gambar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg">Daftar Gambar</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          draggable
                          onDragStart={() => handleDragStart(image.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(image.id)}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 transition ${
                            draggedId === image.id
                              ? "opacity-50 border-yellow-400 bg-yellow-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          } cursor-grab active:cursor-grabbing`}
                        >
                          {/* Preview */}
                          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                            <img
                              src={image.preview}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {image.file.name}
                            </p>
                            <p className="text-xs text-purple-300">
                              {image.width} × {image.height}px
                            </p>
                          </div>

                          {/* Index */}
                          <div className="text-sm font-bold text-purple-400 w-8 text-center">
                            {index + 1}
                          </div>

                          {/* Drag handle & remove */}
                          <div className="shrink-0 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(image.id);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="p-2 text-purple-400 cursor-grab">
                              <GripVertical size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
