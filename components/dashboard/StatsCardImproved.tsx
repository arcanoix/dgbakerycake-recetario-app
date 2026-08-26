"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: { value: number; label: string; isPositive?: boolean };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  sparklineData?: number[];
  className?: string;
}

const variantStyles = {
  default: { gradient: "from-slate-50/90 via-white to-white", iconBg: "bg-slate-100", iconColor: "text-slate-600", sparkline: "text-slate-500" },
  primary: { gradient: "from-amber-50/80 via-white to-white", iconBg: "bg-amber-100", iconColor: "text-amber-700", sparkline: "text-amber-600" },
  success: { gradient: "from-emerald-50/80 via-white to-white", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", sparkline: "text-emerald-600" },
  warning: { gradient: "from-orange-50/80 via-white to-white", iconBg: "bg-orange-100", iconColor: "text-orange-700", sparkline: "text-orange-600" },
  danger: { gradient: "from-rose-50/80 via-white to-white", iconBg: "bg-rose-100", iconColor: "text-rose-700", sparkline: "text-rose-600" },
};

function Sparkline({ data, colorClass }: { data: number[]; colorClass: string }) {
  const gradientId = `sparkline-${useId().replace(/:/g, "")}`;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 100;
    const y = 90 - ((value - min) / range) * 72;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg aria-label="Tendencia del indicador" className={cn("h-full w-full", colorClass)} preserveAspectRatio="none" role="img" viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={`url(#${gradientId})`} points={`0,100 ${points} 100,100`} stroke="none" />
      <polyline fill="none" points={points} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

export function StatsCard({ title, value, icon: Icon, description, trend, variant = "default", sparklineData, className }: StatsCardProps) {
  const styles = variantStyles[variant];
  const hasSparkline = Boolean(sparklineData && sparklineData.length > 1);
  const TrendIcon = trend?.isPositive === false ? TrendingDown : TrendingUp;

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className={cn("h-full", className)} initial={{ opacity: 0, y: 12 }} transition={{ duration: 0.35, ease: "easeOut" }} whileHover={{ y: -2 }}>
      <Card className="group relative flex h-full min-h-[264px] flex-col overflow-hidden rounded-2xl border-stone-200/90 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-shadow duration-200 hover:shadow-[0_16px_32px_rgba(15,23,42,0.09)]">
        <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br", styles.gradient)} />

        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 p-5 pb-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
          {Icon ? <div className={cn("grid h-11 w-11 place-items-center rounded-xl shadow-sm", styles.iconBg)}><Icon aria-hidden="true" className={cn("h-5 w-5", styles.iconColor)} strokeWidth={2} /></div> : null}
        </CardHeader>

        <CardContent className="relative flex flex-1 flex-col p-5 pt-4">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <p className="max-w-full font-mono text-[clamp(1.7rem,2.1vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.06em] text-slate-950 tabular-nums">{value}</p>
            {trend ? <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold tabular-nums", trend.isPositive === false ? "border-rose-100 bg-rose-50 text-rose-600" : "border-emerald-100 bg-emerald-50 text-emerald-700")}><TrendIcon aria-hidden="true" className="h-3 w-3" />{trend.isPositive === false ? "−" : "+"}{trend.value}%</span> : null}
          </div>
          {description ? <p className="mt-3 text-sm leading-5 text-slate-500">{description}</p> : null}

          <div className="mt-auto pt-4">
            <p className="min-h-4 text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400">{trend?.label ?? "Indicador actual"}</p>
            <div className="mt-2 h-12 border-t border-stone-100 pt-2">
              {hasSparkline ? <Sparkline colorClass={styles.sparkline} data={sparklineData!} /> : <div aria-hidden="true" className="mt-4 h-px w-full bg-stone-100" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
