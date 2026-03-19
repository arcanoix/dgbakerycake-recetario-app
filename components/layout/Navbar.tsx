"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface NavSection {
  label: string;
  icon: string;
  items: { href: string; label: string; icon: string }[];
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();

  // Ocultar navbar en rutas de autenticación
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  const navSections: NavSection[] = [
    {
      label: "Gestión",
      icon: "📊",
      items: [
        { href: "/productos", label: "Productos", icon: "📦" },
        { href: "/recetas", label: "Recetas", icon: "📝" },
      ],
    },
    {
      label: "Configuración",
      icon: "⚙️",
      items: [
        { href: "/unidades", label: "Unidades", icon: "�" },
        { href: "/categorias", label: "Categorías", icon: "🏷️" },
        { href: "/configuracion", label: "General", icon: "⚙️" },
      ],
    },
  ];

  const topNavItems: NavItem[] = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/pricing", label: "Planes", icon: "💎" },
    { href: "/billing", label: "Facturación", icon: "💳" },
  ];

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" showText={false} href="/" />
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="flex items-center space-x-1 bg-gray-50/50 rounded-full px-2 py-1.5">
                {topNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`text-base transition-transform duration-200 ${
                        isActive(item.href) ? "scale-110" : "group-hover:scale-110"
                      }`}>
                        {item.icon}
                      </span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </span>
                  </Link>
                ))}

                {/* Dropdown Sections */}
                {navSections.map((section) => {
                  const hasActiveItem = section.items.some(item => isActive(item.href));
                  return (
                    <div key={section.label} className="relative group">
                      <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          hasActiveItem
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{section.icon}</span>
                          <span className="hidden lg:inline">{section.label}</span>
                          <span className="text-xs">▼</span>
                        </span>
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              isActive(item.href)
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive("/admin")
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`text-base transition-transform duration-200 ${
                        isActive("/admin") ? "scale-110" : "group-hover:scale-110"
                      }`}>
                        👑
                      </span>
                      <span className="hidden lg:inline">Admin</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* User Info & Actions */}
          {user && (
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700 max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
              <Button 
                onClick={signOut} 
                variant="outline" 
                size="sm"
                className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Cerrar Sesión
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {topNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Collapsible Sections Mobile */}
            {navSections.map((section) => (
              <div key={section.label} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span>
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </span>
                  <span className={`text-xs transition-transform ${
                    openSections[section.label] ? "rotate-180" : ""
                  }`}>▼</span>
                </button>
                {openSections[section.label] && (
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* User Info & Logout Mobile */}
            <div className="border-t pt-4 mt-4">
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {user.email}
              </div>
              <Button onClick={signOut} variant="outline" className="w-full">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
