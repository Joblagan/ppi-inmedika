"use client";

import { useTransition, useRef, useState } from "react";
import { createRoom, toggleDeleteRoom, updateRoomName } from "@/app/actions/room";
import { Loader2, Plus, Pencil, Trash2, X, AlertTriangle, CheckCircle2 } from "lucide-react";

export function RoomForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setMessage(null);
    startTransition(async () => {
      const result = await createRoom(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Ruangan berhasil ditambahkan!" });
        formRef.current?.reset();
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 mb-8">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-600" /> Tambah Ruangan Baru
      </h3>
      
      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            name="name"
            placeholder="Contoh: ICU, Ruang Melati, IGD..."
            required
            disabled={isPending}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all disabled:opacity-50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all font-semibold rounded-lg disabled:opacity-70 whitespace-nowrap"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Simpan
        </button>
      </form>
    </div>
  );
}

export function RoomActionButtons({ room }: { room: { id: string, name: string, deletedAt: Date | null } }) {
  const [isPending, startTransition] = useTransition();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editName, setEditName] = useState(room.name);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    setError(null);
    startTransition(async () => {
      const res = await updateRoomName(room.id, editName);
      if (res.error) {
        setError(res.error);
      } else {
        setShowEdit(false);
      }
    });
  };

  const handleToggleDelete = async () => {
    startTransition(async () => {
      await toggleDeleteRoom(room.id, room.deletedAt);
      setShowDelete(false);
    });
  };

  const isDeleted = !!room.deletedAt;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setEditName(room.name);
            setShowEdit(true);
          }}
          disabled={isDeleted}
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Edit Ruangan"
        >
          <Pencil className="w-4 h-4" />
        </button>
        
        {isDeleted ? (
          <button
            onClick={handleToggleDelete}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Aktifkan Kembali
          </button>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Nonaktifkan / Hapus Ruangan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Edit Nama Ruangan</h3>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {error && <p className="text-sm text-red-500 mb-3 font-medium">{error}</p>}
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none font-medium text-slate-800 dark:text-slate-100 transition-all"
                disabled={isPending}
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                onClick={handleEdit}
                disabled={isPending || editName.trim() === room.name}
                className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all rounded-xl disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nonaktifkan Ruangan?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ruangan <strong className="text-slate-800 dark:text-slate-100">{room.name}</strong> tidak akan muncul di pilihan Perawat lagi. Data historis infeksi dan sensus tidak akan terhapus.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                onClick={handleToggleDelete}
                disabled={isPending}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}