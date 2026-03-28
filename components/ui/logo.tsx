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

  const logoContent = (
    <div className="flex items-center gap-2">
      {/* Simple text logo with gradient - works 100% */}
      <span className={`font-bold ${textSize} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
        {isFull ? '🧁 DGcost' : 'DGcost'}
      </span>
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
