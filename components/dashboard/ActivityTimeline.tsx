"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  Users,
  TrendingUp,
  Settings,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "producto" | "receta" | "venta" | "cliente" | "config";
  action: string;
  description: string;
  timestamp: string;
  metadata?: {
    count?: number;
    value?: string;
  };
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const activityConfig: Record<Activity["type"], {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}> = {
  producto: {
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    label: "Producto"
  },
  receta: {
    icon: FileText,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
    label: "Receta"
  },
  venta: {
    icon: ShoppingCart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    label: "Venta"
  },
  cliente: {
    icon: Users,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    label: "Cliente"
  },
  config: {
    icon: Settings,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    label: "Configuración"
  }
};

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export const ActivityTimeline = ({ activities, maxItems = 5 }: ActivityTimelineProps) => {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No hay actividad reciente
        </p>
        <p className="text-xs text-muted-foreground">
          La actividad del sistema aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayActivities.map((activity, index) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;
        const isLast = index === displayActivities.length - 1;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative"
          >
            <div className="flex gap-4 pb-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
              )}

              {/* Icon */}
              <div className={cn(
                "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                config.bgColor
              )}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                  {activity.metadata?.count && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-medium text-foreground">
                        {activity.metadata.count} items
                      </span>
                    </>
                  )}
                  {activity.metadata?.value && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-semibold text-primary">
                        {activity.metadata.value}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
