"use client";

import { useState, useTransition } from "react";
import { createAudit } from "@/app/actions/audit";
import { Loader2, Plus, X, Minus, ShieldCheck, AlertTriangle } from "lucide-react";
import { Room } from "@prisma/client";

function TallyInput({ name, label, max }: { name: string; label: string; max?: number }) {
  const [val, setVal] = useState(0);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input type="hidden" name={name} value={val} />
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          onClick={() => setVal(v => Math.max(0, v - 1))} 
          disabled={val === 0}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 w-10 text-center tabular-nums tracking-tight">
          {val}
        </span>
        <button 
          type="button" 
          onClick={() => setVal(v => max !== undefined ? Math.min(max, v + 1) : v + 1)}
          disabled={max !== undefined && val >= max}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border shadow-sm ${
            max !== undefined && val >= max
              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
              : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700/50'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
        {max !== undefined && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md">
            Maks: {max}
          </span>
        )}
      </div>
    </div>
  );
}

export function AuditForm({ rooms, userRoomId }: { rooms: Room[]; userRoomId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [peluang, setPeluang] = useState(0);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAudit(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setPeluang(0);
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
        Input Audit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Ukuran direduksi ke max-w-md agar lebih compact */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">Input Audit Kepatuhan</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-bold tracking-wider uppercase mt-0.5">Pencatatan Kebersihan Tangan & APD</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Spacing dipadatkan */}
        <form action={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
              <input 
                type="date" 
                name="date" 
                defaultValue={today} 
                max={today}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Audit</label>
              <select 
                name="auditType"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
                disabled={isPending}
              >
                <option value="HAND_HYGIENE">Kebersihan Tangan</option>
                <option value="APD">Pemakaian APD</option>
              </select>
            </div>
          </div>

          {!userRoomId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ruangan</label>
              <select 
                name="roomId"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none capitalize" 
                required
                disabled={isPending}
              >
                <option value="">— Pilih Ruangan —</option>
                {rooms.map((r) => <option key={r.id} value={r.id} className="capitalize">{r.name.toLowerCase()}</option>)}
              </select>
            </div>
          )}

          {/* Penghitung Angka Tally (Denominator & Numerator) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Jumlah Peluang (Denominator)</label>
              <input type="hidden" name="peluang" value={peluang} />
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setPeluang(v => Math.max(0, v - 1))} 
                  disabled={peluang === 0}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 w-10 text-center tabular-nums tracking-tight">
                  {peluang}
                </span>
                <button 
                  type="button" 
                  onClick={() => setPeluang(v => v + 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Numerator */}
            <TallyInput name="tindakanBenar" label="Tindakan Patuh (Numerator)" max={peluang} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan <span className="font-medium text-slate-400 dark:text-slate-500">(opsional)</span>
            </label>
            <textarea 
              name="notes" 
              rows={2} 
              placeholder="Temuan, hambatan, observasi..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium" 
              disabled={isPending}
            />
          </div>

          {/* Action Buttons */}
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
              disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-900/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Audit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}