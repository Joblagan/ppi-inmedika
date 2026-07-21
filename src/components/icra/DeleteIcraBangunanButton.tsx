"use client";

import { useState, useTransition } from "react";
import { deleteIcraBangunan } from "@/app/actions/icra";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteIcraBangunanButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Yakin ingin menghapus data ICRA ini?")) {
      startTransition(async () => {
        await deleteIcraBangunan(id);
      });
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
