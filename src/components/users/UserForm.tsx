"use client";

import { useState, useTransition } from "react";
import { createUser } from "@/app/actions/user";
import { Loader2, Plus, X, Eye, EyeOff } from "lucide-react";
import { Room } from "@prisma/client";

export function UserForm({ rooms }: { rooms: Room[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("USER_RUANGAN");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createUser(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setSelectedRole("USER_RUANGAN");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
      >
        <Plus className="w-5 h-5" />
        Tambah Pengguna
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Buat Akun Pengguna</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              placeholder="Cth: Siti Rahayu, S.Kep"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Cth: perawat_icu"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimal 6 karakter"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 pr-10 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Role / Hak Akses</label>
            <select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="USER_RUANGAN">Perawat (USER_RUANGAN)</option>
              <option value="VIEWER">Viewer / Manajer (VIEWER)</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {selectedRole === "USER_RUANGAN" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Ruangan yang Ditugaskan</label>
              <select
                name="roomId"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required={selectedRole === "USER_RUANGAN"}
              >
                <option value="">— Pilih Ruangan —</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
