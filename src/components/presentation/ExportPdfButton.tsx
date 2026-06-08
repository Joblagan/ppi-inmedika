"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export function ExportPdfButton({ targetId, monthLabel }: { targetId: string; monthLabel: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById(targetId);
      if (!element) {
        alert("Area laporan tidak ditemukan.");
        return;
      }

      // 1. Gulung ke atas untuk mencegah bug potongan
      window.scrollTo(0, 0);

      // 2. Paksa elemen menjadi ukuran Desktop agar rapi
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = "1200px";
      element.style.maxWidth = "1200px";

      // Beri jeda agar grafik Recharts menyesuaikan diri
      await new Promise((resolve) => setTimeout(resolve, 300));

      const fullWidth = element.scrollWidth;
      const fullHeight = element.scrollHeight;

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
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove("dark");
          clonedDoc.body.classList.remove("dark");
          
          const targetEl = clonedDoc.getElementById(targetId);
          if (targetEl) {
            targetEl.style.padding = "32px"; 
            targetEl.style.backgroundColor = "#ffffff";
          }
        }
      });

      // Kembalikan layar ke ukuran semula
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // 3. SETTING PDF: Kita pakai Portrait karena dashboard memanjang ke bawah
      const pdf = new jsPDF({
        orientation: "portrait", 
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Margin putih 1 cm di setiap sisi kertas

      // Hitung skala lebar gambar agar pas dengan lebar kertas A4
      const printWidth = pdfWidth - (margin * 2);
      const printHeight = (img.height * printWidth) / img.width;

      let heightLeft = printHeight;
      let position = margin;

      // 4. CETAK HALAMAN PERTAMA
      pdf.addImage(dataUrl, "PNG", margin, position, printWidth, printHeight);
      heightLeft -= (pdfHeight - margin); // Kurangi dengan tinggi yang sudah dicetak

      // 5. AUTO MULTI-PAGE: Jika gambar masih panjang, tambah halaman baru otomatis!
      while (heightLeft > 0) {
        position = position - pdfHeight; // Geser sisa gambar ke atas
        pdf.addPage(); // Tambah Halaman 2, 3, dst
        pdf.addImage(dataUrl, "PNG", margin, position, printWidth, printHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Laporan_PPI_IPCN_${monthLabel.replace(/\s+/g, "_")}.pdf`);
      
    } catch (error) {
      console.error("Gagal mencetak PDF:", error);
      alert("Terjadi kesalahan teknis saat mengekspor laporan.");
    } finally {
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