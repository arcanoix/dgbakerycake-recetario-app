"use client";

import { useState } from "react";
import { UserData } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Ban, Play, UserCog, ShieldAlert, Trash2, CreditCard, UserRound } from "lucide-react";
import { suspenderUsuario, reactivarUsuario, cambiarRolUsuario, eliminarUsuario, obtenerPlanPorNombre } from "@/lib/subscriptionStorage";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { ChangePlanDialog } from "@/components/admin/ChangePlanDialog";

interface UsersTableProps {
  usuarios: UserData[];
  onUpdate?: () => void;
}

export const UsersTable = ({ usuarios, onUpdate }: UsersTableProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [cargandoAccion, setCargandoAccion] = useState<string | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<UserData | null>(null);
  const [usuarioCambiandoPlan, setUsuarioCambiandoPlan] = useState<UserData | null>(null);

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendiente</Badge>;
      case "canceled":
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return <Badge variant="default" className="bg-violet-600">Admin</Badge>;
    }
    return <Badge variant="outline">Cliente</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSuspenderUsuario = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de suspender al usuario ${email}?`)) return;
    
    setCargandoAccion(userId);
    const resultado = await suspenderUsuario(userId, "Suspendido por administrador");
    setCargandoAccion(null);
    
    if (resultado.exitoso) {
      alert("Usuario suspendido exitosamente");
      onUpdate?.();
    } else {
      alert(`Error al suspender usuario: ${resultado.error}`);
    }
  };

  const handleReactivarUsuario = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de reactivar al usuario ${email}?`)) return;
    
    setCargandoAccion(userId);
    
    try {
      // Buscar el ID real del plan "free" para reactivar al usuario
      const planFree = await obtenerPlanPorNombre('free');
      
      if (!planFree || !planFree.id) {
        alert("Error: No se pudo encontrar el plan gratuito (free) en el sistema.");
        setCargandoAccion(null);
        return;
      }
      
      const resultado = await reactivarUsuario(userId, planFree.id);
      
      if (resultado.exitoso) {
        alert("Usuario reactivado exitosamente");
        onUpdate?.();
      } else {
        alert(`Error al reactivar usuario: ${resultado.error}`);
      }
    } catch (error) {
      alert("Error inesperado al reactivar usuario");
      console.error(error);
    } finally {
      setCargandoAccion(null);
    }
  };

  const handleCambiarRol = async (userId: string, email: string, rolActual?: string) => {
    const nuevoRol = rolActual === "admin" ? "cliente" : "admin";
    if (!confirm(`¿Cambiar rol de ${email} a ${nuevoRol}?`)) return;
    
    setCargandoAccion(userId);
    const resultado = await cambiarRolUsuario(userId, nuevoRol);
    setCargandoAccion(null);
    
    if (resultado.exitoso) {
      alert(`Rol cambiado a ${nuevoRol} exitosamente`);
      onUpdate?.();
    } else {
      alert(`Error al cambiar rol: ${resultado.error}`);
    }
  };

  const handleEliminarUsuario = async (userId: string, email: string) => {
    const confirmacion1 = confirm(
      `⚠️ ADVERTENCIA: Estás a punto de eliminar permanentemente al usuario ${email}.\n\n` +
      `Esta acción eliminará:\n` +
      `- Todos sus productos\n` +
      `- Todas sus recetas\n` +
      `- Su configuración\n` +
      `- Sus suscripciones\n` +
      `- Su cuenta de usuario\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `¿Estás seguro de que deseas continuar?`
    );
    
    if (!confirmacion1) return;
    
    const confirmacion2 = confirm(
      `⚠️ ÚLTIMA CONFIRMACIÓN\n\n` +
      `¿Confirmas que deseas eliminar permanentemente a ${email}?`
    );
    
    if (!confirmacion2) return;
    
    setCargandoAccion(userId);
    const resultado = await eliminarUsuario(userId);
    setCargandoAccion(null);
    
    if (resultado.exitoso) {
      alert(`Usuario ${email} eliminado exitosamente`);
      onUpdate?.();
    } else {
      alert(`Error al eliminar usuario: ${resultado.error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Registrados ({usuarios.length})</CardTitle>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Buscar por email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Recetas</TableHead>
                <TableHead>Última conexión</TableHead>
                <TableHead>IP / País</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="min-w-[220px] font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-stone-200 bg-stone-50 shadow-sm">
                          {usuario.avatar_url ? <AvatarImage src={usuario.avatar_url} alt={`Foto de perfil de ${usuario.email}`} /> : null}
                          <AvatarFallback className="bg-stone-100 text-slate-500">
                            <UserRound aria-hidden="true" className="h-4 w-4" />
                            <span className="sr-only">Usuario sin foto de perfil</span>
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{usuario.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {usuario.plan_display_name || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {usuario.plan_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(usuario.subscription_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">
                        {usuario.productos_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">
                        {usuario.recetas_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(usuario.last_sign_in_at) !== "N/A"
                        ? formatDate(usuario.last_sign_in_at)
                        : formatDate(usuario.start_date)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {usuario.last_ip || "—"}
                      {usuario.country && (
                        <span className="ml-1 text-blue-600">({usuario.country})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(usuario.end_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <Button
                          size="icon"
                          variant="outline"
                          title="Cambiar plan"
                          onClick={() => setUsuarioCambiandoPlan(usuario)}
                          disabled={cargandoAccion === usuario.id}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Editar usuario"
                          onClick={() => setUsuarioEditando(usuario)}
                          disabled={cargandoAccion === usuario.id}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {usuario.subscription_status === "active" ? (
                          <Button
                            size="icon"
                            variant="destructive"
                            title="Suspender suscripción"
                            onClick={() => handleSuspenderUsuario(usuario.id, usuario.email)}
                            disabled={cargandoAccion === usuario.id}
                            className="h-8 w-8"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="default"
                            title="Reactivar suscripción"
                            onClick={() => handleReactivarUsuario(usuario.id, usuario.email)}
                            disabled={cargandoAccion === usuario.id}
                            className="h-8 w-8"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          title={usuario.role === "admin" ? "Hacer Cliente" : "Hacer Admin"}
                          onClick={() => handleCambiarRol(usuario.id, usuario.email, usuario.role)}
                          disabled={cargandoAccion === usuario.id}
                          className="h-8 w-8"
                        >
                          {usuario.role === "admin" ? <UserCog className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4 text-primary" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          title="Eliminar usuario"
                          onClick={() => handleEliminarUsuario(usuario.id, usuario.email)}
                          disabled={cargandoAccion === usuario.id}
                          className="h-8 w-8 bg-red-700 hover:bg-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {usuariosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        )}
      </CardContent>
      <EditUserModal
        usuario={usuarioEditando}
        onClose={() => setUsuarioEditando(null)}
        onUpdate={() => {
          setUsuarioEditando(null);
          onUpdate?.();
        }}
      />
      <ChangePlanDialog
        usuario={usuarioCambiandoPlan}
        onClose={() => setUsuarioCambiandoPlan(null)}
        onUpdate={() => {
          setUsuarioCambiandoPlan(null);
          onUpdate?.();
        }}
      />
    </Card>
  );
};
