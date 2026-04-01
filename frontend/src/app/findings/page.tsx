'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SeverityBadge, LaneBadge } from '@/components/Badges';
import { FileCode2, ArrowRight } from 'lucide-react';

export default function Findings() {
  const [findings, setFindings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/findings').then(res => res.json()).then(setFindings);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Findings</h1>
        <p className="text-neutral-400 mt-2">Comprehensive list of detected artifacts and risks across all repositories.</p>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1a1a] text-neutral-400 border-b border-[#333]">
            <tr>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Lane</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {findings.map((finding) => (
              <tr key={finding.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <SeverityBadge severity={finding.severity} />
                </td>
                <td className="px-6 py-4 font-medium text-white max-w-sm truncate">
                  {finding.title}
                </td>
                <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode2 size={14} />
                    <span className="truncate max-w-[200px]">{finding.path}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <LaneBadge lane={finding.lane} />
                </td>
                <td className="px-6 py-4 capitalize text-neutral-300">
                  <span className={`px-2 py-1 text-xs rounded-full border ${finding.status === 'resolved' ? 'text-teal-400 border-teal-500/20 bg-teal-500/10' : finding.status === 'ignored' ? 'text-neutral-400 border-neutral-500/20 bg-neutral-500/10' : 'text-orange-400 border-orange-500/20 bg-orange-500/10'}`}>
                    {finding.status}
                  </span>
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
      </div>
    </div>
  );
}
