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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData, ActivityLog } from "@/types/user";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const MODULE_LABELS: Record<string, string> = {
  recetas: "Recetas",
  productos: "Productos",
  auth: "Auth",
  configuracion: "Configuración",
  categorias: "Categorías",
  unidades: "Unidades",
  subscription: "Suscripción",
};

const ACTION_COLORS: Record<string, string> = {
  create: "#10b981",
  update: "#3b82f6",
  delete: "#ef4444",
  login: "#8b5cf6",
  logout: "#6b7280",
  view: "#f59e0b",
};

interface AdminChartsProps {
  usuarios: UserData[];
  activityLogs: ActivityLog[];
}

/* ---------------------------------------------------------------
   Helper: group users by subscription plan
---------------------------------------------------------------- */
function groupUsersByPlan(usuarios: UserData[]) {
  const counts: Record<string, number> = {};
  usuarios.forEach((u) => {
    const plan = u.plan_display_name || u.plan_name || "Sin plan";
    counts[plan] = (counts[plan] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

/* ---------------------------------------------------------------
   Helper: group users by registration month (last 6 months)
---------------------------------------------------------------- */
function groupUsersByMonth(usuarios: UserData[]) {
  const now = new Date();
  const months: Record<string, number> = {};

  // Initialize last 6 months
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

/* ---------------------------------------------------------------
   Helper: activity by module from logs
---------------------------------------------------------------- */
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

/* ---------------------------------------------------------------
   Helper: activity by action type from logs
---------------------------------------------------------------- */
function groupActivityByAction(logs: ActivityLog[]) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    counts[l.action] = (counts[l.action] || 0) + 1;
  });
  return Object.entries(counts).map(([accion, total]) => ({ accion, total }));
}

/* ---------------------------------------------------------------
   Helper: activity over last 7 days
---------------------------------------------------------------- */
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

/* ---------------------------------------------------------------
   Helper: custom pie tooltip
---------------------------------------------------------------- */
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">
          {payload[0].value} usuario{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

/* ===============================================================
   Main Component
================================================================ */
export const AdminCharts = ({ usuarios, activityLogs }: AdminChartsProps) => {
  const planData = groupUsersByPlan(usuarios);
  const monthData = groupUsersByMonth(usuarios);
  const moduleData = groupActivityByModule(activityLogs);
  const actionData = groupActivityByAction(activityLogs);
  const dayData = groupActivityByDay(activityLogs);

  return (
    <div className="space-y-6">
      {/* Row 1: Plan distribution + Monthly registrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users by plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {planData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Sin datos
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {planData.map((_, index) => (
                      <Cell
                        key={`plan-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Nuevos Usuarios — Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Registros"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Activity by module + Activity by action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity by module */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            {moduleData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Sin actividad registrada aún
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={moduleData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="module" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="acciones" name="Acciones" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity by action type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            {actionData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Sin actividad registrada aún
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={actionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="accion" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
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
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Activity over last 7 days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividad — Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Sin actividad registrada aún
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="acciones"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Acciones"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
