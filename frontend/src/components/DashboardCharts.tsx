'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardLaneBreakdown, DashboardTrendPoint } from '@/lib/dashboard';

type DashboardChartsProps = {
  laneBreakdown: DashboardLaneBreakdown[];
  trend: DashboardTrendPoint[];
};

export function DashboardCharts({ laneBreakdown, trend }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-[#222] bg-[#111] p-6 lg:col-span-2">
        <h3 className="mb-6 text-lg font-medium">Finding Trends (30 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand-orange)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-brand-orange)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="findings" stroke="var(--color-brand-orange)" fillOpacity={1} fill="url(#colorFindings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h3 className="mb-4 text-lg font-medium">Response Lanes</h3>
        <div className="space-y-4">
          {laneBreakdown.map((item) => (
            <div key={item.lane} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
              <span className="capitalize">{item.lane.replace('-', ' ')}</span>
              <span className="rounded bg-black px-2 py-1 font-mono font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
