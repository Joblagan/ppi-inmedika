import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HelpCircle, BookOpen, User, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Buku Panduan | PPI",
};

export default async function PanduanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-7 h-7" />
          </div>
          Buku Panduan Penggunaan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Panduan lengkap sistem Surveilans Pencegahan dan Pengendalian Infeksi (PPI).
        </p>
      </div>

      <div className="space-y-6">
        {/* Panduan Staf Ruangan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300">Bagian 1: Panduan Perawat Ruangan (Staf)</h2>
          </div>
          <div className="p-6 space-y-6 text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">A. Input Sensus Harian</h3>
              <p className="mb-2 text-sm">Sensus adalah kegiatan wajib <strong>setiap hari</strong> untuk mencatat jumlah pasien dan penggunaan alat medis.</p>
              <ul className="list-decimal pl-5 text-sm space-y-1">
                <li>Klik menu <strong>Sensus Harian</strong> di sidebar.</li>
                <li>Pilih Tanggal dan Ruangan Anda.</li>
                <li>Masukkan angka pemakaian alat (misal: jumlah pasien dengan Ventilator, Kateter Urine, dll).</li>
                <li>Klik <strong>Simpan</strong>.</li>
              </ul>
            </div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">B. Laporan Kejadian Infeksi (HAIs)</h3>
              <p className="mb-2 text-sm">Gunakan jika ada pasien yang dicurigai terkena infeksi akibat perawatan (misal: ISK, VAP, IDO).</p>
              <ul className="list-decimal pl-5 text-sm space-y-1">
                <li>Klik menu <strong>Laporan Infeksi</strong>.</li>
                <li>Klik tombol <strong>Tambah Infeksi Baru</strong>.</li>
                <li>Isi tanggal, inisial pasien/No RM, Ruangan, dan Jenis Infeksi.</li>
                <li>Klik <strong>Simpan</strong>. Laporan otomatis masuk ke Dashboard IPCN.</li>
              </ul>
            </div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">C. Audit Kepatuhan</h3>
              <ul className="list-decimal pl-5 text-sm space-y-1">
                <li>Klik menu <strong>Audit Kepatuhan</strong> &gt; <strong>Tambah Audit</strong>.</li>
                <li>Pilih jenis audit: <strong>5 Momen Cuci Tangan</strong> atau <strong>Checklist Bundle</strong>.</li>
                <li>Centang Ya, Tidak, atau N/A pada setiap elemen. Sistem akan otomatis menghitung kepatuhan (%).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Panduan IPCN / Admin */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Bagian 2: Panduan IPCN & Komite Mutu (SUPER ADMIN)</h2>
          </div>
          <div className="p-6 space-y-6 text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">A. Persiapan Awal (Master Data)</h3>
              <ul className="list-decimal pl-5 text-sm space-y-1">
                <li><strong>Master Ruangan:</strong> Daftarkan semua nama bangsal/ruangan.</li>
                <li><strong>Master Parameter:</strong> Tentukan item apa saja yang wajib dihitung perawat saat sensus.</li>
                <li><strong>Manajemen User:</strong> Buat akun untuk staf dan berikan Role <code>USER_RUANGAN</code>.</li>
              </ul>
            </div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">B. Analisis Data & Outbreak (Kurva Epidemiologi)</h3>
              <ul className="list-decimal pl-5 text-sm space-y-1">
                <li>Buka menu <strong>Kurva Epidemiologi</strong> untuk melihat Control Chart bulanan.</li>
                <li>Garis putus-putus merah adalah <strong>Upper Control Limit (UCL)</strong>.</li>
                <li>🚨 Jika insiden melewati batas merah, sistem memunculkan alarm peringatan wabah (Outbreak).</li>
              </ul>
            </div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">C. Manajemen Risiko (ICRA)</h3>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li><strong>ICRA Bangunan:</strong> Hitung otomatis Kelas Kewaspadaan (I, II, III, IV) untuk proyek renovasi berdasarkan matriks Tipe Proyek vs Risiko Pasien.</li>
                <li><strong>ICRA Program:</strong> Hitung Skor Prioritas (RPN) tahunan dengan memasukkan nilai Probabilitas, Dampak, dan Sistem yang ada.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            <strong>Catatan Keamanan:</strong> Jangan takut salah memasukkan atau menghapus data. Sistem ini dilengkapi dengan <strong>Audit Trail</strong> yang merekam setiap aktivitas modifikasi data di latar belakang.
          </p>
        </div>
      </div>
    </div>
  );
}
