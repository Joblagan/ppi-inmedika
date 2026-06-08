import { LoginForm } from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login | PPI IPCN System",
  description: "Sistem Surveilans Infeksi Rumah Sakit",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Efek Pendaran Cahaya (Ambient Glow) Premium */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />

      {/* Kontainer Utama Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}