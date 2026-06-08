import { LoginForm } from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata = {
  title: "Login | Sistem Informasi PPI/IPCN",
  description: "Login untuk mengakses Sistem Surveilans Infeksi Rumah Sakit",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4">
      {/* Container Branding & Logo */}
      <div className="w-full max-w-md flex flex-col items-center mb-8">
        <Image 
          src="/logo.png" 
          alt="Logo PPI" 
          width={130} 
          height={60} 
          className="object-contain mb-4 drop-shadow-sm" 
          unoptimized={true} 
        />
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none text-center">
          PPI <span className="text-emerald-600">IPCN</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-2 text-center">
          Sistem Surveilans RS
        </p>
      </div>

      {/* Container Form Login */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
        <LoginForm />
      </div>
    </div>
  );
}