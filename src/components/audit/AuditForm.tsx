"use client";

import { useState, useTransition, useMemo } from "react";
import { createAudit } from "@/app/actions/audit";
import { Loader2, Plus, X, Minus, ShieldCheck, AlertTriangle } from "lucide-react";
import { Room } from "@prisma/client";

const BUNDLE_QUESTIONS: Record<string, string[]> = {
  BUNDLE_VAP: [
    "Posisi kepala tempat tidur (Elevasi 30-45 derajat)",
    "Pengkajian sedasi harian (Sedation vacation)",
    "Profilaksis Peptic Ulcer Disease (PUD)",
    "Profilaksis Deep Vein Thrombosis (DVT)",
    "Perawatan mulut (Oral hygiene) dengan Chlorhexidine"
  ],
  BUNDLE_ISK: [
    "Indikasi pemasangan kateter urine sesuai",
    "Pemasangan menggunakan teknik steril",
    "Perawatan kebersihan meatus setiap hari",
    "Posisi kantong urine lebih rendah dari kandung kemih (tidak menyentuh lantai)",
    "Evaluasi harian kebutuhan pelepasan kateter"
  ],
  BUNDLE_IAD: [
    "Kebersihan tangan sebelum tindakan",
    "Penggunaan APD maksimal (Topi, masker, gaun steril, sarung tangan steril, duk lebar)",
    "Preparasi kulit dengan Chlorhexidine",
    "Pemilihan lokasi insersi optimal (hindari vena femoralis jika memungkinkan)",
    "Evaluasi harian kebutuhan kateter sentral"
  ],
  BUNDLE_PLABSI: [
    "Kebersihan tangan sebelum pemasangan/perawatan",
    "Preparasi kulit yang tepat",
    "Dokumentasi tanggal pemasangan terlihat jelas",
    "Perawatan balutan rutin (bersih, kering, intak)",
    "Evaluasi harian untuk dilepas bila tidak diperlukan"
  ],
  APD: [
    "Topi / Penutup Kepala",
    "Masker",
    "Kacamata (Goggles) / Face Shield",
    "Gaun / Apron",
    "Sarung Tangan",
    "Sepatu / Pelindung Kaki"
  ]
};

const HAND_HYGIENE_MOMENTS = [
  "Momen 1: Sebelum menyentuh pasien",
  "Momen 2: Sebelum melakukan tindakan aseptik",
  "Momen 3: Setelah terkena cairan tubuh pasien",
  "Momen 4: Setelah menyentuh pasien",
  "Momen 5: Setelah menyentuh lingkungan sekitar pasien"
];

