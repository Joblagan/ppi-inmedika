"use client";

import { useState, useTransition } from "react";
import { createIcraBangunan } from "@/app/actions/icra";
import { Loader2, Plus, X, AlertTriangle, Building2 } from "lucide-react";

const PROJECT_GROUPS = [
  { value: "Tipe A", label: "Tipe A: Inspeksi, Non-Invasif (Pengecatan, Wallpaper)" },
  { value: "Tipe B", label: "Tipe B: Skala Kecil, Durasi Singkat (Pemotongan dinding/plafon kecil)" },
  { value: "Tipe C", label: "Tipe C: Pembongkaran / Renovasi Skala Sedang (Kabel, Pipa, Plester)" },
  { value: "Tipe D", label: "Tipe D: Konstruksi Mayor / Pembangunan Baru" }
];

const RISK_GROUPS = [
  { value: "Rendah", label: "Risiko Rendah (Area Perkantoran)" },
  { value: "Sedang", label: "Risiko Sedang (Poliklinik, Ruang Tunggu)" },
  { value: "Tinggi", label: "Risiko Tinggi (IGD, Radiologi, Farmasi)" },
  { value: "Sangat Tinggi", label: "Risiko Sangat Tinggi (ICU, OK, Isolasi, CSSD)" }
];

// Matrix according to CDC/Kemenkes for ICRA
function determineKelas(tipe: string, risiko: string): string {
  if (!tipe || !risiko) return "-";
  
  const matrix: Record<string, Record<string, string>> = {
    "Tipe A": { "Rendah": "I", "Sedang": "I", "Tinggi": "I", "Sangat Tinggi": "II" },
    "Tipe B": { "Rendah": "I", "Sedang": "II", "Tinggi": "II", "Sangat Tinggi": "III" },
    "Tipe C": { "Rendah": "I", "Sedang": "II", "Tinggi": "III", "Sangat Tinggi": "IV" },
    "Tipe D": { "Rendah": "II", "Sedang": "III", "Tinggi": "III", "Sangat Tinggi": "IV" }
  };
  return matrix[tipe]?.[risiko] || "-";
}

export function IcraBangunanForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [tipe, setTipe] = useState("");
  const [risiko, setRisiko] = useState("");
  
  const kelas = determineKelas(tipe, risiko);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("kelasKewaspadaan", kelas); // inject calculated class

    startTransition(async () => {
      const res = await createIcraBangunan(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setTipe("");
        setRisiko("");
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-emerald-900/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        Input ICRA Bangunan
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">ICRA Konstruksi Bangunan</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-bold tracking-wider uppercase mt-0.5">Asesmen Risiko Konstruksi</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi Proyek</label>
            <input 
              type="text" 
              name="description" 
              placeholder="Contoh: Renovasi plafon IGD..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
              required 
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tipe Proyek (Tipe A-D)</label>
              <select 
                name="projectGroup"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
                required
                disabled={isPending}
              >
                <option value="">— Pilih Tipe —</option>
                {PROJECT_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kelompok Risiko Pasien</label>
              <select 
                name="riskGroup"
                value={risiko}
                onChange={(e) => setRisiko(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
                required
                disabled={isPending}
              >
                <option value="">— Pilih Risiko —</option>
                {RISK_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hasil Matriks</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Kelas Kewaspadaan Pencegahan Infeksi</p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black text-xl shadow-sm ${
              kelas === "I" ? "bg-emerald-100 border-emerald-200 text-emerald-700" :
              kelas === "II" ? "bg-blue-100 border-blue-200 text-blue-700" :
              kelas === "III" ? "bg-orange-100 border-orange-200 text-orange-700" :
              kelas === "IV" ? "bg-red-100 border-red-200 text-red-700" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              {kelas}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Mulai</label>
              <input 
                type="date" 
                name="startDate" 
                defaultValue={today}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Selesai (Estimasi)</label>
              <input 
                type="date" 
                name="endDate" 
                defaultValue={today}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isPending || kelas === "-"}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-900/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan ICRA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
