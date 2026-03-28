import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "icon" | "full";
}

const sizeMap = {
  sm: { textSize: "text-lg" },
  md: { textSize: "text-xl" },
  lg: { textSize: "text-3xl" },
};

export const Logo = ({ size = "md", showText = true, href = "/", variant = "icon" }: LogoProps) => {
  const { textSize } = sizeMap[size];
  
  const isFull = variant === "full";
  const logoSrc = isFull ? "/logo-completo.png" : "/logo.png";

  const logoContent = (
    <div className="flex items-center gap-2">
      {/* Image container with forced display */}
      <div className="flex-shrink-0">
        <img
          src={logoSrc}
          alt="DGcost"
          width={isFull ? 180 : 40}
          height={isFull ? 50 : 40}
          className={isFull ? "h-12 w-auto" : "h-10 w-10 rounded-full"}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              const textSpan = parent.querySelector('.logo-text-fallback') as HTMLElement;
              if (textSpan) textSpan.style.display = 'inline';
            }
          }}
        />
        {/* Fallback text - always rendered but hidden by default */}
        <span 
          className={`logo-text-fallback font-bold ${textSize} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}
          style={{ display: 'none' }}
        >
          DGcost
        </span>
      </div>
      
      {/* Show text beside logo for icon variant */}
      {variant === "icon" && showText && (
        <span className={`font-bold ${textSize} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          DGcost
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
