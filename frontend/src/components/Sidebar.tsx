'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Search, 
  PackageSearch,
  Settings,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Scans', href: '/scans', icon: Search },
    { name: 'Findings', href: '/findings', icon: ShieldAlert },
    { name: 'Dependencies', href: '/dependencies', icon: PackageSearch },
    { name: 'Repositories', href: '/repositories', icon: GitBranch },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-10 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 via-orange-500 to-red-500 flex items-center justify-center">
            <ShieldAlert size={18} className="text-white bg-black/50 rounded-full p-0.5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Semvi</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4 px-2 mt-4">Overview</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} className={cn("shrink-0", isActive ? "text-teal-400" : "text-neutral-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/10 text-xs text-neutral-500 flex justify-between">
        <span>v0.1.0</span>
        <span>Local Mode</span>
      </div>
    </aside>
  );
}
