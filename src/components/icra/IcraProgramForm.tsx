"use client";

import { useState, useTransition } from "react";
import { createIcraProgram } from "@/app/actions/icra";
import { Loader2, Plus, X, AlertTriangle, ShieldAlert } from "lucide-react";

export function IcraProgramForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [probabilitas, setProbabilitas] = useState(0);
  const [dampak, setDampak] = useState(0);
  const [sistem, setSistem] = useState(0);

  const skorPrioritas = probabilitas * dampak * sistem;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createIcraProgram(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setProbabilitas(0);
        setDampak(0);
        setSistem(0);
      }
    });
  }

  const currentYear = new Date().getFullYear();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-emerald-900/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        Input ICRA Program
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">ICRA Program</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-bold tracking-wider uppercase mt-0.5">Asesmen Risiko Tahunan</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tahun</label>
              <input 
                type="number" 
                name="tahun" 
                defaultValue={currentYear}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Risiko</label>
              <input 
                type="text" 
                name="jenisRisiko" 
                placeholder="Contoh: Kejadian VAP"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-center font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Probabilitas (1-4)</label>
              <select 
                name="probabilitas"
                value={probabilitas}
                onChange={(e) => setProbabilitas(Number(e.target.value))}
                className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                required
                disabled={isPending}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-center font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Dampak (1-5)</label>
              <select 
                name="dampak"
                value={dampak}
                onChange={(e) => setDampak(Number(e.target.value))}
                className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                required
                disabled={isPending}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-center font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Sistem (1-5)</label>
              <select 
                name="sistemYangAda"
                value={sistem}
                onChange={(e) => setSistem(Number(e.target.value))}
                className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                required
                disabled={isPending}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Skor Prioritas Risiko (RPN)</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{skorPrioritas}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tujuan Khusus</label>
              <textarea 
                name="tujuan" 
                rows={2}
                placeholder="Menurunkan angka VAP"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium resize-none" 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Strategi</label>
              <textarea 
                name="strategi" 
                rows={2}
                placeholder="Audit kepatuhan bundle mingguan"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium resize-none" 
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
              disabled={isPending || skorPrioritas === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-900/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
