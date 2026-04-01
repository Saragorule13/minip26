'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SeverityBadge, LaneBadge } from '@/components/Badges';
import { ArrowLeft, CheckCircle2, XCircle, ShieldAlert, FileCode2, ExternalLink, AlertTriangle } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; 
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

export default function FindingDetail({ params }: { params: Promise<{ id: string }> }) {
  const [finding, setFinding] = useState<any>(null);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) {
      fetch(`/api/findings/${id}`).then(res => res.json()).then(setFinding);
    }
  }, [id]);

  useEffect(() => {
    if (finding) Prism.highlightAll();
  }, [finding]);

  const updateStatus = async (status: string) => {
    await fetch('/api/findings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    setFinding({ ...finding, status });
  };

  if (!finding) return <div className="animate-pulse h-full flex items-center justify-center pt-20">Loading...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/scans/${finding.scan_id}`} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={finding.severity} />
          <LaneBadge lane={finding.lane} />
          <span className="text-xs font-mono uppercase text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded bg-neutral-900">{finding.kind}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{finding.title}</h1>
        <div className="flex items-center gap-2 mt-3 text-neutral-400 font-mono text-sm bg-[#111] border border-[#222] px-3 py-2 rounded-lg inline-flex">
          <FileCode2 size={16} />
          <span>{finding.path}</span>
          {finding.line && <span className="text-neutral-500">:{finding.line}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-6">
          {finding.snippet && (
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
              <div className="flex items-center px-4 py-2 border-b border-[#222] bg-[#111] text-xs text-neutral-400 font-mono">
                Code Snippet
              </div>
              <div className="p-4 overflow-x-auto text-sm">
                <pre>
                  <code className={`language-${finding.path.split('.').pop() || 'typescript'}`}>
                    {finding.snippet}
                  </code>
                </pre>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#222] bg-[#111] p-6 space-y-4">
            <div>
              <h3 className="text-neutral-400 text-sm font-medium mb-1 uppercase tracking-wider">Detection Summary</h3>
              <p className="text-neutral-200">{finding.summary}</p>
            </div>
            {finding.evidence && (
              <div>
                <h3 className="text-neutral-400 text-sm font-medium mb-1 uppercase tracking-wider">Evidence Pattern</h3>
                <code className="px-2 py-1 bg-black rounded border border-[#222] text-sm text-red-400">{finding.evidence}</code>
              </div>
            )}
            <div className="pt-2">
              <h3 className="text-neutral-400 text-sm font-medium mb-1 uppercase tracking-wider">Remediation Steps</h3>
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-100 flex gap-3">
                <ShieldAlert size={20} className="text-teal-400 shrink-0" />
                <p>{finding.remediation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#222] bg-[#111] p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-2">Status</h3>
              <div className="flex items-center gap-2 text-white font-medium capitalize">
                {finding.status === 'open' && <AlertTriangle size={16} className="text-orange-500" />}
                {finding.status === 'resolved' && <CheckCircle2 size={16} className="text-teal-500" />}
                {finding.status === 'ignored' && <XCircle size={16} className="text-neutral-500" />}
                {finding.status}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-2">Assigned Owners</h3>
              <div className="flex flex-wrap gap-2">
                {finding.owners ? finding.owners.split(',').map((o: string) => (
                  <span key={o} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-sm text-neutral-300">
                    {o.trim()}
                  </span>
                )) : <span className="text-neutral-500 text-sm italic">Unassigned</span>}
              </div>
            </div>

            <div className="pt-4 border-t border-[#222]">
              <h3 className="text-sm font-medium text-neutral-400 mb-4">Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => updateStatus(finding.status === 'resolved' ? 'open' : 'resolved')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-teal-500/20 text-white rounded-lg border border-white/10 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 size={16} /> {finding.status === 'resolved' ? 'Reopen' : 'Resolve'}
                </button>
                <button 
                  onClick={() => updateStatus(finding.status === 'ignored' ? 'open' : 'ignored')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-neutral-800 text-white rounded-lg border border-white/10 transition-colors text-sm font-medium"
                >
                  <XCircle size={16} /> {finding.status === 'ignored' ? 'Reopen' : 'Ignore'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
