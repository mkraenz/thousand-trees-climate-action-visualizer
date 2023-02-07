export type Tree = { x: number; y: number };
export const toTreeDto = (tree: { x: number; y: number }) => ({
  x: tree.x,
  y: tree.y,
});
