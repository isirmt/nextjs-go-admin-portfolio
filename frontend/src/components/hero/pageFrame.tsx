import type { ComponentPropsWithoutRef } from "react";

type HeroPageFrameProps = ComponentPropsWithoutRef<"div">;

export default function HeroPageFrame({
  children,
  className,
  ...props
}: HeroPageFrameProps) {
  return (
    <div
      {...props}
      className={`absolute inset-0 size-full overflow-hidden ${className ?? ""}`}
      data-hero-page
    >
      {children}
    </div>
  );
}
