import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "icon" | "full";
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: "text-lg", fullWidth: 100, fullHeight: 32 },
  md: { width: 40, height: 40, textSize: "text-xl", fullWidth: 140, fullHeight: 40 },
  lg: { width: 120, height: 120, textSize: "text-3xl", fullWidth: 320, fullHeight: 120 },
};

export const Logo = ({ size = "md", showText = true, href = "/", variant = "icon" }: LogoProps) => {
  const { width, height, textSize, fullWidth, fullHeight } = sizeMap[size];

  const isFull = variant === "full";
  const imgSrc = isFull ? "/logo-largo.png" : "/logo.png";
  const imgWidth = isFull ? fullWidth : width;
  const imgHeight = isFull ? fullHeight : height;
  const imgClass = isFull ? "object-contain" : "rounded-full object-cover";

  const logoContent = (
    <div className="flex items-center gap-3">
      <div className={`relative ${isFull ? 'w-[280px] h-[80px]' : 'w-[40px] h-[40px]'}`}>
        <Image
          src={imgSrc}
          alt="DGcost"
          fill={!isFull}
          width={isFull ? 280 : undefined}
          height={isFull ? 80 : undefined}
          className={`${imgClass} ${isFull ? "object-contain" : "object-cover"}`}
          unoptimized={isFull}
        />
      </div>
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
