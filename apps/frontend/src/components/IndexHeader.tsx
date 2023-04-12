import { Heading, VStack } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import type { FC } from "react";

interface Props {}

const IndexHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <VStack as="header" gap={8}>
      <Heading as="h1" size="4xl" textAlign={"center"}>
        {t("appName")}
      </Heading>
      <Heading
        as="h2"
        size={"lg"}
        textTransform="capitalize"
        textAlign={"center"}
      >
        {t("mission")}
      </Heading>
    </VStack>
  );
};

export default IndexHeader;
