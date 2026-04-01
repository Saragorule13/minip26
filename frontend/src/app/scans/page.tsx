'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitCommit, Clock, GitBranch, ArrowRight } from 'lucide-react';
import { SeverityBadge } from '@/components/Badges';

export default function Scans() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/scans').then(res => res.json()).then(setScans);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recent Scans</h1>
        <p className="text-neutral-400 mt-2">History of repository push scans and their findings.</p>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1a1a] text-neutral-400 border-b border-[#333]">
            <tr>
              <th className="px-6 py-4 font-medium">Repository</th>
              <th className="px-6 py-4 font-medium">Commit</th>
              <th className="px-6 py-4 font-medium">Branch</th>
              <th className="px-6 py-4 font-medium text-center">Findings</th>
              <th className="px-6 py-4 font-medium text-center">Critical</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {Array.isArray(scans) && scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-medium">{scan.repo}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <GitCommit size={14} />
                    <span className="font-mono text-xs text-white">{scan.commit_hash.substring(0, 7)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <GitBranch size={14} />
                    <span>{scan.branch}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-neutral-800 text-neutral-200 font-mono text-xs">
                    {scan.total_findings}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {scan.critical_findings > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-500/20 text-red-500 font-mono text-xs border border-red-500/30">
                      {scan.critical_findings}
                    </span>
                  ) : (
                    <span className="text-neutral-600">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{new Date(scan.timestamp).toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/scans/${scan.id}`} className="inline-flex items-center justify-center text-neutral-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <ArrowRight size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
