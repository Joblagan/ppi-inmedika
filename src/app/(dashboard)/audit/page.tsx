import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAudits } from "@/app/actions/audit";
import { AuditForm } from "@/components/audit/AuditForm";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Audit Kepatuhan | PPI/IPCN",
};

export default async function AuditPage(props: { searchParams?: Promise<{ month?: string; roomId?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const searchParams = await props.searchParams;

  const rooms = await prisma.room.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  const { month, roomId } = searchParams ?? {};
  const { audits, totalPeluang, totalBenar, kepatuhanRate } = await getAudits({ month, roomId });

  const now = month ? new Date(`${month}-01`) : new Date();
  const monthLabel = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Audit Kepatuhan
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Kebersihan Tangan & APD — <span className="text-emerald-600 dark:text-emerald-400 font-bold">{monthLabel}</span>
          </p>
        </div>
        <AuditForm rooms={rooms} userRoomId={session.user.roomId} />
      </header>

      <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <form method="get" className="grid grid-cols-1 md:grid-cols-[220px_220px_auto] gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Bulan</label>
            <input
              type="month"
              name="month"
              defaultValue={searchParams?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-slate-800 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ruangan</label>
            <select
              name="roomId"
              defaultValue={roomId ?? ""}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-slate-800 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">Semua Ruangan</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="capitalize">{room.name.toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3 font-semibold transition-all">
              Terapkan Filter
            </button>
            <a href="/audit" className="w-full md:w-auto text-center rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Peluang</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalPeluang}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tindakan Patuh</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalBenar}</p>
        </div>
        <div className={`rounded-xl border shadow-sm p-5 transition-colors ${
          kepatuhanRate >= 85 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
        }`}>
          <p className={`text-sm font-semibold uppercase tracking-wider ${
            kepatuhanRate >= 85 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            Tingkat Kepatuhan
          </p>
          <p className={`text-3xl font-black mt-1 ${
            kepatuhanRate >= 85 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {kepatuhanRate}%
          </p>
          <p className={`text-xs font-bold mt-1.5 ${
            kepatuhanRate >= 85 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500 dark:text-red-500'
          }`}>
            {kepatuhanRate >= 85 ? "✓ MEMENUHI TARGET ≥85%" : "⚠️ DI BAWAH TARGET 85%"}
          </p>
        </div>
      </div>

      {/* Table */}
      {audits.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-16 flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Belum ada data audit bulan ini</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Klik "Input Audit" untuk mulai mencatat.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tanggal</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ruangan</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jenis Audit</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Peluang</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Patuh</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Rate</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {audits.map((audit) => {
                  const rate = audit.peluang > 0 ? Math.round((audit.tindakanBenar / audit.peluang) * 100) : 0;
                  return (
                    <tr key={audit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {new Date(audit.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 capitalize">
                        {audit.room.name.toLowerCase()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/20 ${
                          audit.auditType === "HAND_HYGIENE" 
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50" 
                            : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50"
                        }`}>
                          {audit.auditType === "HAND_HYGIENE" ? "Kebersihan Tangan" : "APD"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-mono text-slate-600 dark:text-slate-300">
                        {audit.peluang}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {audit.tindakanBenar}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${rate >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {audit.notes || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
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