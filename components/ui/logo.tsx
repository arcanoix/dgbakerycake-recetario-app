import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "icon" | "full";
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 48, text: "text-3xl" },
};

// Logo Icon SVG - Chef hat with cupcake elements
const LogoIcon = ({ size = 32, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Chef hat base */}
    <path
      d="M10 28C10 28 10 32 12 34H36C38 32 38 28 38 28V20H10V28Z"
      fill="url(#gradient1)"
    />
    {/* Chef hat top - left puff */}
    <circle cx="14" cy="16" r="6" fill="url(#gradient2)" />
    {/* Chef hat top - center puff */}
    <circle cx="24" cy="12" r="7" fill="url(#gradient2)" />
    {/* Chef hat top - right puff */}
    <circle cx="34" cy="16" r="6" fill="url(#gradient2)" />
    {/* Cupcake cherry on top */}
    <circle cx="24" cy="10" r="2.5" fill="#EC4899" />
    {/* Chef hat band */}
    <rect x="10" y="20" width="28" height="3" fill="url(#gradient3)" rx="1" />
    {/* Decorative lines */}
    <path
      d="M16 24L16 30M24 24L24 30M32 24L32 30"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.3"
    />
    
    <defs>
      <linearGradient id="gradient1" x1="10" y1="20" x2="38" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F3F4F6" />
        <stop offset="1" stopColor="#E5E7EB" />
      </linearGradient>
      <linearGradient id="gradient2" x1="14" y1="10" x2="34" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAFAFA" />
        <stop offset="1" stopColor="#F3F4F6" />
      </linearGradient>
      <linearGradient id="gradient3" x1="10" y1="20" x2="38" y2="23" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
    </defs>
  </svg>
);

// Full Logo with text
const LogoFull = ({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) => {
  const { icon, text } = sizeMap[size];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon size={icon} />
      <div className="flex flex-col">
        <span className={cn("font-black tracking-tight uppercase leading-none", text)}>
          <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            DGcost
          </span>
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
          Repostería
        </span>
      </div>
    </div>
  );
};

export const Logo = ({ 
  size = "md", 
  showText = true, 
  href, 
  variant = "icon",
  className 
}: LogoProps) => {
  const logoContent = variant === "full" || showText ? (
    <LogoFull size={size} className={className} />
  ) : (
    <LogoIcon size={sizeMap[size].icon} className={className} />
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

// Export individual components for flexibility
export { LogoIcon, LogoFull };
