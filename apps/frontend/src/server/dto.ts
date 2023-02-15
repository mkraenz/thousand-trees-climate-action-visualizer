export type Tree = { x: number; y: number };
export const toTreeDto = (tree: { x: number; y: number; imageId: number }) => ({
  x: tree.x,
  y: tree.y,
  imageId: tree.imageId,
});
