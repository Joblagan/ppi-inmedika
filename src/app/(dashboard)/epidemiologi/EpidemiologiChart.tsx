"use client";

import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from "recharts";

type ChartData = {
  month: string;
  rate: number;
  infections: number;
  denominator: number;
};

export function EpidemiologiChart({ data, mean, ucl }: { data: ChartData[], mean: number, ucl: number }) {
  // Add mean and ucl to each data point for rendering lines
  const enrichedData = data.map(d => ({
    ...d,
    mean: mean,
    ucl: ucl
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">
              Rate: {data.rate} ‰
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Infeksi: {data.infections}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Hari Alat: {data.denominator}
            </p>
          </div>
          {data.rate >= ucl && ucl > 0 && (
            <p className="text-red-500 font-bold mt-2 text-xs">
              ⚠️ Melewati UCL
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={enrichedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
        <XAxis 
          dataKey="month" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }}
          dy={10}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        
        <ReferenceLine y={mean} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'right', value: 'Mean', fill: '#3b82f6', fontSize: 10 }} />
        <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'UCL', fill: '#ef4444', fontSize: 10 }} />
        
        <Area type="monotone" dataKey="rate" fill="url(#colorRate)" stroke="none" />
        <Line 
          type="monotone" 
          dataKey="rate" 
          name="Insidence Rate (‰)"
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
          activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
