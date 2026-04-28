"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaymentRequestsTable } from "@/components/admin/PaymentRequestsTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { ActivityLogsTable } from "@/components/admin/ActivityLogsTable";
import { AdminCharts } from "@/components/admin/AdminCharts";
import { useRole } from "@/hooks/useRole";
import { PaymentRequest } from "@/types/subscription";
import { UserData, ActivityLog } from "@/types/user";
import {
  obtenerTodasLasSolicitudes,
  obtenerEstadisticasAdmin,
  obtenerTodosLosUsuarios,
  obtenerEstadisticasUsuarios,
  obtenerActividadesAdmin,
} from "@/lib/subscriptionStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { 
  CreditCard, Users, BarChart3, Activity, RefreshCw, 
  Clock, CheckCircle, XCircle, TrendingUp, UserPlus, 
  Crown, AlertCircle
} from "lucide-react";

type Vista = "solicitudes" | "usuarios" | "graficos" | "actividades";

const TABS: { id: Vista; label: string; icon: React.ReactNode }[] = [
  { id: "solicitudes", label: "Solicitudes", icon: <CreditCard className="w-4 h-4" /> },
  { id: "usuarios", label: "Usuarios", icon: <Users className="w-4 h-4" /> },
  { id: "graficos", label: "Estadísticas", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "actividades", label: "Actividad", icon: <Activity className="w-4 h-4" /> },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, gradient, subtitle }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="border-0 shadow-lg overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, cargando: cargandoRole } = useRole();
  const [vistaActual, setVistaActual] = useState<Vista>("solicitudes");
  const [solicitudes, setSolicitudes] = useState<PaymentRequest[]>([]);
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filtro, setFiltro] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [estadisticas, setEstadisticas] = useState({
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    totalUsuarios: 0,
    suscripcionesActivas: 0,
  });
  const [estadisticasUsuarios, setEstadisticasUsuarios] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosConPlanPago: 0,
    usuariosNuevosEsteMes: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!cargandoRole && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      cargarDatos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, cargandoRole]);

  const cargarDatos = async () => {
    setCargando(true);
    const [solicitudesData, statsData, usuariosData, statsUsuariosData, logsData] =
      await Promise.all([
        obtenerTodasLasSolicitudes(),
        obtenerEstadisticasAdmin(),
        obtenerTodosLosUsuarios(),
        obtenerEstadisticasUsuarios(),
        obtenerActividadesAdmin(),
      ]);

    setSolicitudes(solicitudesData);
    setEstadisticas(statsData);
    setUsuarios(usuariosData);
    setEstadisticasUsuarios(statsUsuariosData);
    setActivityLogs(logsData);
    setCargando(false);
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (filtro === "all") return true;
    return s.status === filtro;
  });

  if (cargandoRole || cargando) {
    return (
      <ProtectedRoute>
        <Loading text="Cargando panel de administrador..." fullScreen />
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingCount = solicitudes.filter((s) => s.status === "pending").length;
  const approvedCount = solicitudes.filter((s) => s.status === "approved").length;
  const rejectedCount = solicitudes.filter((s) => s.status === "rejected").length;

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              Panel de Administrador
            </h1>
            <p className="text-gray-700 mt-1">
              Gestiona solicitudes, usuarios y auditoría del sistema
            </p>
          </div>
          <Button 
            onClick={cargarDatos} 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 border-b border-gray-200 pb-1 flex-wrap"
        >
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setVistaActual(tab.id)}
              className={`gap-2 rounded-lg ${
                vistaActual === tab.id 
                  ? "bg-violet-100/50 text-violet-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "solicitudes" && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
          ))}
        </motion.div>

        {/* ===================== STATS CARDS ===================== */}
        {vistaActual === "solicitudes" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Pendientes"
                value={estadisticas.solicitudesPendientes}
                icon={<Clock className="w-6 h-6 text-yellow-600" />}
                color="bg-yellow-100/50"
                gradient="from-yellow-500 to-orange-500"
                subtitle={`${pendingCount} solicitudes esperan`}
              />
              <StatCard
                title="Aprobadas"
                value={estadisticas.solicitudesAprobadas}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                color="bg-green-100/50"
                gradient="from-green-500 to-emerald-500"
                subtitle={`${approvedCount} aprobadas`}
              />
              <StatCard
                title="Total Usuarios"
                value={estadisticas.totalUsuarios}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100/50"
                gradient="from-blue-500 to-cyan-500"
                subtitle="usuarios registrados"
              />
              <StatCard
                title="Suscripciones"
                value={estadisticas.suscripcionesActivas}
                icon={<Crown className="w-6 h-6 text-violet-600" />}
                color="bg-violet-100/50"
                gradient="from-violet-500 to-fuchsia-500"
                subtitle="planes activos"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap mt-6">
              <Button
                variant={filtro === "pending" ? "default" : "outline"}
                onClick={() => setFiltro("pending")}
                className={`gap-2 ${filtro === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
              >
                <Clock className="w-4 h-4" />
                Pendientes ({pendingCount})
              </Button>
              <Button
                variant={filtro === "approved" ? "default" : "outline"}
                onClick={() => setFiltro("approved")}
                className={`gap-2 ${filtro === "approved" ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                <CheckCircle className="w-4 h-4" />
                Aprobadas ({approvedCount})
              </Button>
              <Button
                variant={filtro === "rejected" ? "default" : "outline"}
                onClick={() => setFiltro("rejected")}
                className={`gap-2 ${filtro === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}`}
              >
                <XCircle className="w-4 h-4" />
                Rechazadas ({rejectedCount})
              </Button>
              <Button
                variant={filtro === "all" ? "default" : "outline"}
                onClick={() => setFiltro("all")}
              >
                Todas ({solicitudes.length})
              </Button>
            </div>

            <div className="mt-4">
              <PaymentRequestsTable
                solicitudes={solicitudesFiltradas}
                onUpdate={cargarDatos}
              />
            </div>
          </motion.div>
        )}

        {vistaActual === "usuarios" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Usuarios"
                value={estadisticasUsuarios.totalUsuarios}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100/50"
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Usuarios Activos"
                value={estadisticasUsuarios.usuariosActivos}
                icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                color="bg-green-100/50"
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Con Plan de Pago"
                value={estadisticasUsuarios.usuariosConPlanPago}
                icon={<Crown className="w-6 h-6 text-violet-600" />}
                color="bg-violet-100/50"
                gradient="from-violet-500 to-fuchsia-500"
              />
              <StatCard
                title="Nuevos Este Mes"
                value={estadisticasUsuarios.usuariosNuevosEsteMes}
                icon={<UserPlus className="w-6 h-6 text-amber-600" />}
                color="bg-amber-100/50"
                gradient="from-amber-500 to-orange-500"
                subtitle="registros este mes"
              />
            </div>

            <UsersTable usuarios={usuarios} onUpdate={cargarDatos} />
          </motion.div>
        )}

        {vistaActual === "actividades" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Total Actividades"
                value={activityLogs.length}
                icon={<Activity className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100/50"
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Creaciones"
                value={activityLogs.filter((l) => l.action === "create").length}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                color="bg-green-100/50"
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Eliminaciones"
                value={activityLogs.filter((l) => l.action === "delete").length}
                icon={<XCircle className="w-6 h-6 text-red-600" />}
                color="bg-red-100/50"
                gradient="from-red-500 to-rose-500"
              />
            </div>

            <ActivityLogsTable logs={activityLogs} />
          </motion.div>
        )}

        {vistaActual === "graficos" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <AdminCharts usuarios={usuarios} activityLogs={activityLogs} />
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
