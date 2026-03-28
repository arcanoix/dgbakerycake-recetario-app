import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "icon" | "full";
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: "text-lg", fullWidth: 200 },
  md: { width: 40, height: 40, textSize: "text-xl", fullWidth: 280 },
  lg: { width: 120, height: 120, textSize: "text-3xl", fullWidth: 320 },
};

export const Logo = ({ size = "md", showText = true, href = "/", variant = "icon" }: LogoProps) => {
  const { width, height, textSize, fullWidth } = sizeMap[size];

  const isFull = variant === "full";
  const imgSrc = "/logo.png"; // Usar siempre logo.png para evitar problemas de tamaño
  const imgClass = isFull ? "h-auto w-auto max-w-[200px]" : "rounded-full";

  const logoContent = (
    <div className="flex items-center gap-3">
      <img
        src={imgSrc}
        alt="DGcost"
        width={isFull ? fullWidth : width}
        height={isFull ? undefined : height}
        className={imgClass}
      />
      {!isFull && showText && (
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
