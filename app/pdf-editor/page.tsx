"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Upload,
  Trash2,
  GripVertical,
  Download,
  Pen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Toast from "@/components/toast";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface PDFPageData {
  id: string;
  pageNum: number;
  width: number;
  height: number;
}

interface DrawingElement {
  id: string;
  type: "signature" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
  pageNum: number;
}

export default function PDFEditorPage() {
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

  return <PDFEditorContent />;
}

function PDFEditorContent() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pages, setPages] = useState<PDFPageData[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState(0);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const elementContainerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  // Load PDF.js only on client-side
  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      // Use local worker file from public folder instead of CDN
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setPdfjsLib(pdfjs);
    };
    loadPdfJs();
  }, []);

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle PDF upload
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Hanya file PDF yang diterima", "error");
      return;
    }

    setPdfFile(file);
    await loadPDFPages(file);
  };

  // Load PDF pages
  const loadPDFPages = async (file: File) => {
    if (!pdfjsLib) {
      showToast("PDF library belum siap", "error");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setPdfDocument(pdf);
      const pageList: PDFPageData[] = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1 });

        pageList.push({
          id: `page-${i}`,
          pageNum: i,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(pageList);
      setCurrentPageNum(0);
      setElements([]);
      showToast(`PDF berhasil dimuat (${pdf.numPages} halaman)`, "success");

      // Render first page after DOM update
      setTimeout(() => {
        console.log("Attempting to render first page");
        renderPage(pdf, 0);
      }, 200);
    } catch (error) {
      showToast("Gagal membaca PDF", "error");
      console.error(error);
    }
  };

  // Render PDF page
  const renderPage = async (pdf: any, pageNum: number) => {
    if (!previewCanvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum + 1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = previewCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      console.log(`Page ${pageNum + 1} rendered successfully`);
    } catch (error) {
      console.error("Error rendering page:", error);
      showToast("Gagal merender halaman PDF", "error");
    }
  };

  // Update preview when page changes
  useEffect(() => {
    console.log(
      "useEffect triggered - pdfDocument:",
      !!pdfDocument,
      "currentPageNum:",
      currentPageNum,
    );
    if (pdfDocument) {
      console.log("Rendering page from useEffect");
      renderPage(pdfDocument, currentPageNum);
    }
  }, [currentPageNum, pdfDocument]);

  // Draw signature on canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Initialize signature canvas with white background
  useEffect(() => {
    if (showSignaturePad && signatureCanvasRef.current) {
      clearSignature();
    }
  }, [showSignaturePad]);

  // Add signature to PDF
  const addSignatureToPDF = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    console.log("Signature data URL length:", imageData.length);

    const newElement: DrawingElement = {
      id: `element-${Date.now()}`,
      type: "signature",
      x: 50,
      y: 50,
      width: 150,
      height: 75,
      data: imageData,
      pageNum: currentPageNum,
    };

    setElements([...elements, newElement]);
    console.log("Added signature element:", newElement);
    clearSignature();
    setShowSignaturePad(false);
    showToast("Tanda tangan ditambahkan", "success");
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Hanya file gambar yang diterima", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      const newElement: DrawingElement = {
        id: `element-${Date.now()}`,
        type: "image",
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        data: imageData,
        pageNum: currentPageNum,
      };

      setElements([...elements, newElement]);
      showToast("Gambar ditambahkan", "success");
    };

    reader.readAsDataURL(file);
  };

  // Handle element drag
  const handleElementDragStart = (elementId: string) => {
    setDraggingElement(elementId);
    setSelectedElement(elementId);
  };

  const handleElementDragMove = (e: React.MouseEvent) => {
    if (
      !draggingElement ||
      !elementContainerRef.current ||
      !previewCanvasRef.current
    )
      return;

    const container = elementContainerRef.current;
    const canvas = previewCanvasRef.current;
    const rect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate position relative to canvas display size
    const displayX = e.clientX - canvasRect.left;
    const displayY = e.clientY - canvasRect.top;

    // Convert from display coordinates to canvas logical coordinates
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const logicalX = displayX * scaleX;
    const logicalY = displayY * scaleY;

    setElements(
      elements.map((el) =>
        el.id === draggingElement
          ? {
              ...el,
              x: Math.max(
                0,
                Math.min(canvas.width - el.width, logicalX - el.width / 2),
              ),
              y: Math.max(
                0,
                Math.min(canvas.height - el.height, logicalY - el.height / 2),
              ),
            }
          : el,
      ),
    );
  };

  const handleElementDragEnd = () => {
    setDraggingElement(null);
  };

  // Resize element
  const resizeElement = (
    elementId: string,
    newWidth: number,
    newHeight: number,
  ) => {
    setElements(
      elements.map((el) =>
        el.id === elementId
          ? {
              ...el,
              width: Math.max(50, newWidth),
              height: Math.max(50, newHeight),
            }
          : el,
      ),
    );
  };

  // Remove element
  const removeElement = (elementId: string) => {
    setElements(elements.filter((e) => e.id !== elementId));
    setSelectedElement(null);
  };

  // Delete page
  const deletePage = (pageNum: number) => {
    if (pages.length === 1) {
      showToast("Minimal harus ada 1 halaman", "error");
      return;
    }

    // Filter out the deleted page, don't change pageNum
    const newPages = pages.filter((p) => p.pageNum !== pageNum);

    setPages(newPages);
    setCurrentPageNum(Math.max(0, currentPageNum - 1));
    setElements(elements.filter((e) => e.pageNum !== pageNum));
    showToast("Halaman dihapus", "success");
  };

  // Reorder pages
  const handleDragStart = (id: string) => {
    console.log("Drag start:", id);
    setDraggedPageId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    console.log("Drag end");
    setDraggedPageId(null);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedPageId || draggedPageId === targetId) {
      setDraggedPageId(null);
      return;
    }

    console.log("Drop:", draggedPageId, "onto", targetId);

    const draggedIndex = pages.findIndex((p) => p.id === draggedPageId);
    const targetIndex = pages.findIndex((p) => p.id === targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      console.error("Invalid indices:", draggedIndex, targetIndex);
      setDraggedPageId(null);
      return;
    }

    const newPages = [...pages];
    const [movedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);

    // IMPORTANT: Don't change pageNum! It's the original PDF page index.
    // Just reorder the array. pageNum must stay the same.
    console.log(
      "New page order (pageNum):",
      newPages.map((p) => p.pageNum),
    );

    setPages(newPages);
    setDraggedPageId(null);
    showToast("Urutan halaman diubah", "info");
  };

  // Generate edited PDF
  const generateEditedPDF = async () => {
    if (!pdfFile) {
      showToast("Muat PDF terlebih dahulu", "error");
      return;
    }

    setProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Create new PDF with reordered pages
      const newPdfDoc = await PDFDocument.create();

      // Copy pages in new order
      const originalPageCount = pdfDoc.getPageCount();
      console.log("Original PDF pages:", originalPageCount);
      console.log("Current pages state:", pages);

      // Get all page indices in display order
      const pageIndices = pages.map((p) => p.pageNum);

      // Copy pages using copyPages (not embedPage)
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);

      copiedPages.forEach((page) => {
        newPdfDoc.addPage(page);
      });

      console.log("Elements to add:", elements);

      // Add elements to pages
      for (const element of elements) {
        // Find which display position the element's original page is now at
        const newPageIndex = pages.findIndex(
          (p) => p.pageNum === element.pageNum,
        );

        if (newPageIndex < 0) {
          console.warn("Element page not found:", element);
          continue;
        }

        const page = newPdfDoc.getPage(newPageIndex);
        console.log(`Adding element to page ${newPageIndex}:`, element);

        if (element.type === "signature" || element.type === "image") {
          const response = await fetch(element.data);
          const imageBytes = await response.arrayBuffer();

          let embeddedImage;
          if (element.data.includes("png")) {
            embeddedImage = await newPdfDoc.embedPng(imageBytes);
          } else {
            embeddedImage = await newPdfDoc.embedJpg(imageBytes);
          }

          // Convert from preview canvas coordinates (scale 1.5) to PDF coordinates (scale 1.0)
          const scale = 1.5;
          const pdfX = element.x / scale;
          const pdfY = element.y / scale;
          const pdfWidth = element.width / scale;
          const pdfHeight = element.height / scale;

          console.log(
            `Converting coords - Canvas: (${element.x}, ${element.y}, ${element.width}x${element.height}) -> PDF: (${pdfX}, ${pdfY}, ${pdfWidth}x${pdfHeight})`,
          );

          page.drawImage(embeddedImage, {
            x: pdfX,
            y: page.getHeight() - pdfY - pdfHeight,
            width: pdfWidth,
            height: pdfHeight,
          });
        }
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `edited-${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("PDF berhasil diunduh", "success");
    } catch (error) {
      showToast("Gagal menghasilkan PDF", "error");
      console.error(error);
    }

    setProcessing(false);
  };

  const currentPageElements = elements.filter(
    (e) => e.pageNum === currentPageNum,
  );

  // Helper function to convert canvas logical coords to display coords
  const getDisplayCoords = (
    logicalX: number,
    logicalY: number,
    logicalW: number,
    logicalH: number,
  ) => {
    if (!previewCanvasRef.current)
      return { x: logicalX, y: logicalY, w: logicalW, h: logicalH };

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return {
      x: logicalX * scaleX,
      y: logicalY * scaleY,
      w: logicalW * scaleX,
      h: logicalH * scaleY,
    };
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
                <FileText size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">PDF Editor</h1>
            <p className="text-purple-200">
              Edit PDF: tambah tanda tangan, gambar, atur ulang halaman
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
                  Pilih file PDF untuk mulai mengedit
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!pdfjsLib}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!pdfjsLib ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Loading PDF Library...
                    </>
                  ) : (
                    <>
                      <Upload size={24} />
                      Pilih PDF
                    </>
                  )}
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
            // Editor Section
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-4">
                {/* Pages Panel */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                  <h3 className="mb-4 font-bold text-lg">Halaman</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        draggable={true}
                        onDragStart={(e) => {
                          console.log("onDragStart triggered for", page.id);
                          e.dataTransfer.effectAllowed = "move";
                          handleDragStart(page.id);
                        }}
                        onDragOver={(e) => {
                          console.log("onDragOver triggered");
                          handleDragOver(e);
                        }}
                        onDragEnd={(e) => {
                          console.log("onDragEnd triggered");
                          handleDragEnd();
                        }}
                        onDrop={(e) => {
                          console.log("onDrop triggered for", page.id);
                          e.preventDefault();
                          e.stopPropagation();
                          handleDrop(page.id);
                        }}
                        onClick={() => setCurrentPageNum(page.pageNum)}
                        className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-grab active:cursor-grabbing transition ${
                          draggedPageId === page.id
                            ? "opacity-50 border-yellow-400 bg-yellow-500/20"
                            : currentPageNum === page.pageNum
                              ? "border-purple-500 bg-purple-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <GripVertical
                          size={18}
                          className="text-purple-200 shrink-0"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold">
                            Hal {page.pageNum + 1}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.pageNum);
                          }}
                          className="text-red-400 hover:text-red-300 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Preview */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                    <h3 className="mb-4 font-bold text-lg">Preview & Edit</h3>
                    <div
                      ref={elementContainerRef}
                      className="relative bg-gray-100 rounded-lg overflow-auto inline-block w-full"
                      onMouseMove={
                        draggingElement ? handleElementDragMove : undefined
                      }
                      onMouseUp={handleElementDragEnd}
                      onMouseLeave={handleElementDragEnd}
                      style={{ maxHeight: "600px" }}
                    >
                      <canvas
                        ref={previewCanvasRef}
                        className="w-full h-auto block mx-auto"
                      />

                      {/* Elements Overlay */}
                      {currentPageElements.map((element) => {
                        const displayCoords = getDisplayCoords(
                          element.x,
                          element.y,
                          element.width,
                          element.height,
                        );
                        return (
                          <div
                            key={element.id}
                            onMouseDown={() =>
                              handleElementDragStart(element.id)
                            }
                            className={`absolute cursor-move transition border-2 ${
                              selectedElement === element.id
                                ? "border-purple-400 ring-2 ring-purple-400"
                                : "border-yellow-400"
                            }`}
                            style={{
                              left: `${displayCoords.x}px`,
                              top: `${displayCoords.y}px`,
                              width: `${displayCoords.w}px`,
                              height: `${displayCoords.h}px`,
                            }}
                          >
                            <img
                              src={element.data}
                              alt="element"
                              className="w-full h-full object-contain pointer-events-none"
                            />

                            {/* Resize Handle */}
                            {selectedElement === element.id && (
                              <div
                                className="absolute bottom-0 right-0 w-4 h-4 bg-purple-500 cursor-se-resize"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const startX = e.clientX;
                                  const startY = e.clientY;
                                  const startWidth = element.width;
                                  const startHeight = element.height;

                                  const handleMouseMove = (
                                    moveEvent: MouseEvent,
                                  ) => {
                                    if (!previewCanvasRef.current) return;

                                    const canvas = previewCanvasRef.current;
                                    const rect = canvas.getBoundingClientRect();
                                    const scaleX = canvas.width / rect.width;
                                    const scaleY = canvas.height / rect.height;

                                    const deltaW =
                                      (moveEvent.clientX - startX) * scaleX;
                                    const deltaH =
                                      (moveEvent.clientY - startY) * scaleY;

                                    resizeElement(
                                      element.id,
                                      startWidth + deltaW,
                                      startHeight + deltaH,
                                    );
                                  };

                                  const handleMouseUp = () => {
                                    document.removeEventListener(
                                      "mousemove",
                                      handleMouseMove,
                                    );
                                    document.removeEventListener(
                                      "mouseup",
                                      handleMouseUp,
                                    );
                                  };

                                  document.addEventListener(
                                    "mousemove",
                                    handleMouseMove,
                                  );
                                  document.addEventListener(
                                    "mouseup",
                                    handleMouseUp,
                                  );
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-purple-200">
                      💡 Drag untuk pindah, klik select, resize di corner kanan
                      bawah
                    </p>
                  </div>

                  {/* Tools */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowSignaturePad(!showSignaturePad)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-semibold transition-all hover:bg-white/10"
                    >
                      <Pen size={18} />
                      Tanda Tangan
                    </button>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-semibold transition-all hover:bg-white/10"
                    >
                      <Upload size={18} />
                      Gambar
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => setPdfFile(null)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-semibold transition-all hover:bg-white/10"
                    >
                      <Upload size={18} />
                      PDF Baru
                    </button>
                    <button
                      onClick={generateEditedPDF}
                      disabled={processing}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* Signature Pad */}
                  {showSignaturePad && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                      <h3 className="mb-4 font-bold text-lg">
                        Draw Tanda Tangan
                      </h3>
                      <canvas
                        ref={signatureCanvasRef}
                        width={500}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full border-2 border-white/20 rounded-lg bg-white cursor-crosshair mb-4"
                        style={{ touchAction: "none" }}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={addSignatureToPDF}
                          className="flex-1 rounded-xl bg-purple-600 px-4 py-2 font-semibold transition-all hover:scale-105"
                        >
                          Tambahkan ke PDF
                        </button>
                        <button
                          onClick={clearSignature}
                          className="flex-1 rounded-xl border border-white/20 px-4 py-2 font-semibold transition-all hover:bg-white/10"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Elements List */}
                  {currentPageElements.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                      <h3 className="mb-4 font-bold text-lg">
                        Elemen di Halaman
                      </h3>
                      <div className="space-y-2">
                        {currentPageElements.map((element) => (
                          <div
                            key={element.id}
                            onClick={() => setSelectedElement(element.id)}
                            className={`flex items-center justify-between rounded-lg border-2 p-3 cursor-pointer transition ${
                              selectedElement === element.id
                                ? "border-purple-500 bg-purple-500/20"
                                : "border-white/10 bg-white/5"
                            }`}
                          >
                            <span className="text-sm capitalize">
                              {element.type} - Ukuran {element.width}x
                              {element.height}px
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(element.id);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
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
