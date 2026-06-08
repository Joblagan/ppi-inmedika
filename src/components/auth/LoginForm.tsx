"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";

import logoImage from "../../../public/logo.png"; 

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Kredensial tidak valid. Silakan periksa kembali.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Server sedang tidak dapat diakses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-white dark:border-slate-800 p-8 sm:p-10 transition-all">
      
      {/* FIX: LOGO DIBUAT BORDERLESS & DIPERBESAR */}
      <div className="flex justify-center mb-6">
        <Image 
          src={logoImage} 
          alt="Logo Inmedika" 
          width={220} // Lebar dasar diperbesar ekstrem
          height={100} // Tinggi dasar disesuaikan
          // w-auto dan h-20/24 memastikan gambar tidak gepeng (maintain aspect ratio) di semua layar
          className="object-contain h-20 sm:h-24 w-auto drop-shadow-md" 
          priority 
          unoptimized={true} 
        />
      </div>

      {/* HEADER TYPOGRAPHY */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          PPI <span className="text-emerald-600 dark:text-emerald-400">IPCN</span> System
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-sm font-medium">Sistem Surveilans Terpadu RS</p>
        </div>
      </div>

      {/* FORM INPUTS */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="username">
            Username
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600">
              <User className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[3px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 text-[15px] font-medium placeholder-slate-400"
              placeholder="Masukkan ID Anda"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[3px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 text-[15px] font-medium placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-[15px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-[3px] focus:ring-emerald-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-lg shadow-emerald-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Otentikasi...
            </>
          ) : (
            "Masuk ke Sistem"
          )}
        </button>
      </form>
      
      {/* FOOTER */}
      <p className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-8">
        &copy; {new Date().getFullYear()} Inmedika Denpasar. All rights reserved.
      </p>
    </div>
  );
}