import { chakra, Heading, Text, WrapItem } from "@chakra-ui/react";
import { faTree } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { useAppState } from "../state/app.state";
const Icon = chakra(FontAwesomeIcon);

interface Props {}

const Tree: FC<Props> = ({}) => {
  return (
    <WrapItem>
      <Icon icon={faTree} boxSize={10} color="brand.300" />
    </WrapItem>
  );
};

// avoid SSR for the canvas forest. @see https://github.com/konvajs/react-konva/issues/588#issuecomment-892895335
const NoSSRForest = dynamic(() => import("./CanvasForest"), {
  ssr: false,
});

const Forest: FC<Props> = (props) => {
  const { trees } = useAppState();
  const { t } = useTranslation();

  if (trees.length === 0) {
    return <Text>{t("emptyForest")}</Text>;
  }
  return (
    <>
      <Heading>{t("forest", { count: trees.length })}</Heading>
      <NoSSRForest />
    </>
  );
};

export default Forest;
