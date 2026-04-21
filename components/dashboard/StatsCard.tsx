"use client";

import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "violet" | "fuchsia" | "cyan" | "emerald" | "amber" | "rose";
}

const colorMap = {
  violet: {
    bg: "from-violet-50 to-violet-100/50",
    icon: "from-violet-500 to-violet-600",
    text: "text-violet-600",
    glow: "group-hover:shadow-violet-200"
  },
  fuchsia: {
    bg: "from-fuchsia-50 to-fuchsia-100/50",
    icon: "from-fuchsia-500 to-fuchsia-600",
    text: "text-fuchsia-600",
    glow: "group-hover:shadow-fuchsia-200"
  },
  cyan: {
    bg: "from-cyan-50 to-cyan-100/50",
    icon: "from-cyan-500 to-cyan-600",
    text: "text-cyan-600",
    glow: "group-hover:shadow-cyan-200"
  },
  emerald: {
    bg: "from-emerald-50 to-emerald-100/50",
    icon: "from-emerald-500 to-emerald-600",
    text: "text-emerald-600",
    glow: "group-hover:shadow-emerald-200"
  },
  amber: {
    bg: "from-amber-50 to-amber-100/50",
    icon: "from-amber-500 to-amber-600",
    text: "text-amber-600",
    glow: "group-hover:shadow-amber-200"
  },
  rose: {
    bg: "from-rose-50 to-rose-100/50",
    icon: "from-rose-500 to-rose-600",
    text: "text-rose-600",
    glow: "group-hover:shadow-rose-200"
  }
};

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  color = "violet" 
}: StatsCardProps) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group bg-gradient-to-br ${colors.bg} rounded-2xl p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl ${colors.glow} transition-all duration-300 border border-white/50`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-700 mt-1">{description}</p>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.icon} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-rose-100 text-rose-700"
          }`}>
            <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-700">vs mes anterior</span>
        </div>
      )}
    </motion.div>
  );
};
