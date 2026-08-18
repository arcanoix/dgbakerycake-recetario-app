"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import useCheckActiveNav from "@/hooks/use-check-active-nav";

interface NavProps {
  isCollapsed: boolean;
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
    variant?: "default" | "ghost";
  }[];
  label?: string;
  onLinkClick?: () => void;
}

export function Nav({ items, isCollapsed, label, onLinkClick }: NavProps) {
  const { checkActiveNav } = useCheckActiveNav();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        data-collapsed={isCollapsed}
        className="group flex flex-col gap-4 py-2"
      >
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {items.map((link, index) => {
            const isActive = checkActiveNav(link.href);
            
            return isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    onClick={onLinkClick}
                    className={cn(
                      buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                      "h-10 w-10",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4">
                  {link.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={index}
                href={link.href}
                onClick={onLinkClick}
                className={cn(
                  buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                  "justify-start h-10 px-3",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
                  !isActive && "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="font-medium">{link.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
