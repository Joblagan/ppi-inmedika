import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EpidemiologiChart } from "./EpidemiologiChart";
import { Activity, AlertOctagon } from "lucide-react";

export const metadata = {
  title: "Kurva Epidemiologi | PPI",
};

export default async function EpidemiologiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch data for the last 12 months
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  // Define infection types and their corresponding denominators
  const infectionMapping = [
    { type: "VAP", denom: "Ventilator" },
    { type: "IAD", denom: "CVC" },
    { type: "ISK", denom: "Kateter Urine" },
  ];

  // We will calculate the rates for VAP as an example for the Control Chart
  // In a full system, you would have a dropdown to select the infection type.
  // For this demonstration, we'll build the VAP Control Chart.
  const targetType = "VAP";
  const targetDenom = "Ventilator";

  // Get master parameter ID for denominator
  const denomParam = await prisma.masterParameter.findFirst({
    where: { nama: { contains: targetDenom, mode: "insensitive" } }
  });

  const chartData = [];
  const rates = [];

  for (const m of months) {
    const startDate = new Date(Date.UTC(m.year, m.month - 1, 1));
    const endDate = new Date(Date.UTC(m.year, m.month, 0));

    // Get Numerator (Infections)
    const infections = await prisma.infectionIncident.count({
      where: {
        infectionType: targetType,
        deletedAt: null,
        date: { gte: startDate, lte: endDate }
      }
    });

    // Get Denominator (Device Days)
    let denominator = 0;
    if (denomParam) {
      const sensusAgg = await prisma.sensusDetail.aggregate({
        where: {
          parameterId: denomParam.id,
          sensusHarian: { date: { gte: startDate, lte: endDate }, deletedAt: null }
        },
        _sum: { value: true }
      });
      denominator = sensusAgg._sum.value || 0;
    }

    const rate = denominator > 0 ? (infections / denominator) * 1000 : 0;
    rates.push(rate);
    
    chartData.push({
      month: `${m.month.toString().padStart(2, '0')}/${m.year}`,
      rate: Number(rate.toFixed(2)),
      infections,
      denominator
    });
  }

  // Calculate Mean and StdDev
  const n = rates.length;
  const mean = rates.reduce((a, b) => a + b, 0) / n;
  
  const variance = rates.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const ucl = mean + (3 * stdDev);

  // Check Outbreak (latest month >= UCL)
  const isOutbreak = rates[rates.length - 1] > 0 && rates[rates.length - 1] >= ucl;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            Kurva Epidemiologi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Control Chart & Deteksi Outbreak HAIs
          </p>
        </div>
      </div>

      {isOutbreak && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-4 flex gap-4 animate-pulse">
          <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-xl h-fit">
            <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-red-700 dark:text-red-400 font-black text-lg">WARNING: OUTBREAK DETECTED!</h3>
            <p className="text-red-600 dark:text-red-300 font-medium mt-1">
              Insiden {targetType} bulan ini ({rates[rates.length - 1].toFixed(2)} ‰) telah melewati Upper Control Limit (UCL: {ucl.toFixed(2)} ‰).
              Segera lakukan investigasi ICRA dan langkah pengendalian infeksi.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Control Chart: {targetType} (per 1000 Hari {targetDenom})</h3>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500"></span>
              <span className="text-slate-500 dark:text-slate-400">Rata-rata (μ): {mean.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 border border-red-500 border-dashed"></span>
              <span className="text-slate-500 dark:text-slate-400">UCL (μ+3σ): {ucl.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <EpidemiologiChart data={chartData} mean={mean} ucl={ucl} />
        </div>
      </div>
    </div>
  );
}
