export const range = (n: number) => [...Array(n).keys()];

export const ySort = (a: { y: number }, b: { y: number }) => a.y - b.y;
