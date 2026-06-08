"use client";

import { deleteUser, resetUserPassword } from "@/app/actions/user";
import { useState, useTransition } from "react";
import { Trash2, KeyRound, Loader2 } from "lucide-react";

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
