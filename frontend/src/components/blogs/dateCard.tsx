import { lineSeedJp } from "@/lib/fonts";
import { getJapaneseDateParts } from "@/lib/date";

export default function DateCard({ date }: { date: string }) {
  const { year, month, day } = getJapaneseDateParts(date);

  return (
    <time dateTime={date}>
      <div title={date} className="flex items-center">
        <span
          className={`${lineSeedJp.className} w-6 translate-y-4 -rotate-90 text-sm leading-4`}
        >
          {year}
        </span>
        <div
          className={`${lineSeedJp.className} mr-4 flex size-16 flex-col items-center justify-center gap-0.5 rounded-xl bg-gray-100 text-center transition-colors`}
        >
          <div className="text-sm leading-4">{month}</div>
          <div className="text-2xl leading-6">{day}</div>
        </div>
      </div>
    </time>
  );
}
