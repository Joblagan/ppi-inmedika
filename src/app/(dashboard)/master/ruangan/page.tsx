import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoomForm, RoomActionButtons } from "@/components/master/RoomForm";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Master Data Ruangan | PPI/IPCN",
};

export default async function MasterRuanganPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const rooms = await prisma.room.findMany({
    orderBy: [
      { deletedAt: 'asc' }, // Aktif di atas, nonaktif di bawah
      { name: 'asc' }
    ]
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          Master Data Ruangan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola daftar ruangan secara dinamis. Data ini akan digunakan sebagai dropdown untuk akun Perawat Ruangan dan formulir Sensus.
        </p>
      </header>

      <RoomForm />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Ruangan</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada data ruangan.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${room.deletedAt ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      {/* Teks dimanipulasi secara visual: bold dicabut, dipaksa huruf kecil lalu dikapitalisasi huruf pertamanya */}
                      <span className="text-slate-600 dark:text-slate-300 text-sm capitalize">
                        {room.name.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {room.deletedAt ? (
                        <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[10px] font-bold tracking-wider">
                          TIDAK AKTIF
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded text-[10px] font-bold tracking-wider">
                          AKTIF
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 flex justify-end">
                      <RoomActionButtons room={room} />
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