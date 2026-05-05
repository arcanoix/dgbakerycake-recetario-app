"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = "default" 
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <div className="h-4 w-4 text-muted-foreground">
              {typeof Icon === 'string' ? (
                <span className="text-xl">{Icon}</span>
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <Badge 
                variant={trend.isPositive ? "default" : "destructive"}
                className="text-xs"
              >
                <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
                {Math.abs(trend.value)}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs mes anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
