import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { CSSProperties } from "react";

export function SectionText() {
  const { ref: lineAnimationRef, isActive: isLineActive } =
    useInViewAnimation<HTMLDivElement>({
      delayMs: 150,
      threshold: 0.3,
    });

  return (
    <h2
      id="works"
      ref={lineAnimationRef}
      className="relative mt-10 mb-30 flex scroll-mt-10 flex-col items-center gap-4 drop-shadow-2xl drop-shadow-[#a9e4e4]"
    >
      <div className="hidden" aria-hidden="true">
        WORKS
      </div>
      <svg
        className={`animate-iv-line w-96 ${isLineActive ? "is-active" : ""}`}
        viewBox="0 0 852.65 170.1"
        style={totalLineStyle(12, 0.05)}
      >
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="9.92"
          y1="9.92"
          x2="66.01"
          y2="160.18"
          style={lineStyle(0)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="66.01"
          y1="160.18"
          x2="117.35"
          y2="9.92"
          style={lineStyle(1)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="117.35"
          y1="9.92"
          x2="167.94"
          y2="160.18"
          style={lineStyle(2)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="167.94"
          y1="160.18"
          x2="226.19"
          y2="9.92"
          style={lineStyle(3)}
        />
        <path
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
          style={lineStyle(4)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="453.72"
          y1="11.19"
          x2="453.72"
          y2="159.74"
          style={lineStyle(5)}
        />
        <path
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M453.72,11.19s100.12-8.33,100.12,47.5-100.12,44.88-100.12,44.88"
          style={lineStyle(6)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="520.2"
          y1="99.04"
          x2="549.11"
          y2="159.74"
          style={lineStyle(7)}
        />

        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="601.9"
          y1="11"
          x2="601.9"
          y2="159.1"
          style={lineStyle(8)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="704.37"
          y1="11"
          x2="601.9"
          y2="118.83"
          style={lineStyle(9)}
        />
        <line
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="656.43"
          y1="61.46"
          x2="713"
          y2="159.1"
          style={lineStyle(10)}
        />
        <path
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
          style={lineStyle(11)}
        />
      </svg>
      <svg
        className={`animate-iv-line absolute top-0 left-0 w-96 ${isLineActive ? "is-active" : ""}`}
        viewBox="0 0 852.65 170.1"
        style={totalLineStyle(12, 0.1)}
      >
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="9.92"
          y1="9.92"
          x2="66.01"
          y2="160.18"
          style={lineStyle(0)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="66.01"
          y1="160.18"
          x2="117.35"
          y2="9.92"
          style={lineStyle(1)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="117.35"
          y1="9.92"
          x2="167.94"
          y2="160.18"
          style={lineStyle(2)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="167.94"
          y1="160.18"
          x2="226.19"
          y2="9.92"
          style={lineStyle(3)}
        />
        <path
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
          style={lineStyle(4)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="453.72"
          y1="11.19"
          x2="453.72"
          y2="159.74"
          style={lineStyle(5)}
        />
        <path
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M453.72,11.19s100.12-8.33,100.12,47.5-100.12,44.88-100.12,44.88"
          style={lineStyle(6)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="520.2"
          y1="99.04"
          x2="549.11"
          y2="159.74"
          style={lineStyle(7)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="601.9"
          y1="11"
          x2="601.9"
          y2="159.1"
          style={lineStyle(8)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="704.37"
          y1="11"
          x2="601.9"
          y2="118.83"
          style={lineStyle(9)}
        />
        <line
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          x1="656.43"
          y1="61.46"
          x2="713"
          y2="159.1"
          style={lineStyle(10)}
        />
        <path
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
          style={lineStyle(11)}
        />
      </svg>
      <div className="text-[#777] select-none">isirmt&nbsp;の足跡</div>
    </h2>
  );
}

const lineStyle = (index: number) =>
  ({ "--work-line-index": index }) as CSSProperties;

const totalLineStyle = (count: number, staggerSeconds = 0.12) =>
  ({
    "--work-line-total": count,
    "--work-line-stagger": `${staggerSeconds}s`,
  }) as CSSProperties;
