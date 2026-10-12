import { isValidElement, type ReactNode } from "react";

export const getHeadingText = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map((child) => getHeadingText(child)).join("");
  }
  if (isValidElement(children)) {
    return getHeadingText(
      (children.props as { children?: ReactNode }).children,
    );
  }
  return "";
};

export const createHeadingId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[!"$%&'()*+,./:;<=>?@[\\\]^_{|}]/g, "")
    .replace(/\s+/g, "-");

export const getHeadingId = (children: ReactNode) =>
  createHeadingId(getHeadingText(children));
