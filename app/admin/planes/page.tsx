"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Plan, SubscriptionPlanName } from "@/types/subscription";
import {
  obtenerTodosLosPlanes,
  actualizarPlan,
  crearPlan,
  eliminarPlan,
} from "@/lib/subscriptionStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Package,
  BookOpen,
  Crown,
  Zap,
  Star,
  Building2,
} from "lucide-react";

const PLAN_ICONS: Record<SubscriptionPlanName, React.ReactNode> = {
  free: <Star className="w-5 h-5" />,
  basico: <Zap className="w-5 h-5" />,
  profesional: <Crown className="w-5 h-5" />,
  empresarial: <Building2 className="w-5 h-5" />,
};

const PLAN_COLORS: Record<SubscriptionPlanName, string> = {
  free: "bg-gray-500",
  basico: "bg-blue-500",
  profesional: "bg-purple-500",
  empresarial: "bg-amber-500",
};

interface PlanFormData {
  name: SubscriptionPlanName;
  display_name: string;
  description: string;
  price_usd: number;
  price_bs: number;
  price_period: string;
  max_productos: number;
  max_recetas: number;
  features: {
    // Menu visibility
    menu_dashboard: boolean;
    menu_productos: boolean;
    menu_recetas: boolean;
    menu_clientes: boolean;
    menu_ventas: boolean;
    menu_precios: boolean;
    menu_facturacion: boolean;
    menu_perfil: boolean;
    menu_configuracion: boolean;
    menu_unidades: boolean;
    // Actions
    crear_productos: boolean;
    crear_recetas: boolean;
    exportar_pdf: boolean;
    ver_analytics: boolean;
    exportar_datos: boolean;
    api_access: boolean;
    soporte_prioritario: boolean;
    soporte?: string;
  };
  is_active: boolean;
  sort_order: number;
}

const DEFAULT_FORM_DATA: PlanFormData = {
  name: "free",
  display_name: "",
  description: "",
  price_usd: 0,
  price_bs: 0,
  price_period: "monthly",
  max_productos: 50,
  max_recetas: 20,
  features: {
    menu_dashboard: true,
    menu_productos: true,
    menu_recetas: true,
    menu_clientes: false,
    menu_ventas: false,
    menu_precios: true,
    menu_facturacion: true,
    menu_perfil: true,
    menu_configuracion: true,
    menu_unidades: true,
    crear_productos: true,
    crear_recetas: true,
    exportar_pdf: false,
    ver_analytics: false,
    exportar_datos: false,
    api_access: false,
    soporte_prioritario: false,
    soporte: "básico",
  },
  is_active: true,
  sort_order: 0,
};

