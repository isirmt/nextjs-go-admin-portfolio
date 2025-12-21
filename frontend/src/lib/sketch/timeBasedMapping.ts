// 線形的に変化させるマッピング関数
export function linearTimeBasedMapping(
  start: number,
  end: number,
  rate: number,
): number {
  return start + (end - start) * rate;
}

// 二次関数的に変化させるマッピング関数
// 色の変化の近似に使用可能
export function quadraticTimeBasedMapping(
  start: number,
  end: number,
  rate: number,
): number {
  const t = rate;
  return start + (end - start) * t * t;
}
