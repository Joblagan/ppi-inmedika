import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ComplianceBarChart, HaisPieChart, SensusLineChart, IncidenceRateBarChart } from "@/components/presentation/Charts";
import { Activity, ShieldCheck, Users, ClipboardList, TrendingDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ExportPdfButton } from "@/components/presentation/ExportPdfButton";
import { ExportExcelButton } from "@/components/presentation/ExportExcelButton";
import { DateRoomFilter } from "@/components/layout/DateRoomFilter";

export const metadata = {
  title: "Mode Presentasi | PPI/IPCN",
};

export default async function PresentationPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const now = new Date();
  
  const queryMonth = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;
  const queryYear = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();
  const queryRoomId = searchParams.roomId;

  const monthStart = new Date(Date.UTC(queryYear, queryMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(queryYear, queryMonth, 0));
  const monthLabel = monthStart.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const roomFilter = queryRoomId ? { roomId: queryRoomId } : {};

  // ===== DATA QUERIES =====
  const [
    totalRooms,
    haisRaw,
    auditRaw,
    sensusRaw,
    rooms,
    sensusDetailsGrouped,
    masterParameters,
  ] = await Promise.all([
    prisma.room.count({ where: { deletedAt: null } }),
    prisma.infectionIncident.findMany({
      where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, ...roomFilter },
    }),
    prisma.auditKepatuhan.findMany({
      where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, ...roomFilter },
      include: { room: true },
    }),
    prisma.sensusHarian.findMany({
      where: { deletedAt: null, date: { gte: new Date(Date.now() - 14 * 86400000) }, ...roomFilter },
      select: { date: true },
    }),
    prisma.room.findMany({ where: { deletedAt: null }, select: { id: true, name: true } }),
    prisma.sensusDetail.groupBy({
      by: ['parameterId'],
      _sum: { value: true },
      where: { 
        sensusHarian: { date: { gte: monthStart, lte: monthEnd }, deletedAt: null, ...roomFilter }
      }
    }),
    prisma.masterParameter.findMany({ select: { id: true, nama: true } }),
  ]);

  const haisBreakdown = Object.entries(
    haisRaw.reduce<Record<string, number>>((acc, i) => {
      acc[i.infectionType] = (acc[i.infectionType] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const complianceByRoom = rooms.map((r) => {
    const roomAudits = auditRaw.filter((a) => a.roomId === r.id);
    const peluang = roomAudits.reduce((s, a) => s + a.peluang, 0);
    const benar = roomAudits.reduce((s, a) => s + a.tindakanBenar, 0);
    return { room: r.name.replace("Ruang ", "").replace("Ruangan ", ""), rate: peluang > 0 ? Math.round((benar / peluang) * 100) : 0 };
  }).filter(r => r.rate > 0);

  const totalPeluang = auditRaw.reduce((s, a) => s + a.peluang, 0);
  const totalBenar = auditRaw.reduce((s, a) => s + a.tindakanBenar, 0);
  const kepatuhanRate = totalPeluang > 0 ? Math.round((totalBenar / totalPeluang) * 100) : 0;

  const sensusCountByDate: Record<string, number> = {};
  sensusRaw.forEach((s) => {
    const key = new Date(s.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    sensusCountByDate[key] = (sensusCountByDate[key] || 0) + 1;
  });
  const sensusChartData = Object.entries(sensusCountByDate).map(([date, submitted]) => ({
    date, submitted, total: totalRooms
  }));

  // === INCIDENCE RATE CALCULATION ===
  const parameterMap = new Map(masterParameters.map(p => [p.id, p.nama]));
  const denominatorMap = new Map<string, number>();
  sensusDetailsGrouped.forEach(d => {
    const paramName = parameterMap.get(d.parameterId);
    if (paramName && d._sum.value !== null) {
      denominatorMap.set(paramName, d._sum.value);
    }
  });

  const haisMapping: Record<string, string> = {
    VAP: 'VENTILATOR (VAP)',
    IAD: 'VENA SENTRAL (IAD)',
    PHLEBITIS: 'INFUS (PHLEBITIS)',
    ISK: 'KATETER URINE (ISK)',
    HAP: 'TOTAL PASIEN (HARI RAWAT)',
    IDO: 'LUKA OPERASI (IDO)', 
    DEKUBITUS: 'TOTAL PASIEN (HARI RAWAT)'
  };

  const incidenceRateData = Object.entries(
    haisRaw.reduce<Record<string, number>>((acc, i) => {
      acc[i.infectionType] = (acc[i.infectionType] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => {
    const paramName = haisMapping[name];
    const denominator = paramName ? (denominatorMap.get(paramName) || 0) : 0;
    let rate = 0;
    if (denominator > 0) {
      rate = name === 'IDO' ? (count / denominator) * 100 : (count / denominator) * 1000;
    }
    return { name, rate };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors duration-300">
      
      <div id="laporan-ppi" className="max-w-7xl mx-auto pb-4">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 no-print">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ExportExcelButton />
            <ExportPdfButton targetId="laporan-ppi" monthLabel={monthLabel} />
          </div>
        </div>

        {/* Header Laporan */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Sistem Surveilans PPI</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              Dashboard <span className="text-emerald-600 dark:text-emerald-400">IPCN</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium bg-slate-200 dark:bg-slate-800/50 inline-block px-3 py-1 rounded-lg">
              Laporan Bulanan — {monthLabel}
            </p>
          </div>
          <div className="text-right">
            <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Dokumen Resmi Dicetak Oleh</div>
            <div className="text-slate-800 dark:text-white font-bold text-lg">{session.user.name}</div>
            <div className="text-emerald-600 dark:text-emerald-400 text-xs font-mono mt-1">
              {now.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} WITA
            </div>
          </div>
        </header>

        <div className="no-print">
          <DateRoomFilter rooms={rooms} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Ruangan", value: totalRooms, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" },
            { label: "Insiden HAIs", value: haisRaw.length, icon: Activity, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800" },
            { label: "Tingkat Kepatuhan", value: `${kepatuhanRate}%`, icon: ShieldCheck, color: kepatuhanRate >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-yellow-600 dark:text-yellow-400", bg: kepatuhanRate >= 85 ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800" },
            { label: "Audit Dilakukan", value: auditRaw.length, icon: ClipboardList, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-5 flex items-start gap-4 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-colors`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-colors">
            <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Tingkat Kepatuhan per Ruangan</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Kebersihan Tangan & APD · Target Nasional ≥85%</p>
            {complianceByRoom.length > 0 ? (
              <ComplianceBarChart data={complianceByRoom} />
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">Belum ada data audit bulan ini</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-colors">
            <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Distribusi Jenis HAIs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Total: {haisRaw.length} insiden terlaporkan</p>
            {haisBreakdown.length > 0 ? (
              <HaisPieChart data={haisBreakdown} />
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 gap-3 border border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm tracking-wide">Zero HAIs Month! 🎉</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 mb-8 transition-colors">
            <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Tren Pelaporan Sensus Harian</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">14 hari terakhir · Menampilkan tingkat kedisiplinan perawat ruangan</p>
            {sensusChartData.length > 0 ? (
              <SensusLineChart data={sensusChartData} />
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">Belum ada data sensus 14 hari terakhir</div>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 mb-8 transition-colors">
            <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Incidence Rate HAIs (Permil ‰)</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Berdasarkan rasio infeksi per hari pemakaian alat (device days)</p>
            {incidenceRateData.length > 0 ? (
              <IncidenceRateBarChart data={incidenceRateData} />
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 gap-3 border border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm tracking-wide">Zero HAIs Month! 🎉</span>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-slate-500 dark:text-slate-600 text-xs font-medium border-t border-slate-200 dark:border-slate-800 pt-6 mt-8">
          Sistem Informasi Surveilans PPI/IPCN · Dokumen ini dihasilkan secara otomatis pada {now.toLocaleDateString("id-ID", { dateStyle: "full" })}
        </footer>

      </div>
    </div>
  );
}