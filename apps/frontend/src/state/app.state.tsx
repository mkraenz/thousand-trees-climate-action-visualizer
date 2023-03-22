import { useSession } from "next-auth/react";
import type { FC, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";
import { randomInt, range, ySort } from "../utils/mymath";

const MAX_IMAGE_ID = 13;
const STORAGE_KEY = "tstt:plantedTrees";

export interface Tree {
  x: number;
  y: number;
  imageId: number;
}

export type AppContext = {
  trees: Tree[];
  addTrees: (newlyPlantedTrees: number) => void;
  setTrees: (trees: Tree[]) => void;
};

const AppContext = createContext<AppContext>({
  trees: [],
  addTrees: () => undefined,
  setTrees: () => undefined, // TODO do we have to expose this?
});

const notAuthenticatedId = "n/A";

export const AppStateProvider: FC<{
  children: ReactNode | ReactNode[];
  initialTrees: Tree[];
}> = ({ children, initialTrees }) => {
  const session = useSession();

  const createMeMutation = api.users.createMe.useMutation(); // only called when authenticated

  const meQuery = api.users.me.useQuery(undefined, {
    initialData: {
      user: {
        id: session.data?.user?.id || notAuthenticatedId,
        trees: initialTrees.sort(ySort),
      },
    },
    enabled: session.data?.user?.id !== undefined,
    retry(failureCount, error) {
      const maxRetries = 5;
      const isUserNotFoundError = error.data?.httpStatus === 404;
      if (isUserNotFoundError) return false; // don't retry
      return failureCount < maxRetries;
    },
    onError: (error) => {
      const isUserNotFoundError = error.data?.httpStatus === 404;
      if (isUserNotFoundError) {
        const existingTrees = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        ) as Tree[];
        createMeMutation.mutate(
          { trees: existingTrees },
          {
            onSuccess: async () => {
              await meQuery.refetch();
              // clear local storage on successful signup and sync
              localStorage.removeItem(STORAGE_KEY);
            },
          }
        );
      }
    },
  });
  const upsertTreesMutation = api.users.upsert.useMutation();
  const [trees, setTrees] = useState<Tree[]>(meQuery.data.user.trees);
  useEffect(() => {
    // using initialTrees because it does not change once the page is loaded
    if (initialTrees.length > 0) return; // we have data, so don't override it

    const treesFromLocalStorage = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    ) as Tree[];
    if (treesFromLocalStorage.length > 0) setTrees(treesFromLocalStorage);
  }, [setTrees, initialTrees]);

  const addTrees = (newlyPlantedTrees: number) => {
    const newTrees: Tree[] = range(newlyPlantedTrees).map((_) => ({
      x: Math.random() * 0.9 + 0.05, // 5% padding on each side
      y: Math.random() * 0.9 + 0.05,
      imageId: randomInt(MAX_IMAGE_ID + 1),
    }));
    const allTrees = [...trees, ...newTrees].sort(ySort);
    if (session.status === "authenticated")
      upsertTreesMutation.mutate({
        trees: allTrees,
      });
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrees));
    setTrees(allTrees);
  };

  return (
    <AppContext.Provider value={{ trees, addTrees, setTrees }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const value = useContext(AppContext);
  return {
    trees: value.trees,
    addTrees: value.addTrees,
    setTrees: value.setTrees,
  };
};
