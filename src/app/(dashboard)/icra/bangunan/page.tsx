import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IcraBangunanForm } from "@/components/icra/IcraBangunanForm";
import { DeleteIcraBangunanButton } from "@/components/icra/DeleteIcraBangunanButton";
import { Building2, Calendar, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "ICRA Bangunan | PPI",
};

export default async function IcraBangunanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const icraData = await prisma.icraBangunan.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            ICRA Bangunan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Infection Control Risk Assessment untuk Konstruksi dan Renovasi
          </p>
        </div>
        <IcraBangunanForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {icraData.map((icra) => (
          <div key={icra.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  icra.kelasKewaspadaan === "I" ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30" :
                  icra.kelasKewaspadaan === "II" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30" :
                  icra.kelasKewaspadaan === "III" ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30" :
                  "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30"
                }`}>
                  Kelas {icra.kelasKewaspadaan}
                </span>
              </div>
              <DeleteIcraBangunanButton id={icra.id} />
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{icra.description}</h3>
            
            <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <span className="font-medium">Tipe Proyek</span>
                <span className="font-bold">{icra.projectGroup}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <span className="font-medium">Kelompok Risiko</span>
                <span className="font-bold">{icra.riskGroup}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(icra.startDate).toLocaleDateString("id-ID")} - {new Date(icra.endDate).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>
        ))}

        {icraData.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Belum ada data ICRA Bangunan</p>
          </div>
        )}
      </div>
    </div>
  );
}
