import { useBreakpointValue } from "@chakra-ui/react";
import type { FC } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import type { Tree as ITree } from "../state/app.state";
import { useAppState } from "../state/app.state";

interface Props {}

const Tree: FC<ITree> = ({ x, y, imageId }) => {
  const [image] = useImage(
    `/defaultsize-kenney-foliagepack/foliagePack_${imageId}.png`
  );
  const scale = useBreakpointValue({
    base: 0.2,
    md: 0.3,
  });
  if (!scale) return null;
  return (
    <KonvaImage image={image} x={x} y={y} scale={{ x: scale, y: scale }} />
  );
};

const CanvasForest: FC<Props> = (props) => {
  const { trees } = useAppState();

  // TODO add a render more trees button
  const renderedTrees = Math.min(trees.length, 1000);
  const usedTrees = trees.slice(0, renderedTrees);
  const height = window.innerHeight * 0.95;
  const width = window.innerWidth * 0.99;

  if (!window) return null;
  return (
    <Stage width={width} height={height}>
      <Layer>
        {usedTrees.map((tree, i) => (
          <Tree
            key={i}
            imageId={tree.imageId}
            x={tree.x * width}
            y={tree.y * height}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CanvasForest;
