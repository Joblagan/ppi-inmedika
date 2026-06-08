"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export function ExportPdfButton({ targetId, monthLabel }: { targetId: string; monthLabel: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    const element = document.getElementById(targetId);
    if (!element) {
      alert("Area laporan tidak ditemukan.");
      setIsExporting(false);
      return;
    }

    // 1. SIMPAN STATE AWAL DOM (WAJIB untuk clean-up)
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalPadding = element.style.padding;
    const originalBg = element.style.backgroundColor;
    const isHtmlDark = document.documentElement.classList.contains("dark");
    const isBodyDark = document.body.classList.contains("dark");

    try {
      // Gulung ke atas untuk mencegah bug potongan (blank nodes di html-to-image)
      window.scrollTo(0, 0);

      // 2. TEMPORARY DOM MUTATION (Pengganti onclone)
      // Matikan dark mode sementara
      if (isHtmlDark) document.documentElement.classList.remove("dark");
      if (isBodyDark) document.body.classList.remove("dark");

      // Paksa elemen menjadi ukuran Desktop & sesuaikan padding untuk PDF
      element.style.width = "1200px";
      element.style.maxWidth = "1200px";
      element.style.padding = "32px";
      element.style.backgroundColor = "#ffffff";

      // Beri jeda agar grafik Recharts menyesuaikan diri dengan lebar baru & CSS selesai repaint
      await new Promise((resolve) => setTimeout(resolve, 300));

      const fullWidth = element.scrollWidth;
      const fullHeight = element.scrollHeight;

      // 3. GENERATE IMAGE
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        style: {
          width: `${fullWidth}px`,
          height: `${fullHeight}px`,
          margin: '0',
        },
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node.classList && node.classList.contains("no-print")) return false;
          return true;
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // 4. SETTING PDF: Portrait
      const pdf = new jsPDF({
        orientation: "portrait", 
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 1 cm

      const printWidth = pdfWidth - (margin * 2);
      const printHeight = (img.height * printWidth) / img.width;

      let heightLeft = printHeight;
      let position = margin;

      // 5. CETAK HALAMAN PERTAMA & AUTO MULTI-PAGE
      pdf.addImage(dataUrl, "PNG", margin, position, printWidth, printHeight);
      heightLeft -= (pdfHeight - margin);

      while (heightLeft > 0) {
        position = position - pdfHeight; 
        pdf.addPage(); 
        pdf.addImage(dataUrl, "PNG", margin, position, printWidth, printHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Laporan_PPI_IPCN_${monthLabel.replace(/\s+/g, "_")}.pdf`);
      
    } catch (error) {
      console.error("Gagal mencetak PDF:", error);
      alert("Terjadi kesalahan teknis saat mengekspor laporan.");
    } finally {
      // 6. SAFE RESTORATION (Mencegah Technical Debt & UI Crash)
      // Apapun yang terjadi (berhasil atau error), kembalikan UI ke kondisi semula
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.padding = originalPadding;
      element.style.backgroundColor = originalBg;

      if (isHtmlDark) document.documentElement.classList.add("dark");
      if (isBodyDark) document.body.classList.add("dark");

      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
      title="Download PDF untuk Rapat Komite"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Menyiapkan PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export Laporan PDF
        </>
      )}
    </button>
  );
}