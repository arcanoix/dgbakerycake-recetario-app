import {
  LayoutDashboard,
  Package,
  Store,
  FileText,
  Users,
  ShoppingCart,
  Calendar,
  Gem,
  CreditCard,
  UserCircle,
  Settings,
  Ruler,
  ShieldCheck,
  PenTool,
  DollarSign,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  requiredFeature?: string;
  variant?: "default" | "ghost";
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
  icon?: any;
  requiredFeature?: string;
}

export const sidebarData = {
  navItems: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      requiredFeature: "menu_dashboard",
    },
    {
      title: "Productos",
      href: "/productos",
      icon: Package,
      requiredFeature: "menu_productos",
    },
    {
      title: "Inventario",
      href: "/inventario",
      icon: Store,
      requiredFeature: "menu_productos",
    },
    {
      title: "Recetas",
      href: "/recetas",
      icon: FileText,
      requiredFeature: "menu_recetas",
    },
    {
      title: "Gastos Fijos",
      href: "/gastos-fijos",
      icon: DollarSign,
      requiredFeature: "menu_recetas",
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: Users,
      requiredFeature: "menu_clientes",
    },
    {
      title: "Ventas",
      href: "/ventas",
      icon: ShoppingCart,
      requiredFeature: "menu_ventas",
    },
    {
      title: "Pedidos",
      href: "/pedidos",
      icon: Calendar,
      requiredFeature: "menu_ventas",
    },
    {
      title: "Planes",
      href: "/pricing",
      icon: Gem,
      requiredFeature: "menu_precios",
    },
    {
      title: "Facturación",
      href: "/billing",
      icon: CreditCard,
      requiredFeature: "menu_facturacion",
    },
    {
      title: "Unidades",
      href: "/unidades",
      icon: Ruler,
      requiredFeature: "menu_unidades",
    },
    {
      title: "Perfil",
      href: "/perfil",
      icon: UserCircle,
      requiredFeature: "menu_perfil",
    },
    {
      title: "Configuración",
      href: "/configuracion",
      icon: Settings,
      requiredFeature: "menu_configuracion",
    },
  ],
  adminItems: [
    {
      title: "Panel Admin",
      href: "/admin",
      icon: ShieldCheck,
      requiredFeature: "menu_admin",
    },
    {
      title: "Planes Admin",
      href: "/admin/planes",
      icon: Gem,
      requiredFeature: "menu_admin",
    },
    {
      title: "Blog Admin",
      href: "/admin/blog",
      icon: PenTool,
      requiredFeature: "menu_admin",
    },
  ],
};