function Switch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminPlanesPage() {
  const { user, loading: loadingAuth } = useAuth();
  const { isAdmin, cargando: cargandoRole } = useRole();
  const router = useRouter();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>(DEFAULT_FORM_DATA);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    if (!loadingAuth && !cargandoRole && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, loadingAuth, isAdmin, cargandoRole, router]);

  useEffect(() => {
    if (user && isAdmin) {
      cargarPlanes();
    }
  }, [user, isAdmin]);

  const cargarPlanes = async () => {
    try {
      setCargando(true);
      const data = await obtenerTodosLosPlanes();
      setPlanes(data);
    } catch (error) {
      console.error("Error al cargar planes:", error);
      setMensaje({ tipo: "error", texto: "Error al cargar los planes" });
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (plan: Plan) => {
    setEditando(plan.id);
    setModoCrear(false);
    const f = (plan.features as any) || {};
    setFormData({
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description || "",
      price_usd: plan.price_usd,
      price_bs: plan.price_bs,
      price_period: plan.price_period,
      max_productos: plan.max_productos,
      max_recetas: plan.max_recetas,
      features: {
        menu_dashboard: f.menu_dashboard ?? true,
        menu_productos: f.menu_productos ?? true,
        menu_recetas: f.menu_recetas ?? true,
        menu_clientes: f.menu_clientes ?? false,
        menu_ventas: f.menu_ventas ?? false,
        menu_precios: f.menu_precios ?? true,
        menu_facturacion: f.menu_facturacion ?? true,
        menu_perfil: f.menu_perfil ?? true,
        menu_configuracion: f.menu_configuracion ?? true,
        menu_unidades: f.menu_unidades ?? true,
        crear_productos: f.crear_productos ?? true,
        crear_recetas: f.crear_recetas ?? true,
        exportar_pdf: f.exportar_pdf ?? false,
        ver_analytics: f.ver_analytics ?? false,
        exportar_datos: f.exportar_datos ?? false,
        api_access: f.api_access ?? false,
        soporte_prioritario: f.soporte_prioritario ?? false,
        soporte: f.soporte || "básico",
      },
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setMensaje(null);
  };

  const iniciarCreacion = () => {
    setModoCrear(true);
    setEditando(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      sort_order: planes.length + 1,
    });
    setMensaje(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setModoCrear(false);
    setFormData(DEFAULT_FORM_DATA);
    setMensaje(null);
  };

  const guardarPlan = async () => {
    try {
      setGuardando(true);
      setMensaje(null);

      if (modoCrear) {
        const resultado = await crearPlan({
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description || undefined,
          price_usd: formData.price_usd,
          price_bs: formData.price_bs,
          price_period: formData.price_period,
          max_productos: formData.max_productos,
          max_recetas: formData.max_recetas,
          features: formData.features,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        });

        if (resultado.exitoso) {
          setMensaje({ tipo: "success", texto: "Plan creado exitosamente" });
          await cargarPlanes();
          cancelarEdicion();
        } else {
          setMensaje({ tipo: "error", texto: resultado.error || "Error al crear el plan" });
        }
      } else if (editando) {
        const resultado = await actualizarPlan(editando, {
          display_name: formData.display_name,
          description: formData.description || undefined,
          price_usd: formData.price_usd,
          price_bs: formData.price_bs,
          price_period: formData.price_period,
          max_productos: formData.max_productos,
          max_recetas: formData.max_recetas,
          features: formData.features,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        });

        if (resultado.exitoso) {
          setMensaje({ tipo: "success", texto: "Plan actualizado exitosamente" });
          await cargarPlanes();
          cancelarEdicion();
        } else {
          setMensaje({ tipo: "error", texto: resultado.error || "Error al actualizar el plan" });
        }
      }
    } catch (error) {
      console.error("Error al guardar plan:", error);
      setMensaje({ tipo: "error", texto: "Error al guardar el plan" });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPlanHandler = async (planId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este plan?")) {
      return;
    }

    try {
      const resultado = await eliminarPlan(planId);
      if (resultado.exitoso) {
        setMensaje({ tipo: "success", texto: "Plan eliminado exitosamente" });
        await cargarPlanes();
      } else {
        setMensaje({ tipo: "error", texto: resultado.error || "Error al eliminar el plan" });
      }
    } catch (error) {
      console.error("Error al eliminar plan:", error);
      setMensaje({ tipo: "error", texto: "Error al eliminar el plan" });
    }
  };

  if (loadingAuth || cargandoRole || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planes</h1>
          <p className="text-muted-foreground mt-1">
            Administra los planes de suscripción disponibles
          </p>
        </div>
        <Button onClick={iniciarCreacion} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Plan
        </Button>
      </div>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            mensaje.tipo === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {mensaje.texto}
        </motion.div>
      )}

      {(editando || modoCrear) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {modoCrear ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Crear Nuevo Plan
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5" />
                    Editar Plan
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Plan</Label>
                  <select
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value as SubscriptionPlanName })
                    }
                    disabled={!modoCrear}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="free">Free</option>
                    <option value="basico">Básico</option>
                    <option value="profesional">Profesional</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Nombre para Mostrar</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Plan Gratuito"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Perfecto para comenzar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_usd">Precio USD</Label>
                  <Input
                    id="price_usd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_usd}
                    onChange={(e) =>
                      setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_bs">Precio BS</Label>
                  <Input
                    id="price_bs"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price_bs}
                    onChange={(e) =>
                      setFormData({ ...formData, price_bs: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_productos">Límite de Productos (-1 = ilimitado)</Label>
                  <Input
                    id="max_productos"
                    type="number"
                    value={formData.max_productos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_productos: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_recetas">Límite de Recetas (-1 = ilimitado)</Label>
                  <Input
                    id="max_recetas"
                    type="number"
                    value={formData.max_recetas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_recetas: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Orden de Visualización</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Plan Activo</Label>
                </div>
              </div>

              {/* Menu visibility */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-1">Visibilidad del Menú</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Controla qué elementos del menú de navegación son visibles para los usuarios de este plan.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(
                    [
                      { id: "menu_dashboard", label: "Dashboard", icon: "📊" },
                      { id: "menu_productos", label: "Productos", icon: "📦" },
                      { id: "menu_recetas", label: "Recetas", icon: "📝" },
                      { id: "menu_clientes", label: "Clientes", icon: "👥" },
                      { id: "menu_ventas", label: "Ventas", icon: "🛒" },
                      { id: "menu_precios", label: "Planes", icon: "💎" },
                      { id: "menu_facturacion", label: "Facturación", icon: "💳" },
                      { id: "menu_perfil", label: "Perfil", icon: "👤" },
                      { id: "menu_configuracion", label: "Configuración", icon: "⚙️" },
                      { id: "menu_unidades", label: "Unidades", icon: "📏" },
                    ] as { id: keyof typeof formData.features; label: string; icon: string }[]
                  ).map(({ id, label, icon }) => (
                    <div
                      key={id}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        formData.features[id]
                          ? "border-primary/40 bg-primary/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <Switch
                        id={id}
                        checked={!!formData.features[id]}
                        onCheckedChange={(checked: boolean) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, [id]: checked },
                          })
                        }
                      />
                      <Label htmlFor={id} className="cursor-pointer text-sm">
                        <span className="mr-1">{icon}</span>
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action features */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-1">Acciones y Funcionalidades</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define qué acciones y funciones pueden realizar los usuarios de este plan.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soporte">Tipo de Soporte</Label>
                    <select
                      id="soporte"
                      value={formData.features.soporte}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, soporte: e.target.value },
                        })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="básico">Básico</option>
                      <option value="estándar">Estándar</option>
                      <option value="prioritario">Prioritario</option>
                      <option value="dedicado">Dedicado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { id: "crear_productos", label: "Crear Productos" },
                        { id: "crear_recetas", label: "Crear Recetas" },
                        { id: "exportar_pdf", label: "Exportar PDF" },
                        { id: "ver_analytics", label: "Analytics" },
                        { id: "exportar_datos", label: "Exportar Datos" },
                        { id: "api_access", label: "Acceso API" },
                        { id: "soporte_prioritario", label: "Soporte Prioritario" },
                      ] as { id: keyof typeof formData.features; label: string }[]
                    ).map(({ id, label }) => (
                      <div key={id} className="flex items-center gap-2">
                        <Switch
                          id={id}
                          checked={!!formData.features[id]}
                          onCheckedChange={(checked: boolean) =>
                            setFormData({
                              ...formData,
                              features: { ...formData.features, [id]: checked },
                            })
                          }
                        />
                        <Label htmlFor={id} className="cursor-pointer text-sm">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={cancelarEdicion}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={guardarPlan} disabled={guardando}>
                  {guardando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {modoCrear ? "Crear Plan" : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planes.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden ${editando === plan.id ? "ring-2 ring-primary" : ""}`}>
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-primary/60`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg ${PLAN_COLORS[plan.name]} flex items-center justify-center text-white`}>
                      {PLAN_ICONS[plan.name]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{plan.name}</p>
                    </div>
                  </div>
                  {plan.is_active ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description || "Sin descripción"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Precio USD
                    </span>
                    <span className="font-semibold">${plan.price_usd}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Precio BS
                    </span>
                    <span className="font-semibold">Bs. {plan.price_bs.toLocaleString("es-VE")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Productos
                    </span>
                    <span className="font-semibold">
                      {plan.max_productos === -1 ? "Ilimitado" : plan.max_productos}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Recetas
                    </span>
                    <span className="font-semibold">
                      {plan.max_recetas === -1 ? "Ilimitado" : plan.max_recetas}
                    </span>
                  </div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {[
                    { key: "exportar_pdf", label: "PDF" },
                    { key: "ver_analytics", label: "Analytics" },
                    { key: "exportar_datos", label: "Exportar" },
                    { key: "api_access", label: "API" },
                    { key: "soporte_prioritario", label: "Soporte+" },
                  ].map(({ key, label }) => {
                    const enabled = (plan.features as any)?.[key];
                    return enabled ? (
                      <Badge key={key} variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {label}
                      </Badge>
                    ) : null;
                  })}
                  {(() => {
                    const f = plan.features as any;
                    const disabledMenus = [
                      "menu_dashboard", "menu_productos", "menu_recetas",
                      "menu_clientes", "menu_ventas",
                      "menu_precios", "menu_facturacion", "menu_perfil",
                      "menu_configuracion", "menu_unidades",
                    ].filter((k) => f[k] === false);
                    return disabledMenus.length > 0 ? (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {disabledMenus.length} menú{disabledMenus.length > 1 ? "s" : ""} oculto{disabledMenus.length > 1 ? "s" : ""}
                      </Badge>
                    ) : null;
                  })()}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => iniciarEdicion(plan)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-500"
                    onClick={() => eliminarPlanHandler(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
