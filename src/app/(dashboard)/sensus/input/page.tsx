import { TallyCounterForm } from "@/components/sensus/TallyCounter";
import { getSensusToday } from "@/app/actions/sensus";
import { getActiveParameters } from "@/app/actions/parameter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Info } from "lucide-react";

export const metadata = {
  title: "Input Sensus Harian | PPI/IPCN",
};

export default async function SensusInputPage() {
  const session = await getServerSession(authOptions);
  
  const [sensusData, parameters] = await Promise.all([
    getSensusToday(),
    getActiveParameters()
  ]);

  // Parse tanggal ke string format lokalisasi
  const today = new Date();
  const dateString = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Input Sensus Harian
        </h2>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Tanggal: <span className="text-emerald-600 dark:text-emerald-400">{dateString}</span>
          </p>
          <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Shift Tutup: <span className="text-red-500 dark:text-red-400 font-bold">23:59 (Cut-off)</span>
          </p>
        </div>
      </header>

      {/* Kotak Petunjuk Pengisian (Sudah Disempurnakan untuk Dark/Light Mode) */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-8 flex items-start gap-4 shadow-sm transition-colors">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0 border border-emerald-200 dark:border-emerald-800/50">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Petunjuk Pengisian</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Sensus diinput sebagai rekapitulasi final 1x24 jam per ruangan. Pastikan total pemakaian alat ukur (ventilator, kateter, dll) tidak melebihi <strong className="text-slate-700 dark:text-slate-200 font-bold">Hari Rawat Inap (Base Denominator)</strong>.
          </p>
        </div>
      </div>

      <TallyCounterForm initialData={sensusData} parameters={parameters} />
    </div>
  );
}