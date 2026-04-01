import { cn, severityColors, laneColors } from '@/lib/utils';

export function SeverityBadge({ severity, className }: { severity: string, className?: string }) {
  const normalized = severity.toLowerCase();
  const classes = severityColors[normalized as keyof typeof severityColors] || severityColors.info;
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider border", classes, className)}>
      {normalized}
    </span>
  );
}

export function LaneBadge({ lane, className }: { lane: string, className?: string }) {
  const normalized = lane.toLowerCase();
  const classes = laneColors[normalized as keyof typeof laneColors] || laneColors.knowledge;
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", classes, className)}>
      {normalized}
    </span>
  );
}
