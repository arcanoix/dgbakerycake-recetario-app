"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, value, icon, description, trend }: StatsCardProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/40 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:from-blue-100/60 transition-colors duration-300" />
      
      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className={`inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md text-xs font-semibold ${
            trend.isPositive 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
