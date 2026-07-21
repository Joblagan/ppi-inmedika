import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IcraProgramForm } from "@/components/icra/IcraProgramForm";
import { DeleteIcraProgramButton } from "@/components/icra/DeleteIcraProgramButton";
import { ShieldAlert, TrendingUp } from "lucide-react";

export const metadata = {
  title: "ICRA Program | PPI",
};

export default async function IcraProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const icraData = await prisma.icraProgram.findMany({
    where: { deletedAt: null },
    orderBy: [{ tahun: "desc" }, { skorPrioritas: "desc" }],
    include: { createdBy: { select: { name: true } } }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            ICRA Program Tahunan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Prioritas Risiko dan Strategi Pencegahan Infeksi
          </p>
        </div>
        <IcraProgramForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {icraData.map((icra) => (
          <div key={icra.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Tahun {icra.tahun}
              </span>
              <DeleteIcraProgramButton id={icra.id} />
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{icra.jenisRisiko}</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prob.</span>
                <span className="font-black text-slate-700 dark:text-slate-300">{icra.probabilitas}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dampak</span>
                <span className="font-black text-slate-700 dark:text-slate-300">{icra.dampak}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sistem</span>
                <span className="font-black text-slate-700 dark:text-slate-300">{icra.sistemYangAda}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mb-4">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Skor Prioritas (RPN)</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-500">{icra.skorPrioritas}</span>
            </div>

            <div className="flex-1 space-y-3 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tujuan</span>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{icra.tujuan || "-"}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Strategi</span>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{icra.strategi || "-"}</p>
              </div>
            </div>
          </div>
        ))}

        {icraData.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Belum ada data ICRA Program</p>
          </div>
        )}
      </div>
    </div>
  );
}
