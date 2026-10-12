export const JAPAN_TIME_ZONE = "Asia/Tokyo";

const longDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JAPAN_TIME_ZONE,
  dateStyle: "long",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JAPAN_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const datePartsFormatter = new Intl.DateTimeFormat("ja-JP-u-ca-gregory", {
  timeZone: JAPAN_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

// "2026年10月12日"
export const formatJapaneseLongDate = (value: string) =>
  longDateFormatter.format(new Date(value));

// "2026/10/12 20:00"
export const formatJapaneseDateTime = (
  value: string | null,
  emptyValue = "",
) => (value ? dateTimeFormatter.format(new Date(value)) : emptyValue);

// { year: "2026", month: "10", day: "12" }
export const getJapaneseDateParts = (value: string) => {
  const parts = datePartsFormatter.formatToParts(new Date(value));
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
};
