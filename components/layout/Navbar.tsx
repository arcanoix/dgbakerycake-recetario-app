"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();

  const navItems = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/productos", label: "Productos", icon: "📦" },
    { href: "/recetas", label: "Recetas", icon: "📝" },
    { href: "/pricing", label: "Planes", icon: "💎" },
    { href: "/billing", label: "Facturación", icon: "💳" },
    { href: "/configuracion", label: "Configuración", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" showText={false} href="/" />

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-red-600 text-white"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <span className="mr-2">👑</span>
                  Admin
                </Link>
              )}
              
              {/* User Info & Logout */}
              <div className="flex items-center space-x-2 ml-4 border-l pl-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button onClick={signOut} variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              aria-label="Toggle menu"
            >
            <svg
              className="w-6 h-6"
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
            {navItems.map((item) => (
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
