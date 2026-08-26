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
                      "h-11 w-11 rounded-xl text-slate-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-800",
                      isActive && "bg-[#17202d] text-amber-300 hover:bg-[#17202d] hover:text-amber-300 shadow-sm"
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
                  "h-11 justify-start rounded-xl px-3 text-sm transition-all duration-200",
                  isActive && "bg-[#17202d] text-white hover:bg-[#17202d] hover:text-white shadow-sm",
                  !isActive && "text-slate-500 hover:bg-amber-50 hover:text-[#17202d]"
                )}
              >
                <link.icon className={cn("mr-3 h-4 w-4", isActive ? "text-amber-300" : "text-slate-400")} />
                <span className="font-semibold">{link.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
