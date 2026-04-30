"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  requiredFeature?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", requiredFeature: "menu_dashboard" },
  { href: "/productos", label: "Productos", icon: "📦", requiredFeature: "menu_productos" },
  { href: "/inventario", label: "Inventario", icon: "🏪", requiredFeature: "menu_productos" },
  { href: "/recetas", label: "Recetas", icon: "📝", requiredFeature: "menu_recetas" },
  { href: "/clientes", label: "Clientes", icon: "👥", requiredFeature: "menu_clientes" },
  { href: "/ventas", label: "Ventas", icon: "🛒", requiredFeature: "menu_ventas" },
  { href: "/pedidos", label: "Pedidos", icon: "🗓️", requiredFeature: "menu_ventas" },
  { href: "/pricing", label: "Planes", icon: "💎", requiredFeature: "menu_precios" },
  { href: "/billing", label: "Facturación", icon: "💳", requiredFeature: "menu_facturacion" },
  { href: "/perfil", label: "Perfil", icon: "👤", requiredFeature: "menu_perfil" },
  { href: "/configuracion", label: "Configuración", icon: "⚙️", requiredFeature: "menu_configuracion" },
  { href: "/unidades", label: "Unidades", icon: "📏", requiredFeature: "menu_unidades" },
];

const adminItems: NavItem[] = [
  { href: "/admin", label: "Panel Admin", icon: "👑", requiredFeature: "menu_admin" },
  { href: "/admin/planes", label: "Planes", icon: "💎", requiredFeature: "menu_admin" },
  { href: "/admin/blog", label: "Blog", icon: "✍️", requiredFeature: "menu_admin" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { canAccess, getPlanDisplayName, isAdmin } = usePlanAccess();

  if (pathname.startsWith('/auth/') || !user) {
    return null;
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.requiredFeature || canAccess(item.requiredFeature as any)
  );

  const visibleAdminItems = adminItems.filter(
    (item) => !item.requiredFeature || canAccess(item.requiredFeature as any)
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧁</span>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              DGcost
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {(isAdmin || visibleAdminItems.length > 0) && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administración
                </p>
              </div>
              {(isAdmin ? adminItems : visibleAdminItems).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {getPlanDisplayName()}
                </p>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        )}
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-30 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-accent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2 ml-3">
          <span className="text-xl">🧁</span>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            DGcost
          </span>
        </Link>
      </header>

      <div className="hidden lg:block lg:pl-64" />
    </>
  );
};
