import { Button, VStack } from "@chakra-ui/react";
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import AddPlantedTrees from "../components/AddPlantedTrees";
import Forest from "../components/Forest";
import IndexHeader from "../components/IndexHeader";
import { getServerAuthSession } from "../server/auth";
import { UserDb } from "../server/db";
import type { Tree } from "../state/app.state";
import { AppStateProvider } from "../state/app.state";

interface Props {
  trees: Tree[];
}
const Home: NextPage<Props> = (props) => {
  return (
    <AppStateProvider initialTrees={props.trees}>
      <Head>
        <title>Thousand Trees - Climate Action Visualizer</title>
        <meta
          name="description"
          content="Grow your virtual forest to track the trees you've planted."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VStack
        as="main"
        padding={{ md: 20, base: 4 }}
        // override padding top must come after padding
        pt={20}
        gap={8}
      >
        <IndexHeader />
        <AddPlantedTrees />
        <Authentication />
        <Forest />
      </VStack>
    </AppStateProvider>
  );
};

export default Home;

const Authentication: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <Button onClick={sessionData ? () => void signOut() : () => void signIn()}>
      {sessionData ? "Sign out" : "Get Started"}
    </Button>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const defaultResponse = {
    props: {
      trees: [],
    },
  };
  const session = await getServerAuthSession(ctx);
  const userId = session?.user?.id;
  if (!userId) return defaultResponse;

  const userShards = await UserDb.find({ id: userId });
  userShards.sort((a, b) => a.shardId - b.shardId);
  return {
    props: {
      trees: userShards.flatMap(
        (shard) => shard.trees?.map((t) => ({ x: t.x, y: t.y })) || []
      ),
    },
  };
};
