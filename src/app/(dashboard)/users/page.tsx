import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers, getRooms } from "@/app/actions/user";
import { UserForm } from "@/components/users/UserForm";
import { DeleteUserButton, ResetPasswordButton } from "@/components/users/UserActionButtons";
import { Users, Building2 } from "lucide-react";

export const metadata = {
  title: "Manajemen Pengguna | PPI/IPCN",
};

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  USER_RUANGAN: "Perawat Ruangan",
  VIEWER: "Viewer",
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/");

  const [users, rooms] = await Promise.all([getUsers(), getRooms()]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Manajemen Pengguna
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Kelola akun Perawat, IPCN, dan Admin secara terpusat.
          </p>
        </div>
        <UserForm rooms={rooms} />
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pengguna</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Username</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ruangan</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleName = roleLabel[user.role] ?? user.role;
                  
                  // Konfigurasi warna Badge sesuai Dark Mode
                  const roleBadgeClass = user.role === "SUPER_ADMIN" 
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50"
                    : user.role === "USER_RUANGAN"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm capitalize">
                              {user.name.toLowerCase()}
                            </div>
                            {session.user.id === user.id && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                — Akun Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {user.username}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/20 ${roleBadgeClass}`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {user.room ? (
                          <span className="flex items-center gap-1.5 capitalize">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {user.room.name.toLowerCase()}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <ResetPasswordButton userId={user.id} />
                          <DeleteUserButton userId={user.id} selfId={session.user.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}