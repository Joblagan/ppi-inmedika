"use client";

import { useState, useTransition, useMemo } from "react";
import { saveSensusHarian } from "@/app/actions/sensus";
import { Minus, Plus, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { MasterParameter } from "@prisma/client";

type CounterProps = {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
};

function Counter({ label, value, onChange, max }: CounterProps) {
  const handleMinus = () => {
    if (value > 0) onChange(value - 1);
  };
  const handlePlus = () => {
    if (max === undefined || value < max) onChange(value + 1);
  };

  const isMaxReached = max !== undefined && value >= max;

  return (
    <div className="flex flex-col items-center p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center capitalize">
        {label.toLowerCase()}
      </span>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={handleMinus}
          disabled={value === 0}
          className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="w-16 flex justify-center items-center">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {value}
          </span>
        </div>
        <button
          type="button"
          onClick={handlePlus}
          disabled={isMaxReached}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
            isMaxReached 
              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed' 
              : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700/50'
          }`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {max !== undefined && (
        <div className="mt-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md">
          Maks: {max}
        </div>
      )}
    </div>
  );
}

export function TallyCounterForm({ initialData = [], parameters = [] }: { initialData?: { parameterId: string, value: number }[] | null, parameters: MasterParameter[] }) {
  // Pastikan initialData tidak pernah null
  const safeInitialData = initialData ?? [];
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Inisialisasi state dinamis
  const initialValues = useMemo(() => {
    const vals: Record<string, number> = {};
    parameters.forEach(p => {
      const found = safeInitialData.find(d => d.parameterId === p.id);
      vals[p.id] = found ? found.value : 0;
    });
    return vals;
  }, [safeInitialData, parameters]);

  const [values, setValues] = useState<Record<string, number>>(initialValues);

  // Cari Base Denominator value
  const baseDenominatorParam = parameters.find(p => p.isBaseDenominator);
  const baseDenominatorValue = baseDenominatorParam ? values[baseDenominatorParam.id] || 0 : undefined;

  const handleChange = (id: string, newVal: number) => {
    setValues(prev => ({ ...prev, [id]: newVal }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      // Map state object to array for server action
      const details = Object.entries(values).map(([id, val]) => ({
        parameterId: id,
        value: val
      }));

      const result = await saveSensusHarian(details);

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'success', text: "Data sensus hari ini berhasil disimpan!" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  if (parameters.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <p className="text-slate-800 dark:text-slate-200 font-bold">Belum ada Parameter Sensus yang aktif.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Hubungi Admin untuk mengonfigurasi Master Parameter.</p>
      </div>
    );
  }

  const tindakanParams = parameters.filter(p => p.kategori === 'TINDAKAN');
  const deviceParams = parameters.filter(p => p.kategori === 'DEVICE');

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {message && (
        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 shadow-sm border ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
            : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {tindakanParams.length > 0 && (
          <>
            <div className="col-span-full mb-1">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-3">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">1</span> 
                Tindakan & Pasien Total
              </h3>
            </div>
            {tindakanParams.map(p => (
              <Counter 
                key={p.id} 
                label={p.nama} 
                value={values[p.id]} 
                onChange={(val) => handleChange(p.id, val)} 
                // Tindakan tidak dibatasi oleh apapun
              />
            ))}
          </>
        )}

        {deviceParams.length > 0 && (
          <>
            <div className="col-span-full mt-6 mb-1">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-3">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">2</span> 
                Pemakaian Alat (Device Days)
              </h3>
              {baseDenominatorParam && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg inline-block border border-slate-100 dark:border-slate-800">
                  Angka pemakaian alat tidak bisa melebihi <strong className="text-slate-700 dark:text-slate-200 capitalize">{baseDenominatorParam.nama.toLowerCase()} ({baseDenominatorValue})</strong>.
                </p>
              )}
            </div>
            {deviceParams.map(p => (
              <Counter 
                key={p.id} 
                label={p.nama} 
                value={values[p.id]} 
                onChange={(val) => handleChange(p.id, val)} 
                max={baseDenominatorValue} // Validasi dinamis otomatis
              />
            ))}
          </>
        )}

      </div>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-center z-40">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full max-w-sm flex justify-center items-center py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-900/20 text-sm font-extrabold tracking-wide text-white bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Menyimpan Data...
            </>
          ) : (
            "Simpan Sensus Hari Ini"
          )}
        </button>
      </div>
    </div>
  );
}