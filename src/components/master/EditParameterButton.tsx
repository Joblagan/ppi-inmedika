"use client";

import { useState, useTransition, FormEvent } from "react";
import { updateParameter } from "@/app/actions/parameter";
import { Loader2, Pencil, X } from "lucide-react";
import { MasterParameter } from "@prisma/client";

export function EditParameterButton({ parameter }: { parameter: MasterParameter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(parameter.nama);
  const [category, setCategory] = useState(parameter.kategori);
  const [isBaseDenominator, setIsBaseDenominator] = useState(parameter.isBaseDenominator);
  const [targetKepatuhan, setTargetKepatuhan] = useState<string>(parameter.targetKepatuhan?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", parameter.id);
      formData.append("nama", name.trim());
      formData.append("kategori", category);
      if (isBaseDenominator) {
        formData.append("isBaseDenominator", "true");
      }
      if (targetKepatuhan !== "") {
        formData.append("targetKepatuhan", targetKepatuhan);
      }

      const res = await updateParameter(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        title="Edit Parameter"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Parameter</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Perbarui nama, kategori, dan target kepatuhan.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nama Parameter</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "DEVICE" | "TINDAKAN")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all text-slate-800 dark:text-slate-100"
                >
                  <option value="DEVICE">DEVICE</option>
                  <option value="TINDAKAN">TINDAKAN</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id={`base-${parameter.id}`}
                  type="checkbox"
                  checked={isBaseDenominator}
                  onChange={(e) => setIsBaseDenominator(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor={`base-${parameter.id}`} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Base Denominator
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Target Kepatuhan (%)</label>
                <input
                  type="number"
                  value={targetKepatuhan}
                  onChange={(e) => setTargetKepatuhan(e.target.value)}
                  min={0}
                  max={100}
                  placeholder="Cth: 85"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