function TallyInput({ val, setVal, max }: { val: number, setVal: (v: number) => void, max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button 
        type="button" 
        onClick={() => setVal(Math.max(0, val - 1))} 
        disabled={val === 0}
        className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-black text-slate-800 dark:text-slate-100 w-6 text-center tabular-nums tracking-tight">
        {val}
      </span>
      <button 
        type="button" 
        onClick={() => {
          if (max !== undefined && val >= max) return;
          setVal(val + 1);
        }}
        disabled={max !== undefined && val >= max}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors border shadow-sm ${
          max !== undefined && val >= max
            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
            : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
        }`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export function AuditForm({ rooms, userRoomId }: { rooms: Room[]; userRoomId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [auditType, setAuditType] = useState<string>("HAND_HYGIENE");

  // State for Hand Hygiene 5 Moments (Peluang, Tindakan Benar)
  const [hhData, setHhData] = useState<{ peluang: number, benar: number }[]>(
    HAND_HYGIENE_MOMENTS.map(() => ({ peluang: 0, benar: 0 }))
  );

  // State for Checklists (Yes = 1, No = 0, NA = -1)
  const [checklistData, setChecklistData] = useState<Record<string, number>>({});

  const handleAuditTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAuditType(e.target.value);
    setChecklistData({});
    setHhData(HAND_HYGIENE_MOMENTS.map(() => ({ peluang: 0, benar: 0 })));
  };

  const handleChecklistChange = (index: number, val: number) => {
    setChecklistData(prev => ({ ...prev, [index]: val }));
  };

  const calculateTotals = () => {
    if (auditType === "HAND_HYGIENE") {
      let peluang = 0;
      let benar = 0;
      hhData.forEach(m => {
        peluang += m.peluang;
        benar += m.benar;
      });
      return { peluang, benar };
    } else {
      let peluang = 0;
      let benar = 0;
      const questions = BUNDLE_QUESTIONS[auditType] || [];
      questions.forEach((_, i) => {
        const val = checklistData[i];
        if (val === 1 || val === 0) { // Not NA
          peluang += 1;
          if (val === 1) benar += 1;
        }
      });
      return { peluang, benar };
    }
  };

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const { peluang, benar } = calculateTotals();
      
      formData.set("peluang", peluang.toString());
      formData.set("tindakanBenar", benar.toString());

      // Prepare details JSON
      let detailsPayload: any = null;
      if (auditType === "HAND_HYGIENE") {
        detailsPayload = HAND_HYGIENE_MOMENTS.map((label, i) => ({
          label,
          peluang: hhData[i].peluang,
          benar: hhData[i].benar
        }));
      } else {
        const questions = BUNDLE_QUESTIONS[auditType] || [];
        detailsPayload = questions.map((label, i) => ({
          label,
          answer: checklistData[i] === 1 ? "Ya" : checklistData[i] === 0 ? "Tidak" : "NA"
        }));
      }
      formData.set("details", JSON.stringify(detailsPayload));

      const res = await createAudit(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setChecklistData({});
        setHhData(HAND_HYGIENE_MOMENTS.map(() => ({ peluang: 0, benar: 0 })));
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const totals = calculateTotals();

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">Input Audit Kepatuhan (Standar Internasional)</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-bold tracking-wider uppercase mt-0.5">Checklist Bundle & 5 Momen Cuci Tangan</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
              <input 
                type="date" 
                name="date" 
                defaultValue={today} 
                max={today}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Audit</label>
              <select 
                name="auditType"
                value={auditType}
                onChange={handleAuditTypeChange}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none"
                disabled={isPending}
              >
                <option value="HAND_HYGIENE">Kebersihan Tangan (5 Momen)</option>
                <option value="APD">Kepatuhan APD</option>
                <option value="BUNDLE_VAP">Bundle VAP</option>
                <option value="BUNDLE_ISK">Bundle ISK</option>
                <option value="BUNDLE_IAD">Bundle IAD</option>
                <option value="BUNDLE_PLABSI">Bundle PLABSI</option>
              </select>
            </div>
            {!userRoomId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ruangan</label>
                <select 
                  name="roomId"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium appearance-none capitalize" 
                  required
                  disabled={isPending}
                >
                  <option value="">— Pilih Ruangan —</option>
                  {rooms.map((r) => <option key={r.id} value={r.id} className="capitalize">{r.name.toLowerCase()}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {auditType === "HAND_HYGIENE" ? "Observasi 5 Momen" : "Checklist Kepatuhan"}
              </h4>
              <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                Skor: {totals.peluang > 0 ? Math.round((totals.benar / totals.peluang) * 100) : 0}% ({totals.benar}/{totals.peluang})
              </div>
            </div>

            {auditType === "HAND_HYGIENE" ? (
              <div className="space-y-3">
                {HAND_HYGIENE_MOMENTS.map((moment, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{moment}</span>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1 text-center">Peluang</span>
                        <TallyInput 
                          val={hhData[i].peluang} 
                          setVal={(v) => {
                            const newData = [...hhData];
                            newData[i].peluang = v;
                            if (newData[i].benar > v) newData[i].benar = v;
                            setHhData(newData);
                          }} 
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-500 uppercase font-bold block mb-1 text-center">Patuh</span>
                        <TallyInput 
                          val={hhData[i].benar} 
                          setVal={(v) => {
                            const newData = [...hhData];
                            newData[i].benar = v;
                            setHhData(newData);
                          }} 
                          max={hhData[i].peluang}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(BUNDLE_QUESTIONS[auditType] || []).map((q, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{q}</span>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleChecklistChange(i, 1)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          checklistData[i] === 1 
                            ? "bg-emerald-500 text-white shadow-sm" 
                            : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistChange(i, 0)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          checklistData[i] === 0 
                            ? "bg-red-500 text-white shadow-sm" 
                            : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        Tidak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistChange(i, -1)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          checklistData[i] === -1 
                            ? "bg-slate-500 text-white shadow-sm" 
                            : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              disabled={isPending || (totals.peluang === 0 && auditType !== "HAND_HYGIENE")} // allow HH to submit 0 if needed, or prevent it
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