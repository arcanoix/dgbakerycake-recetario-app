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

type Vista = "solicitudes" | "usuarios" | "graficos" | "actividades";

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
  // router is stable (from useRouter) and cargarDatos is defined in render scope;
  // intentionally omitted to avoid re-running on every render.
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
        <div className="container mx-auto p-6">
          <p className="text-center">Cargando panel de administrador...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const TABS: { id: Vista; label: string }[] = [
    { id: "solicitudes", label: "💳 Solicitudes de Pago" },
    { id: "usuarios", label: "👥 Usuarios" },
    { id: "graficos", label: "📊 Gráficos" },
    { id: "actividades", label: "🕵️ Actividades" },
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administrador</h1>
            <p className="text-muted-foreground">
              Gestiona solicitudes de pago, suscripciones, usuarios y auditoría
            </p>
          </div>
          <Button onClick={cargarDatos} variant="outline">
            🔄 Actualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b flex-wrap">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={vistaActual === tab.id ? "default" : "ghost"}
              onClick={() => setVistaActual(tab.id)}
              className="rounded-b-none"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* ===================== STATS CARDS ===================== */}
        {vistaActual === "solicitudes" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Solicitudes Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {estadisticas.solicitudesPendientes}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Solicitudes Aprobadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {estadisticas.solicitudesAprobadas}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estadisticas.totalUsuarios}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Suscripciones Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {estadisticas.suscripcionesActivas}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {vistaActual === "usuarios" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {estadisticasUsuarios.totalUsuarios}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {estadisticasUsuarios.usuariosActivos}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Con Plan de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {estadisticasUsuarios.usuariosConPlanPago}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nuevos Este Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {estadisticasUsuarios.usuariosNuevosEsteMes}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {vistaActual === "actividades" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activityLogs.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Creaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {activityLogs.filter((l) => l.action === "create").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Eliminaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {activityLogs.filter((l) => l.action === "delete").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== MAIN CONTENT ===================== */}
        {vistaActual === "solicitudes" && (
          <>
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtro === "pending" ? "default" : "outline"}
                onClick={() => setFiltro("pending")}
              >
                Pendientes ({solicitudes.filter((s) => s.status === "pending").length})
              </Button>
              <Button
                variant={filtro === "approved" ? "default" : "outline"}
                onClick={() => setFiltro("approved")}
              >
                Aprobadas ({solicitudes.filter((s) => s.status === "approved").length})
              </Button>
              <Button
                variant={filtro === "rejected" ? "default" : "outline"}
                onClick={() => setFiltro("rejected")}
              >
                Rechazadas ({solicitudes.filter((s) => s.status === "rejected").length})
              </Button>
              <Button
                variant={filtro === "all" ? "default" : "outline"}
                onClick={() => setFiltro("all")}
              >
                Todas ({solicitudes.length})
              </Button>
            </div>

            <PaymentRequestsTable
              solicitudes={solicitudesFiltradas}
              onUpdate={cargarDatos}
            />
          </>
        )}

        {vistaActual === "usuarios" && (
          <UsersTable usuarios={usuarios} onUpdate={cargarDatos} />
        )}

        {vistaActual === "graficos" && (
          <AdminCharts usuarios={usuarios} activityLogs={activityLogs} />
        )}

        {vistaActual === "actividades" && (
          <ActivityLogsTable logs={activityLogs} />
        )}
      </div>
    </ProtectedRoute>
  );
}
