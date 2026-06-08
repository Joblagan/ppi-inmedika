import { Sidebar } from "@/components/layout/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      
      {/* Sidebar dibiarkan bebas tanpa dibungkus div 'hidden' lagi! */}
      {/* Biarkan komponen Sidebar yang mengatur dirinya sendiri mau muncul/sembunyi */}
      <Sidebar />
      
      {/* Main Content Area */}
      {/* Ditambahkan pt-16 (padding-top) khusus di HP agar konten tidak tertutup tombol Hamburger */}
      <div className="flex-1 md:ml-64 min-w-0 pt-16 md:pt-0">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}