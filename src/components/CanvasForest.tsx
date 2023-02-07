import type { FC } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { useAppState } from "../state/app.state";

interface Props {}

const scale = 0.3;
const Tree: FC<{ x: number; y: number }> = ({ x, y }) => {
  const [image] = useImage(
    "/defaultsize-kenney-foliagepack/foliagePack_004.png"
  );
  return (
    <KonvaImage image={image} x={x} y={y} scale={{ x: scale, y: scale }} />
  );
};

const CanvasForest: FC<Props> = (props) => {
  const { trees } = useAppState();

  // TODO add a render more trees button
  const renderedTrees = Math.min(trees.length, 1000);
  const usedTrees = trees.slice(0, renderedTrees);

  if (!window) return null;
  return (
    <Stage width={window.innerWidth * 0.95} height={window.innerHeight * 0.95}>
      <Layer>
        {usedTrees.map((tree, i) => (
          <Tree
            key={i}
            x={tree.x * window.innerWidth}
            y={tree.y * window.innerHeight}
            // radius={20}
            // fill="orange"
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CanvasForest;
