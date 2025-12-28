function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  if (![3, 6].includes(h.length)) throw new Error("Invalid hex");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

export function lightenHex(hex: string, amount = 0.3) {
  const a = Math.max(0, Math.min(1, amount));
  const { r, g, b } = hexToRgb(hex);
  const nr = r + (255 - r) * a;
  const ng = g + (255 - g) * a;
  const nb = b + (255 - b) * a;
  return rgbToHex(nr, ng, nb);
}
