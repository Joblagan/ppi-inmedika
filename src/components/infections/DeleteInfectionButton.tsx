"use client";

import { deleteInfection } from "@/app/actions/infection";
import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteInfectionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Yakin ingin menghapus data insiden ini?")) return;
        startTransition(async () => {
          await deleteInfection(id);
        });
      }}
      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Hapus Insiden"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
