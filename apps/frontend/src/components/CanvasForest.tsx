import { useBreakpointValue } from "@chakra-ui/react";
import type { FC } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import type { Tree as ITree } from "../state/app.state";
import { useAppState } from "../state/app.state";

interface Props {}

function easeInExpo(x: number): number {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

const Tree: FC<ITree & { originalY: number }> = ({
  x,
  y,
  imageId,
  originalY,
}) => {
  const [image] = useImage(
    `/defaultsize-kenney-foliagepack/foliagePack_${imageId}.png`
  );
  const scale = useBreakpointValue({
    base: 0.2,
    md: 0.3,
  });
  if (!scale) return null;
  console.log(originalY);
  const scaleFactor = 0.69 + 2.4 * easeInExpo(originalY) + originalY ** 2 * 0.1;
  // const scaleFactor = easeInExpo(originalY) * 5 + originalY * 0.5; // other idea
  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      scale={{ x: scale * scaleFactor, y: scale * scaleFactor }}
    />
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
            originalY={tree.y}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CanvasForest;
