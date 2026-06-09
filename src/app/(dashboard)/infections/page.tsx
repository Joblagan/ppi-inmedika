import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getInfections } from "@/app/actions/infection";
import { InfectionForm } from "@/components/infections/InfectionForm";
import { DeleteInfectionButton } from "@/components/infections/DeleteInfectionButton";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Kejadian Infeksi (HAIs) | PPI/IPCN",
};

const infectionLabels: Record<string, { label: string; cls: string }> = {
  VAP:       { label: "VAP",       cls: "bg-red-100 text-red-700" },
  IAD:       { label: "IAD",       cls: "bg-orange-100 text-orange-700" },
  ISK:       { label: "ISK",       cls: "bg-yellow-100 text-yellow-700" },
  PHLEBITIS: { label: "Phlebitis", cls: "bg-pink-100 text-pink-700" },
  HAP:       { label: "HAP",       cls: "bg-purple-100 text-purple-700" },
  IDO:       { label: "IDO",       cls: "bg-blue-100 text-blue-700" },
  DEKUBITUS: { label: "Dekubitus", cls: "bg-slate-100 text-slate-700" },
};

export default async function InfectionsPage({ searchParams }: { searchParams?: { month?: string; roomId?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const rooms = await prisma.room.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  const { month, roomId } = searchParams ?? {};
  const { incidents, totalIncidents, totalBaseDenominator, ratePer1000 } = await getInfections({ month, roomId });

  const now = month ? new Date(`${month}-01`) : new Date();
  const monthLabel = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Kejadian Infeksi (HAIs)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Laporan insiden bulan <span className="text-red-500 font-bold">{monthLabel}</span>
          </p>
        </div>
        <InfectionForm rooms={rooms} userRoomId={session.user.roomId} />
      </header>

      <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <form method="get" className="grid grid-cols-1 md:grid-cols-[220px_220px_auto] gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Bulan</label>
            <input
              type="month"
              name="month"
              defaultValue={searchParams?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-slate-800 dark:text-slate-100 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ruangan</label>
            <select
              name="roomId"
              defaultValue={roomId ?? ""}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-slate-800 dark:text-slate-100 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            >
              <option value="">Semua Ruangan</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="capitalize">{room.name.toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 font-semibold transition-all">
              Terapkan Filter
            </button>
            <a href="/infections" className="w-full md:w-auto text-center rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Reset
            </a>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Insiden</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalIncidents}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Denominator Dasar</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{totalBaseDenominator}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rate per 1000</p>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{ratePer1000}</p>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-16 flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Zero HAIs Bulan Ini! 🎉</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tidak ada insiden infeksi yang dilaporkan bulan ini.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tanggal</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pasien</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ruangan</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jenis HAIs</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Keterangan</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.map((inc) => {
                  const badge = infectionLabels[inc.infectionType] ?? { label: inc.infectionType, cls: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {new Date(inc.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm capitalize">{inc.patientName.toLowerCase()}</div>
                        <div className="text-[11px] text-slate-400 font-mono tracking-wider mt-0.5">{inc.patientMrn}</div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 capitalize">{inc.room.name.toLowerCase()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/20 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {inc.description || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <DeleteInfectionButton id={inc.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}