"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// Palet warna Premium Hospital Green & Status Colors
const COLORS = [
  "#10b981", // Emerald 500 (Primary)
  "#0ea5e9", // Sky 500
  "#6366f1", // Indigo 500
  "#f59e0b", // Amber 500
  "#ec4899", // Pink 500
  "#8b5cf6", // Violet 500
  "#14b8a6"  // Teal 500
];

export function ComplianceBarChart({ data }: { data: { room: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
        <XAxis 
          dataKey="room" 
          tick={{ fontSize: 12, fontWeight: 500 }} 
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          domain={[0, 100]} 
          tick={{ fontSize: 12 }} 
          unit="%" 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          }}
          formatter={(v: number) => [`${v}%`, "Tingkat Kepatuhan"]}
        />
        <Bar 
          dataKey="rate" 
          radius={[6, 6, 0, 0]} 
          barSize={40}
          isAnimationActive={false} // WAJIB MATI UNTUK EXPORT PDF
        >
          {data.map((entry, i) => (
            <Cell 
              key={`cell-${i}`} 
              fill={entry.rate >= 85 ? "#10b981" : "#ef4444"} // Hijau jika lulus KPI, Merah jika gagal
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HaisPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <Pie 
          data={data} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          innerRadius={60} // Diubah jadi Donut Chart agar lebih modern
          outerRadius={90} 
          isAnimationActive={false} // WAJIB MATI UNTUK EXPORT PDF
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            const pct = (percent * 100).toFixed(0);
            return percent > 0 ? (
              <text x={x} y={y} fill="white" fontSize={11} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                {`${pct}%`}
              </text>
            ) : null;
          }}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SensusLineChart({ data }: { data: { date: string; submitted: number; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11 }} 
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}/>
        <Line 
          type="monotone" 
          dataKey="submitted" 
          name="Submit Sensus" 
          stroke="#10b981" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} 
          activeDot={{ r: 6 }}
          isAnimationActive={false} // WAJIB MATI UNTUK EXPORT PDF
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          name="Total Ruangan Aktif" 
          stroke="#94a3b8" 
          strokeWidth={2} 
          strokeDasharray="5 5" 
          dot={false} 
          isAnimationActive={false} // WAJIB MATI UNTUK EXPORT PDF
        />
      </LineChart>
    </ResponsiveContainer>
  );
}