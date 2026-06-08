import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ParameterForm } from "@/components/master/ParameterForm";
import { DeleteParameterButton } from "@/components/master/DeleteParameterButton";
import { toggleParameterStatus } from "@/app/actions/parameter";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Master Parameter Sensus | PPI/IPCN",
};

export default async function MasterParameterPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const parameters = await prisma.masterParameter.findMany({
    where: { deletedAt: null },
    orderBy: [
      { kategori: 'desc' },
      { nama: 'asc' }
    ]
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Master Parameter Sensus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Kelola parameter pengukuran alat (Device) dan tindakan secara dinamis.
          </p>
        </div>
        <ParameterForm />
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Parameter</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kategori</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parameters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada data parameter.
                  </td>
                </tr>
              ) : (
                parameters.map((param) => (
                  <tr key={param.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3">
                      {/* Teks dimanipulasi secara visual agar cantik dan rapi (Capitalize) */}
                      <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm capitalize">
                        {param.nama.toLowerCase()}
                      </div>
                      {param.isBaseDenominator && (
                        <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-800/50">
                          Base Denominator
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/20 ${
                        param.kategori === 'DEVICE' 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' 
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50'
                      }`}>
                        {param.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <form action={async () => {
                        "use server";
                        await toggleParameterStatus(param.id, param.isAktif);
                      }}>
                        <button 
                          type="submit"
                          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all border ${
                            param.isAktif 
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {param.isAktif ? "AKTIF" : "NONAKTIF"}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <DeleteParameterButton id={param.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}