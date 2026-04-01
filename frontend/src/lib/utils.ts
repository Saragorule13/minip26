import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Colors for the priority lanes 
export const laneColors = {
  'fix-now': 'bg-red-500/10 text-red-500 border-red-500/20',
  'watch': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'knowledge': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

// Colors for severities
export const severityColors = {
  'critical': 'bg-red-600/20 text-red-500 font-bold border-red-600/30',
  'high': 'bg-orange-500/20 text-orange-400 font-bold border-orange-500/30',
  'medium': 'bg-yellow-500/20 text-yellow-500 font-bold border-yellow-500/30',
  'low': 'bg-blue-500/20 text-blue-400 font-bold border-blue-500/30',
  'info': 'bg-neutral-500/20 text-neutral-400 font-bold border-neutral-500/30',
};
