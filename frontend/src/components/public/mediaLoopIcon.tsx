import Loop from "../shapes/loop";
import NoLoop from "../shapes/noLoop";

export default function MediaLoopIcon({
  isLoop,
  className,
}: {
  isLoop: boolean;
  className?: string;
}) {
  return isLoop ? (
    <Loop className={className} />
  ) : (
    <NoLoop className={className} />
  );
}
