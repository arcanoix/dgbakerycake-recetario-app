"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData, ActivityLog } from "@/types/user";
import { motion } from "motion/react";
import { Users, Calendar, Activity, Zap, TrendingUp, Package, BookOpen, Settings } from "lucide-react";

const COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ec4899", // pink
  "#3b82f6", // blue
];

const MODULE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  recetas: { color: "#8b5cf6", icon: <BookOpen className="w-4 h-4" /> },
  productos: { color: "#06b6d4", icon: <Package className="w-4 h-4" /> },
  auth: { color: "#f59e0b", icon: <Users className="w-4 h-4" /> },
  configuracion: { color: "#10b981", icon: <Settings className="w-4 h-4" /> },
  categorias: { color: "#ec4899", icon: <Package className="w-4 h-4" /> },
  unidades: { color: "#3b82f6", icon: <Package className="w-4 h-4" /> },
  subscription: { color: "#ef4444", icon: <Users className="w-4 h-4" /> },
};

const ACTION_COLORS: Record<string, string> = {
  create: "#10b981",
  update: "#3b82f6",
  delete: "#ef4444",
  login: "#8b5cf6",
  logout: "#6b7280",
  view: "#f59e0b",
};

const MODULE_LABELS: Record<string, string> = {
  recetas: "Recetas",
  productos: "Productos",
  auth: "Auth",
  configuracion: "Configuración",
  categorias: "Categorías",
  unidades: "Unidades",
  subscription: "Suscripción",
};

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, icon, gradient, children }: ChartCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </motion.div>
);

function groupUsersByPlan(usuarios: UserData[]) {
  const counts: Record<string, number> = {};
  usuarios.forEach((u) => {
    const plan = u.plan_display_name || u.plan_name || "Sin plan";
    counts[plan] = (counts[plan] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function groupUsersByMonth(usuarios: UserData[]) {
  const now = new Date();
  const months: Record<string, number> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-VE", { month: "short", year: "2-digit" });
    months[key] = 0;
  }

  usuarios.forEach((u) => {
    if (!u.created_at) return;
    const d = new Date(u.created_at);
    const key = d.toLocaleDateString("es-VE", { month: "short", year: "2-digit" });
    if (key in months) {
      months[key]++;
    }
  });

  return Object.entries(months).map(([mes, usuarios]) => ({ mes, usuarios }));
}

function groupActivityByModule(logs: ActivityLog[]) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    const label = MODULE_LABELS[l.module] || l.module;
    counts[label] = (counts[label] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([module, acciones]) => ({ module, acciones }))
    .sort((a, b) => b.acciones - a.acciones);
}

function groupActivityByAction(logs: ActivityLog[]) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    counts[l.action] = (counts[l.action] || 0) + 1;
  });
  return Object.entries(counts).map(([accion, total]) => ({ accion, total }));
}

function groupActivityByDay(logs: ActivityLog[]) {
  const now = new Date();
  const days: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("es-VE", { weekday: "short", day: "numeric" });
    days[key] = 0;
  }

  logs.forEach((l) => {
    const d = new Date(l.created_at);
    const diffMs = now.getTime() - d.getTime();
    if (diffMs > 7 * 24 * 60 * 60 * 1000) return;
    const key = d.toLocaleDateString("es-VE", { weekday: "short", day: "numeric" });
    if (key in days) days[key]++;
  });

  return Object.entries(days).map(([dia, acciones]) => ({ dia, acciones }));
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
        <p className="text-gray-500 dark:text-gray-400">
          {payload[0].value} usuario{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminCharts = ({ usuarios, activityLogs }: AdminChartsProps) => {
  const planData = groupUsersByPlan(usuarios);
  const monthData = groupUsersByMonth(usuarios);
  const moduleData = groupActivityByModule(activityLogs);
  const actionData = groupActivityByAction(activityLogs);
  const dayData = groupActivityByDay(activityLogs);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Usuarios por Plan"
          icon={<Users className="w-4 h-4 text-white" />}
          gradient="from-violet-500 to-purple-600"
        >
          {planData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Sin datos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {planData.map((_, index) => (
                    <Cell
                      key={`plan-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Registros por Mes"
          icon={<Calendar className="w-4 h-4 text-white" />}
          gradient="from-cyan-500 to-blue-600"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="usuarios"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#colorUsers)"
                name="Registros"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Actividad por Módulo"
          icon={<Activity className="w-4 h-4 text-white" />}
          gradient="from-amber-500 to-orange-600"
        >
          {moduleData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Sin actividad registrada</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={moduleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} stroke="#9ca3af" />
                <YAxis 
                  dataKey="module" 
                  type="category" 
                  width={90} 
                  tick={{ fontSize: 11 }} 
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="acciones" 
                  name="Acciones" 
                  radius={[0, 4, 4, 0]}
                  fill="#f59e0b"
                >
                  {moduleData.map((entry, index) => (
                    <Cell 
                      key={`module-${index}`} 
                      fill={MODULE_CONFIG[entry.module.toLowerCase()]?.color || "#f59e0b"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Acciones Realizadas"
          icon={<Zap className="w-4 h-4 text-white" />}
          gradient="from-emerald-500 to-teal-600"
        >
          {actionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Sin actividad registrada</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="accion" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                  {actionData.map((entry) => (
                    <Cell
                      key={entry.accion}
                      fill={ACTION_COLORS[entry.accion] || "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Actividad - Últimos 7 Días"
        icon={<TrendingUp className="w-4 h-4 text-white" />}
        gradient="from-rose-500 to-pink-600"
      >
        {activityLogs.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <p>Sin actividad registrada</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dayData}>
              <defs>
                <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="acciones"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
                name="Acciones"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

interface AdminChartsProps {
  usuarios: UserData[];
  activityLogs: ActivityLog[];
}
