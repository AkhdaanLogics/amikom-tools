import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("pdfs") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "Minimal 2 file PDF dibutuhkan" },
        { status: 400 },
      );
    }

    // Verify all files are PDF
    for (const file of files) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Semua file harus PDF" },
          { status: 400 },
        );
      }
    }

    // Create new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfDoc = await PDFDocument.load(buffer);

      // Copy all pages dari PDF ini ke merged document
      const pageIndices = pdfDoc.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    // Save merged PDF
    const mergedBuffer = await mergedPdf.save();

    return new NextResponse(mergedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json({ error: "Gagal merge PDF" }, { status: 500 });
  }
}
