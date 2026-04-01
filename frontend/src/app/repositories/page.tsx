'use client';

import { useEffect, useState } from 'react';
import { GitBranch, Shield, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Repositories() {
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/repositories').then(res => res.json()).then(setRepos);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitored Repositories</h1>
        <p className="text-neutral-400 mt-2">Health scores and activity for codebase targets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {repos.map(repo => {
          const isHealthy = repo.health_score >= 80;
          const isWarning = repo.health_score < 80 && repo.health_score >= 60;
          
          return (
            <div key={repo.id} className="p-6 rounded-xl bg-[#111] border border-[#222] hover:border-[#333] transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                    <GitBranch size={20} className="text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-lg">{repo.name}</h3>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400">Security Health</span>
                    <span className={isHealthy ? 'text-teal-400 font-medium' : isWarning ? 'text-orange-400 font-medium' : 'text-red-400 font-medium'}>
                      {repo.health_score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isHealthy ? 'bg-teal-500' : isWarning ? 'bg-orange-500' : 'bg-red-500'}`} 
                      style={{ width: `${repo.health_score}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222]">
                  <div>
                    <div className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Status</div>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                      <Activity size={14} className="text-teal-500" /> Active Scan
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Actions</div>
                    <Link href={`/scans?repo=${repo.name}`} className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                      View Scans <TrendingUp size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
