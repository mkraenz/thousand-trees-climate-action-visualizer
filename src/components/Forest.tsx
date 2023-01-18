import { chakra, Heading, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { faTree } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useAppState } from "../state/app.state";
import { range } from "../utils/mymath";
const Icon = chakra(FontAwesomeIcon);

interface Props {}

const Tree: FC<Props> = ({}) => {
  return (
    <WrapItem>
      <Icon icon={faTree} boxSize={10} color="brand.300" />
    </WrapItem>
  );
};

const Forest: FC<Props> = (props) => {
  const { trees } = useAppState();

  if (trees.length === 0) {
    return <Text>Plant trees and your forest will show up here.</Text>;
  }
  // TODO add a render more trees button
  const renderedTrees = Math.min(trees.length, 1000);
  //   return <Text>Hi</Text>
  return (
    <>
      <Heading>
        You&apos;ve planted {trees.length} trees so far. Great job!
      </Heading>
      <Wrap>
        {range(renderedTrees).map((i) => (
          <Tree key={i} />
        ))}
      </Wrap>
    </>
  );
};

export default Forest;
