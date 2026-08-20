import Pause from "../shapes/pause";
import Resume from "../shapes/resume";

export default function MediaPauserIcon({
  isPlaying,
  className,
}: {
  isPlaying: boolean;
  className?: string;
}) {
  return isPlaying ? (
    <Pause className={className} />
  ) : (
    <Resume className={className} />
  );
}
