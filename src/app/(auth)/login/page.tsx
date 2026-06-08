import { LoginForm } from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}