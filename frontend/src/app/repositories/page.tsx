'use client';

import { useEffect, useState } from 'react';
import { GitBranch, Shield, Activity, TrendingUp, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Repositories() {
  const [repos, setRepos] = useState<any[]>([]);
  const [newRepo, setNewRepo] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchRepos = () => {
    fetch('/api/repositories').then(res => res.json()).then(setRepos);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepo.trim()) return;
    
    setAdding(true);
    setError('');
    
    try {
      const res = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRepo.trim() })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to add repository');
      
      setNewRepo('');
      fetchRepos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitored Repositories</h1>
          <p className="text-neutral-400 mt-2">Health scores and activity for codebase targets.</p>
        </div>
        
        <form onSubmit={handleAddRepo} className="flex flex-col gap-2 min-w-[300px]">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="owner/repo (e.g., vercel/next.js)" 
              value={newRepo}
              onChange={(e) => setNewRepo(e.target.value)}
              className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button 
              type="submit" 
              disabled={adding || !newRepo.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add
            </button>
          </div>
          {error && <p className="text-red-400 text-xs px-1">{error}</p>}
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {repos.map(repo => {
          const isHealthy = repo.health_score >= 80;
          const isWarning = repo.health_score < 80 && repo.health_score >= 60;
          
          return (
            <Link href={`/repositories/${repo.name}`} key={repo.id} className="block group">
              <div className="p-6 rounded-xl bg-[#111] border border-[#222] hover:border-[#333] transition-colors h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                      <GitBranch size={20} className="text-neutral-300" />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-teal-400 transition-colors">{repo.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-6 mt-auto">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-400">Security Health</span>
                      <span className={isHealthy ? 'text-teal-400 font-medium' : isWarning ? 'text-orange-400 font-medium' : 'text-red-400 font-medium'}>
                        {repo.health_score}/100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 delay-100 ${isHealthy ? 'bg-teal-500' : isWarning ? 'bg-orange-500' : 'bg-red-500'}`} 
                        style={{ width: `${repo.health_score}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222]">
                    <div>
                      <div className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Status</div>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                        <Activity size={14} className="text-teal-500" /> Active
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Details</div>
                      <div className="text-sm text-teal-400 group-hover:text-teal-300 transition-colors flex items-center gap-1">
                        View Repo <TrendingUp size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
