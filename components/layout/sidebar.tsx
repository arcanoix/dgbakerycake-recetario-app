"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";
import { Nav } from "./nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sidebarData } from "./data/sidebar-data";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import Link from "next/link";
import { LogoIcon, LogoFull } from "@/components/ui/logo";
import { getAppVersion } from "@/lib/version";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onLinkClick?: () => void;
}

export function Sidebar({ className, isCollapsed, setIsCollapsed, onLinkClick }: SidebarProps) {
  const [navOpened, setNavOpened] = useState(false);
  const { canAccess, isAdmin } = usePlanAccess();

  /* Cerrar sidebar al cambiar de ruta en móvil */
  useEffect(() => {
    if (navOpened) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navOpened]);

  const visibleNavItems = sidebarData.navItems.filter(
    (item) => !item.requiredFeature || canAccess(item.requiredFeature as any)
  );

  const visibleAdminItems = sidebarData.adminItems.filter(
    (item) => !item.requiredFeature || canAccess(item.requiredFeature as any)
  );

  return (
    <aside
      className={cn(
        `fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background transition-[width] duration-300 md:sticky flex flex-col`,
        isCollapsed ? "md:w-16" : "md:w-64",
        navOpened ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}
    >
      {/* Botón para colapsar en Desktop */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        size="icon"
        variant="outline"
        className="absolute -right-3 top-20 z-50 hidden h-6 w-6 rounded-full md:flex"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </Button>

      {/* Header del Sidebar */}
      <div className={cn("flex h-16 items-center justify-center px-4 py-4 transition-all duration-300", isCollapsed && "px-2")}>
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {isCollapsed ? (
            <LogoIcon size={32} />
          ) : (
            <LogoFull size="sm" />
          )}
        </Link>
      </div>

      {/* Navegación */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden scrollbar-thin">
        <Nav
          items={visibleNavItems}
          isCollapsed={isCollapsed}
          label="Menú Principal"
          onLinkClick={onLinkClick}
        />
        
        {(isAdmin || visibleAdminItems.length > 0) && (
          <>
            <div className={cn("px-4 py-2 mt-2 transition-opacity duration-300", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Administración
              </p>
            </div>
            <Nav
              items={isAdmin ? sidebarData.adminItems : visibleAdminItems}
              isCollapsed={isCollapsed}
              label="Admin"
              onLinkClick={onLinkClick}
            />
          </>
        )}
      </div>

      {/* Overlay para móvil */}
      {navOpened && (
        <div
          className="fixed inset-0 z-[-1] bg-black/50 md:hidden"
          onClick={() => setNavOpened(false)}
        />
      )}

      {/* Versión del sistema */}
      <div className={cn(
        "mt-auto border-t p-4 transition-all duration-300",
        isCollapsed ? "px-2 text-center" : "px-4"
      )}>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {isCollapsed ? getAppVersion().split('-')[1] || 'v' : `Versión: ${getAppVersion()}`}
        </p>
      </div>
    </aside>
  );
}
