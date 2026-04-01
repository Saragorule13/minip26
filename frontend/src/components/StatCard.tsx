import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("p-6 rounded-xl bg-[#111] border border-[#222] flex flex-col hover:border-[#333] transition-colors", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
        {icon && <div className="text-neutral-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-3 mt-auto">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.isPositive ? "text-teal-400 bg-teal-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
