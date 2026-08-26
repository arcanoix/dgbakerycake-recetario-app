"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  sparklineData?: number[];
  className?: string;
}

const variantStyles = {
  default: {
    gradient: "from-slate-50 to-transparent dark:from-slate-900/50",
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  primary: {
    gradient: "from-amber-50 to-transparent dark:from-amber-950/50",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-700 dark:text-amber-300",
  },
  success: {
    gradient: "from-emerald-50 to-transparent dark:from-emerald-950/50",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    gradient: "from-amber-50 to-transparent dark:from-amber-950/50",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    gradient: "from-red-50 to-transparent dark:from-red-950/50",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

const Sparkline = ({ data, colorClass }: { data: number[]; colorClass: string }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-12 w-full mt-4">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill="url(#sparklineGradient)"
          className={cn(colorClass, "opacity-20")}
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={colorClass}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  sparklineData,
  className,
}: StatsCardProps) => {
  const styles = variantStyles[variant];
  const sparklineColor = variant === "success" ? "text-emerald-500" : variant === "warning" || variant === "primary" ? "text-amber-500" : variant === "danger" ? "text-red-500" : "text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        scale: { duration: 0.2 }
      }}
      className={className}
    >
      <Card className="group relative overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
        {/* Animated Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity duration-500",
            styles.gradient
          )}
        />

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              {title}
            </p>
          </div>
          {Icon && (
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300",
                styles.iconBg
              )}
            >
              <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </motion.div>
          )}
        </CardHeader>

        <CardContent className="relative space-y-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <motion.div 
              className={cn(
                "font-black tracking-tight whitespace-pre-line",
                // Responsive text sizing based on value length (without newlines)
                typeof value === 'string' && value.replace(/\n/g, '').length > 20 ? "text-xl sm:text-2xl" :
                typeof value === 'string' && value.replace(/\n/g, '').length > 12 ? "text-2xl sm:text-3xl" :
                "text-3xl sm:text-4xl"
              )}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {value}
            </motion.div>
            {trend && (
              <motion.div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 backdrop-blur-sm flex-shrink-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-bold",
                    trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </motion.div>
            )}
          </div>

          {description && (
            <p className="text-xs font-medium text-muted-foreground/90 leading-relaxed">
              {description}
            </p>
          )}

          {trend?.label && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {trend.label}
            </p>
          )}

          {sparklineData && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Sparkline data={sparklineData} colorClass={sparklineColor} />
            </motion.div>
          )}
        </CardContent>

        {/* Bottom Accent Line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          variant === "success" && "from-emerald-400 to-emerald-600",
          variant === "primary" && "from-amber-400 to-amber-600",
          variant === "warning" && "from-amber-400 to-amber-600",
          variant === "danger" && "from-red-400 to-red-600",
          variant === "default" && "from-slate-400 to-slate-600"
        )} />
      </Card>
    </motion.div>
  );
};
