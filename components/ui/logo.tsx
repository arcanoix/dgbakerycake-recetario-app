import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "icon" | "full";
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: "text-lg" },
  md: { width: 40, height: 40, textSize: "text-xl" },
  lg: { width: 120, height: 120, textSize: "text-3xl" },
};

export const Logo = ({ size = "md", showText = true, href = "/", variant = "icon" }: LogoProps) => {
  const { width, height, textSize } = sizeMap[size];

  const isFull = variant === "full";
  const imgSrc = isFull ? "/logo-largo.png" : "/logo.png";
  const imgClass = isFull ? "h-auto w-auto max-w-[180px]" : "rounded-full w-10 h-10";

  const logoContent = (
    <div className="flex items-center gap-2">
      {/* Logo image with fallback to text */}
      <div className="relative flex items-center">
        <img
          src={imgSrc}
          alt="DGcost"
          width={isFull ? 180 : width}
          height={isFull ? 50 : height}
          className={imgClass}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
          }}
        />
        {/* Fallback: Show just text if image fails */}
        <span 
          className={`font-bold ${textSize} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap`}
        >
          DGcost
        </span>
      </div>
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
