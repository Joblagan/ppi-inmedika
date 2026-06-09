"use client";

import { deleteUser, resetUserPassword, updateUser } from "@/app/actions/user";
import { useState, useTransition, FormEvent } from "react";
import { Trash2, KeyRound, Loader2, Pencil } from "lucide-react";

export function DeleteUserButton({ userId, selfId }: { userId: string; selfId: string }) {
  const [isPending, startTransition] = useTransition();

  if (userId === selfId) return null;

  return (
    <form action={() => {
      if (!confirm("Yakin ingin menonaktifkan akun ini?")) return;
      startTransition(async () => {
        await deleteUser(userId);
      });
    }}>
      <button
        type="submit"
        disabled={isPending}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Nonaktifkan Akun"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </form>
  );
}

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleReset() {
    const newPass = prompt("Masukkan password baru (minimal 6 karakter):");
    if (!newPass || newPass.length < 6) {
      alert("Password harus minimal 6 karakter.");
      return;
    }
    startTransition(async () => {
      const res = await resetUserPassword(userId, newPass);
      setResult(res.error ?? "Password berhasil direset!");
      setTimeout(() => setResult(null), 3000);
    });
  }

  return (
    <div className="flex items-center gap-1">
      {result && <span className="text-xs text-emerald-600 font-medium">{result}</span>}
      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
        title="Reset Password"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function EditUserButton({
  user,
  rooms,
}: {
  user: {
    id: string;
    name: string;
    role: string;
    roomId: string | null;
  };
  rooms: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [roomId, setRoomId] = useState(user.roomId ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("name", name.trim());
      formData.append("role", role);
      if (role === "USER_RUANGAN") {
        formData.append("roomId", roomId);
      }

      const res = await updateUser(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setResult("Perubahan tersimpan.");
        setIsOpen(false);
        setTimeout(() => setResult(null), 3000);
      }
    });
  };

  return (
    <>
      {result && <span className="text-xs text-emerald-600 font-medium">{result}</span>}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        title="Edit Pengguna"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Pengguna</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ubah nama, role, dan ruangan.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="USER_RUANGAN">Perawat Ruangan</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {role === "USER_RUANGAN" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Ruangan</label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20 outline-none transition-all"
                    required
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
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
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
