"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaymentRequestsTable } from "@/components/admin/PaymentRequestsTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { useRole } from "@/hooks/useRole";
import { PaymentRequest } from "@/types/subscription";
import { UserData } from "@/types/user";
import { obtenerTodasLasSolicitudes, obtenerEstadisticasAdmin, obtenerTodosLosUsuarios, obtenerEstadisticasUsuarios } from "@/lib/subscriptionStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, cargando: cargandoRole } = useRole();
  const [vistaActual, setVistaActual] = useState<"solicitudes" | "usuarios">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<PaymentRequest[]>([]);
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
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
  }, [isAdmin, cargandoRole]);

  const cargarDatos = async () => {
    setCargando(true);
    const [solicitudesData, statsData, usuariosData, statsUsuariosData] = await Promise.all([
      obtenerTodasLasSolicitudes(),
      obtenerEstadisticasAdmin(),
      obtenerTodosLosUsuarios(),
      obtenerEstadisticasUsuarios(),
    ]);
    
    setSolicitudes(solicitudesData);
    setEstadisticas(statsData);
    setUsuarios(usuariosData);
    setEstadisticasUsuarios(statsUsuariosData);
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administrador</h1>
            <p className="text-muted-foreground">Gestiona solicitudes de pago, suscripciones y usuarios</p>
          </div>
          <Button onClick={cargarDatos} variant="outline">
            🔄 Actualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={vistaActual === "solicitudes" ? "default" : "ghost"}
            onClick={() => setVistaActual("solicitudes")}
            className="rounded-b-none"
          >
            💳 Solicitudes de Pago
          </Button>
          <Button
            variant={vistaActual === "usuarios" ? "default" : "ghost"}
            onClick={() => setVistaActual("usuarios")}
            className="rounded-b-none"
          >
            👥 Usuarios
          </Button>
        </div>

        {/* Estadísticas */}
        {vistaActual === "solicitudes" ? (
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
        ) : (
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

        {/* Contenido según vista */}
        {vistaActual === "solicitudes" ? (
          <>
            {/* Filtros */}
        <div className="flex gap-2">
          <Button
            variant={filtro === "pending" ? "default" : "outline"}
            onClick={() => setFiltro("pending")}
          >
            Pendientes ({solicitudes.filter(s => s.status === "pending").length})
          </Button>
          <Button
            variant={filtro === "approved" ? "default" : "outline"}
            onClick={() => setFiltro("approved")}
          >
            Aprobadas ({solicitudes.filter(s => s.status === "approved").length})
          </Button>
          <Button
            variant={filtro === "rejected" ? "default" : "outline"}
            onClick={() => setFiltro("rejected")}
          >
            Rechazadas ({solicitudes.filter(s => s.status === "rejected").length})
          </Button>
          <Button
            variant={filtro === "all" ? "default" : "outline"}
            onClick={() => setFiltro("all")}
          >
            Todas ({solicitudes.length})
          </Button>
        </div>

            {/* Tabla de Solicitudes */}
            <PaymentRequestsTable
              solicitudes={solicitudesFiltradas}
              onUpdate={cargarDatos}
            />
          </>
        ) : (
          <UsersTable usuarios={usuarios} />
        )}
      </div>
    </ProtectedRoute>
  );
}
