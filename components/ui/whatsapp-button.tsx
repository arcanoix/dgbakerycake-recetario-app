"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  className?: string;
  groupUrl?: string;
}

export const WhatsAppButton = ({ 
  className,
  groupUrl = "https://chat.whatsapp.com/JzQG89bgWuc8cB7OOwZYsa"
}: WhatsAppButtonProps) => {
  return (
    <motion.a
      href={groupUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "h-14 w-14 rounded-full",
        "bg-[#25D366] hover:bg-[#20BA5A]",
        "text-white shadow-lg hover:shadow-2xl",
        "transition-all duration-300",
        "group",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
    >
      {/* Pulse animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />
      
      {/* Icon */}
      <MessageCircle className="h-7 w-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Únete al grupo de WhatsApp
      </span>
    </motion.a>
  );
};
