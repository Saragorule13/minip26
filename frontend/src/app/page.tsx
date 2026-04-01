'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Target, ShieldCheck, AlertTriangle, Bug } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data || data.error || !data.summary) return <div className="flex h-full items-center justify-center pt-20"><div className="animate-pulse gradient-text text-2xl font-bold">Loading...</div></div>;

  const { summary, trend } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 mt-2">Repository security and artifact exposure summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Scans" 
          value={summary.totalScans} 
          icon={<Target size={20} />} 
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard 
          title="Open Findings" 
          value={summary.openFindings} 
          icon={<Bug size={20} />} 
          trend={{ value: "+3", isPositive: false }}
        />
        <StatCard 
          title="Critical Alerts" 
          value={summary.criticalFindings} 
          icon={<AlertTriangle size={20} className="text-red-500" />} 
          className="border-red-500/20"
        />
        <StatCard 
          title="Resolved" 
          value={summary.resolvedFindings} 
          icon={<ShieldCheck size={20} className="text-teal-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#111] border border-[#222]">
          <h3 className="text-lg font-medium mb-6">Finding Trends (30 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-orange)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-brand-orange)" stopOpacity={0}/>
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
        
        <div className="p-6 rounded-xl bg-[#111] border border-[#222]">
          <h3 className="text-lg font-medium mb-4">Response Lanes</h3>
          <div className="space-y-4">
            {data.laneBreakdown.map((item: any) => (
              <div key={item.lane} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/5">
                <span className="capitalize">{item.lane.replace('-', ' ')}</span>
                <span className="font-mono font-medium rounded bg-black px-2 py-1">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
