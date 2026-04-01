'use client';

import { useEffect, useState } from 'react';
import { PackageSearch, ExternalLink } from 'lucide-react';
import { SeverityBadge } from '@/components/Badges';
import Link from 'next/link';

export default function Dependencies() {
  const [findings, setFindings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/findings?kind=cve').then(res => res.json()).then(setFindings);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supply-Chain Vulnerabilities</h1>
        <p className="text-neutral-400 mt-2">Vulnerable dependencies detected via OSV across all lockfiles.</p>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        {findings.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <PackageSearch size={48} className="mx-auto mb-4 opacity-50" />
            <p>No vulnerable dependencies detected.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-neutral-400 border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-medium">CVE / ID</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {findings.map((finding) => {
                const evidenceSplit = finding.evidence?.split(' ');
                const cveId = evidenceSplit ? evidenceSplit[0] : 'Unknown';
                const packageInfo = evidenceSplit?.slice(2).join(' ') || finding.snippet || 'Unknown Package';

                return (
                  <tr key={finding.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      <Link href={`/findings/${finding.id}`} className="hover:text-teal-400 transition-colors">
                        {cveId}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-200">{finding.summary}</div>
                      <div className="text-neutral-500 text-xs mt-1 font-mono">{packageInfo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={finding.severity} />
                    </td>
                    <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                      {finding.path}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${finding.status === 'resolved' ? 'text-teal-400 border-teal-500/20 bg-teal-500/10' : 'text-orange-400 border-orange-500/20 bg-orange-500/10'}`}>
                        {finding.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
