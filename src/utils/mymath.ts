export const range = (n: number) => [...Array(n).keys()];

export const ySort = (a: { y: number }, b: { y: number }) => a.y - b.y;

/** excluding max
 * @example randomInt(0, 10) // 0-9
 * @example randomInt(10) // 0-9
 * @example randomInt(10, 20) // 10-19
 */
export const randomInt = (minOrMax: number, max?: number) => {
  const usedMax = max ?? minOrMax;
  const offset = max ? minOrMax : 0;
  return Math.floor(Math.random() * usedMax) + offset;
};
