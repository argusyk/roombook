// packages/shared/src/percent.ts
/** Відсоток a від b з округленням половин від нуля, як у PHP round().
 *  Лише для цілих a ≥ 0 і b > 0: тоді обчислення точне. */
export function percentOf(a: number, b: number): number {
  return Math.floor((a * 200 + b) / (2 * b));
}
