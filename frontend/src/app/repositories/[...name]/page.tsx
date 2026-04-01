'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, ShieldAlert, GitCommit, FileCode2, ArrowRight, Search, Loader2 } from 'lucide-react';
import { SeverityBadge, LaneBadge } from '@/components/Badges';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RepositoryDetail({ params }: { params: Promise<{ name: string[] }> }) {
  const [data, setData] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [repoNameStr, setRepoNameStr] = useState('');

  const fetchData = (nameParts: string[]) => {
    fetch(`/api/repositories/${nameParts.join('/')}`).then(res => res.json()).then(setData);
  };

  useEffect(() => {
    params.then(p => {
      setRepoNameStr(p.name.join('/'));
      fetchData(p.name);
    });
  }, [params]);

  const handleAudit = async () => {
    if (isAuditing || !repoNameStr) return;
    setIsAuditing(true);
    try {
      await fetch(`/api/audit`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoNameStr })
      });
      // Refresh to get new findings and mock scan history
      const resolvedParams = await params;
      fetchData(resolvedParams.name);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  if (!data || data.error) return <div className="flex h-full items-center justify-center pt-20"><div className="animate-pulse gradient-text text-2xl font-bold">Loading...</div></div>;

  const { repo, openFindings, scans, trend } = data;
  const isHealthy = repo.health_score >= 80;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/repositories" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{repo.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${isHealthy ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                Score: {repo.health_score}/100
              </span>
            </div>
            <p className="text-neutral-400 mt-2">Repository security health, open vulnerabilities, and scan timeline.</p>
          </div>
        </div>
        
        <button 
          onClick={handleAudit}
          disabled={isAuditing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white transition-colors rounded-lg font-medium text-sm border border-neutral-700 disabled:opacity-50"
        >
          {isAuditing ? <Loader2 size={16} className="animate-spin text-teal-400" /> : <Search size={16} className="text-teal-400" />}
          {isAuditing ? 'Scanning History...' : 'Run Full History Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#111] border border-[#222]">
          <h3 className="text-lg font-medium mb-6">Health Trend (Recent Scans)</h3>
          {trend.length === 0 ? (
            <p className="text-neutral-500 flex h-[250px] items-center justify-center">No recent scan history.</p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isHealthy ? "var(--color-brand-teal)" : "var(--color-brand-red)"} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={isHealthy ? "var(--color-brand-teal)" : "var(--color-brand-red)"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Area type="monotone" dataKey="health" stroke={isHealthy ? "var(--color-brand-teal)" : "var(--color-brand-red)"} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="p-6 rounded-xl bg-[#111] border border-[#222]">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><GitBranch size={18}/> Activity Timeline</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {scans.length === 0 ? (
              <p className="text-neutral-500 text-sm">No recent push scans recorded.</p>
            ) : (
              scans.map((scan: any) => (
                <Link href={`/scans/${scan.id}`} key={scan.id} className="block group">
                  <div className="flex gap-4 items-start p-3 rounded-lg border border-transparent hover:border-[#333] hover:bg-white/[0.02] transition-colors relative">
                    <div className="w-2 h-2 rounded-full bg-neutral-600 mt-2 shrink-0 group-hover:bg-teal-500 transition-colors relative z-10" />
                    <div className="absolute left-[15px] top-6 bottom-[-24px] w-[1px] bg-[#333] last-of-type:hidden" />
                    
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                        Scan Completed
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                        <GitCommit size={12}/> <span className="font-mono">{scan.commit_hash.substring(0, 7)}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {new Date(scan.timestamp).toLocaleString()} by {scan.author}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Open Findings Wrapper */}
      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden mt-6">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ShieldAlert size={18} className="text-orange-500"/> Open Findings
          </h3>
          <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded">
            {openFindings.length}
          </span>
        </div>
        
        {openFindings.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            All clear! No open security findings for this repository.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-[#222]">
              {openFindings.map((finding: any) => (
                <tr key={finding.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                    {finding.title}
                  </td>
                  <td className="px-6 py-4">
                    <LaneBadge lane={finding.lane} />
                  </td>
                  <td className="px-6 py-4 text-neutral-400 font-mono text-xs hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FileCode2 size={14} />
                      <span className="truncate max-w-[200px]">{finding.path}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/findings/${finding.id}`} className="inline-flex items-center justify-center text-neutral-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
