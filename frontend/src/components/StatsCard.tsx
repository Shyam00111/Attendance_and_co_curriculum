import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  iconClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}) => {
  return (
    <Card 
      className={cn(
        "animate-fade-in overflow-hidden border-0 shadow-lg",
        "hover-lift bg-gradient-to-br from-slate-50 to-slate-100",
        "dark:from-slate-900 dark:to-slate-800",
        "relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/0 before:via-purple-500/0 before:to-transparent before:opacity-0 hover:before:opacity-10 before:transition-opacity",
        className
      )}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="space-y-1">
              <p className="font-display text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {value}
              </p>
              {subtitle && (
                <p
                  className={cn(
                    "text-xs font-medium transition-colors",
                    trend === 'up' && "text-emerald-600 dark:text-emerald-400",
                    trend === 'down' && "text-red-600 dark:text-red-400",
                    !trend && "text-muted-foreground"
                  )}
                >
                  {trend === 'up' && '↑ '}{trend === 'down' && '↓ '}{subtitle}
                </p>
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0",
              "backdrop-blur-sm border",
              iconClassName || "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-300 dark:border-blue-700 text-white shadow-lg shadow-blue-500/20"
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
