"use client";

import { useState, useTransition } from "react";
import { createParameter } from "@/app/actions/parameter";
import { Loader2, Plus, X, AlertTriangle } from "lucide-react";

export function ParameterForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createParameter(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-emerald-900/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        Tambah Parameter
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Tambah Parameter Baru
            </h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            {/* Input Nama Parameter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Nama Parameter
              </label>
              <input 
                type="text" 
                name="nama" 
                placeholder="Cth: Ventilator / Kateter Urine" 
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                required
                disabled={isPending}
              />
            </div>

            {/* Input Kategori */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Kategori
              </label>
              <select 
                name="kategori"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
                disabled={isPending}
              >
                <option value="DEVICE">DEVICE (Pemakaian Alat Terikat Pasien)</option>
                <option value="TINDAKAN">TINDAKAN (Bebas / Base Denominator)</option>
              </select>
            </div>

            {/* Checkbox Base Denominator (Sudah Support Dark Mode & Hover Effect) */}
            <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all group">
              <input 
                type="checkbox" 
                name="isBaseDenominator" 
                value="true" 
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 disabled:opacity-50" 
                disabled={isPending}
              />
              <div>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Jadikan Base Denominator?
                </span>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Centang ini KHUSUS untuk <strong className="text-slate-700 dark:text-slate-200">Total Pasien</strong> agar angka pemakaian alat (Device) tidak bisa melebihi angka ini.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-xl shadow-sm shadow-emerald-900/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Parameter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}