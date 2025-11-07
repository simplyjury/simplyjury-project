'use client';

// Epic 07 - Contact Limit Badge Component
// Small badge to show remaining contacts (for jury search results, etc.)

import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ContactLimitBadgeProps {
  remaining: number;
  total: number;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ContactLimitBadge({
  remaining,
  total,
  variant = 'default',
  className = '',
}: ContactLimitBadgeProps) {
  // Determine color based on remaining contacts
  const getColor = () => {
    if (remaining === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (remaining <= total * 0.2) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (variant === 'compact') {
    return (
      <Badge className={`${getColor()} ${className}`} variant="outline">
        <Users className="h-3 w-3 mr-1" />
        {remaining}/{total}
      </Badge>
    );
  }

  return (
    <Badge className={`${getColor()} ${className}`} variant="outline">
      <Users className="h-3 w-3 mr-1" />
      {remaining} contact{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}
    </Badge>
  );
}
