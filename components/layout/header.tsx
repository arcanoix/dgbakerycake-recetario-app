"use client";

import { Menu, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { Breadcrumbs } from "./breadcrumbs";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const handleStartTour = () => {
    if (typeof window !== 'undefined' && (window as any).startAppTour) {
      (window as any).startAppTour();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8">
        {/* Menú móvil */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <Sidebar 
              isCollapsed={false} 
              setIsCollapsed={() => {}} 
              onLinkClick={() => setOpen(false)}
              className="!static !translate-x-0 h-full w-full border-none" 
            />
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <div className="flex-1 ml-2 md:ml-0">
          <Breadcrumbs />
        </div>

        {/* User Navigation */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleStartTour}
                  className="rounded-full h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Iniciar Tour de Bienvenida</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                ¿Necesitas ayuda? Inicia el tour.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
