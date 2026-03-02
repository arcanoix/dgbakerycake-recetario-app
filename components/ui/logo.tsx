import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: "text-lg" },
  md: { width: 40, height: 40, textSize: "text-xl" },
  lg: { width: 120, height: 120, textSize: "text-3xl" },
};

export const Logo = ({ size = "md", showText = true, href = "/" }: LogoProps) => {
  const { width, height, textSize } = sizeMap[size];

  const logoContent = (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="DG Bakery Cake"
        width={width}
        height={height}
        className="rounded-full"
        priority
      />
      {showText && (
        <span className={`font-bold ${textSize} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          DG Bakery Cake
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
