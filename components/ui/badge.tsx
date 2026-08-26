import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#17202d] text-amber-300 hover:bg-black shadow-sm",
        secondary:
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "border-amber-200 text-amber-800",
        success: "border-transparent bg-green-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
