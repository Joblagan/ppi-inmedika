"use client";

import { useState, useTransition } from "react";
import { createInfection } from "@/app/actions/infection";
import { Loader2, Plus, X, AlertTriangle } from "lucide-react";
import { Room } from "@prisma/client";

const INFECTION_TYPES = [
  { value: "VAP", label: "VAP — Ventilator-Associated Pneumonia" },
  { value: "IAD", label: "IAD — Infeksi Aliran Darah (CVC)" },
  { value: "ISK", label: "ISK — Infeksi Saluran Kemih (Kateter)" },
  { value: "PHLEBITIS", label: "Phlebitis — Infeksi Kateter Perifer" },
  { value: "HAP", label: "HAP — Hospital-Acquired Pneumonia" },
  { value: "IDO", label: "IDO — Infeksi Daerah Operasi" },
  { value: "DEKUBITUS", label: "Dekubitus — Luka Tekan" },
];

export function InfectionForm({ rooms, userRoomId }: { rooms: Room[]; userRoomId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createInfection(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-red-900/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        Laporkan Insiden
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Ukuran direduksi ke max-w-md agar lebih compact */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header Modal - Padding dikurangi jadi px-5 py-4 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-red-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-800 dark:text-red-400 tracking-tight">Laporan Insiden Infeksi</h3>
              <p className="text-[10px] text-red-600 dark:text-red-500/80 font-bold tracking-wider uppercase mt-0.5">Isi data pasien teridentifikasi HAIs</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Spacing dipadatkan ke space-y-4 */}
        <form action={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Kejadian</label>
              <input
                type="date"
                name="date"
                defaultValue={today}
                max={today}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium"
                required
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">No. Rekam Medis</label>
              <input
                type="text"
                name="patientMrn"
                placeholder="Cth: 00123456"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Pasien</label>
            <input
              type="text"
              name="patientName"
              placeholder="Nama lengkap pasien"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Infeksi (HAIs)</label>
            <select
              name="infectionType"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
              required
              disabled={isPending}
            >
              <option value="">— Pilih Jenis Infeksi —</option>
              {INFECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {!userRoomId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ruangan</label>
              <select
                name="roomId"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none capitalize"
                required
                disabled={isPending}
              >
                <option value="">— Pilih Ruangan —</option>
                {rooms.map((r) => <option key={r.id} value={r.id} className="capitalize">{r.name.toLowerCase()}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Keterangan Tambahan <span className="font-medium text-slate-400 dark:text-slate-500">(opsional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Detail klinis, faktor risiko..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-600/10 focus:border-red-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              disabled={isPending}
            />
          </div>

          {/* Action Buttons - Ketinggian ditekan menjadi py-2.5 */}
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-red-900/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Melaporkan..." : "Laporkan Insiden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}