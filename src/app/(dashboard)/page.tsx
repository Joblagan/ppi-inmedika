import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList, AlertTriangle, ShieldCheck, Users, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (session.user.role === "USER_RUANGAN") {
    redirect("/sensus/input");
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = today.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const [
    totalRooms,
    submittedSensusToday,
    infectionsThisMonth,
    auditThisMonth,
    totalUsers,
  ] = await Promise.all([
    prisma.room.count({ where: { deletedAt: null } }),
    prisma.sensusHarian.count({ where: { date: today, deletedAt: null } }),
    prisma.infectionIncident.count({ where: { date: { gte: firstDayOfMonth }, deletedAt: null } }),
    prisma.auditKepatuhan.findMany({ where: { date: { gte: firstDayOfMonth }, deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  const sensusRate = totalRooms === 0 ? 0 : Math.round((submittedSensusToday / totalRooms) * 100);
  const totalPeluang = auditThisMonth.reduce((s, a) => s + a.peluang, 0);
  const totalBenar = auditThisMonth.reduce((s, a) => s + a.tindakanBenar, 0);
  const kepatuhanRate = totalPeluang > 0 ? Math.round((totalBenar / totalPeluang) * 100) : 0;

  // HANYA injeksi pewarnaan dark mode (dark:bg-... dan dark:text-...)
  const cards = [
    {
      title: "Sensus Harian (Hari Ini)",
      value: `${submittedSensusToday} / ${totalRooms}`,
      sub: `${sensusRate}% ruangan sudah submit`,
      icon: ClipboardList,
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      barColor: sensusRate === 100 ? "bg-emerald-500" : "bg-amber-400",
      barWidth: sensusRate,
      href: "/sensus/input",
    },
    {
      title: "Insiden HAIs",
      value: infectionsThisMonth,
      sub: `Bulan ${monthLabel}`,
      icon: AlertTriangle,
      iconBg: infectionsThisMonth > 0 ? "bg-red-50 dark:bg-red-900/30" : "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: infectionsThisMonth > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
      barColor: null,
      barWidth: 0,
      href: "/infections",
      badge: infectionsThisMonth === 0 
        ? { text: "Zero HAIs 🎉", cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" } 
        : { text: "Perlu Investigasi", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50" }
    },
    {
      title: "Kepatuhan Kebersihan",
      value: `${kepatuhanRate}%`,
      sub: `Dari ${auditThisMonth.length} sesi audit`,
      icon: ShieldCheck,
      iconBg: kepatuhanRate >= 85 ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-amber-50 dark:bg-amber-900/30",
      iconColor: kepatuhanRate >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      barColor: kepatuhanRate >= 85 ? "bg-emerald-500" : "bg-amber-400",
      barWidth: kepatuhanRate,
      href: "/audit",
    },
    {
      title: "Total Pengguna",
      value: totalUsers,
      sub: "Akun aktif terdaftar",
      icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      barColor: null,
      barWidth: 0,
      href: "/users",
    },
  ];

  return (
    <>
      {/* Layout dipertahankan 100% sama dengan milik Anda */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Selamat Datang, {session.user.name}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Anda masuk sebagai <span className="font-semibold text-emerald-600 dark:text-emerald-500">{session.user.role.replace(/_/g, " ")}</span>
          {" · "}
          <span className="text-slate-400 text-sm">{today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="group">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors mt-1" />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{card.value}</p>
                <p className="text-sm text-slate-400 mt-1">{card.sub}</p>

                {card.barColor && (
                  <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${card.barColor} transition-all`} style={{ width: `${card.barWidth}%` }} />
                  </div>
                )}
                {card.badge && (
                  <div className="mt-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.badge.cls}`}>
                      {card.badge.text}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick link to Presentation */}
      <div className="mt-6">
        <Link href="/presentation"
          className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white p-5 rounded-2xl shadow-md shadow-emerald-600/20 dark:shadow-emerald-900/30 hover:shadow-lg hover:shadow-emerald-600/30 transition-all group">
          <div>
            <p className="font-bold text-lg">Mode Presentasi ✨</p>
            <p className="text-emerald-100 text-sm font-medium mt-0.5">Tampilkan dashboard laporan bulanan untuk Direktur</p>
          </div>
          <ArrowRight className="w-6 h-6 text-emerald-200 dark:text-emerald-300 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </>
  );
}