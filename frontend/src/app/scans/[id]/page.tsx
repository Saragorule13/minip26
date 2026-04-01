import Link from 'next/link';
import { SeverityBadge, LaneBadge } from '@/components/Badges';
import { ArrowLeft, User, FileText, AlertTriangle } from 'lucide-react';

export default async function ScanDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const res = await fetch(`http://localhost:3000/api/scans/${id}`);
  const data = await res.json();

  if (data.error) return <div>Scan not found</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/scans" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.repo} Push Scan</h1>
          <p className="text-neutral-400 text-sm flex items-center gap-3 mt-1">
            <span className="font-mono">{data.commit_hash.substring(0, 7)}</span>
            <span>•</span>
            <span>{data.branch}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><User size={14}/> {data.author}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['fix-now', 'watch', 'knowledge'].map(lane => {
          const laneFindings = data.findings.filter((f: any) => f.lane === lane);
          return (
            <div key={lane} className="p-6 rounded-xl bg-[#111] border border-[#222]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium capitalize">{lane.replace('-', ' ')}</h3>
                <LaneBadge lane={lane} />
              </div>
              
              <div className="space-y-4">
                {laneFindings.length === 0 ? (
                  <p className="text-sm text-neutral-500 italic">No findings in this lane.</p>
                ) : (
                  laneFindings.map((finding: any) => (
                    <Link href={`/findings/${finding.id}`} key={finding.id} className="block group">
                      <div className="p-4 rounded-lg border border-white/5 bg-black hover:border-white/20 transition-colors cursor-pointer text-sm">
                        <div className="flex justify-between mb-2">
                          <SeverityBadge severity={finding.severity} />
                          <span className="text-neutral-500 text-xs font-mono">{finding.kind}</span>
                        </div>
                        <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors">{finding.title}</h4>
                        <div className="mt-3 flex items-start gap-2 text-neutral-400 text-xs font-mono bg-[#0a0a0a] p-2 rounded">
                          <FileText size={14} className="shrink-0 mt-0.5" />
                          <span className="truncate">{finding.path}{finding.line ? `:${finding.line}` : ''}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
