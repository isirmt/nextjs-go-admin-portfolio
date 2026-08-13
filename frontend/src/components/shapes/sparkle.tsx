type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function Sparkle({ className, children }: Props) {
  return (
    <div
      className={`[clip-path:shape(from_50%_0%,curve_to_100%_50%_with_52.5%_27.5%_from_origin/62.5%_42.5%_from_origin,curve_to_50%_100%_with_62.5%_57.5%_from_origin/52.5%_72.5%_from_origin,curve_to_0%_50%_with_47.5%_72.5%_from_origin/37.5%_57.5%_from_origin,curve_to_50%_0%_with_37.5%_42.5%_from_origin/47.5%_27.5%_from_origin,close)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
