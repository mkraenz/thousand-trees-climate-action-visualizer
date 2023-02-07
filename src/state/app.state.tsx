import { useSession } from "next-auth/react";
import type { FC, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { api } from "../utils/api";
import { range, ySort } from "../utils/mymath";

export const STORAGE_KEY = "tstt:plantedTrees";

export interface Tree {
  x: number;
  y: number;
}

export type AppContext = {
  trees: Tree[];
  addTrees: (newlyPlantedTrees: number) => void;
  setTrees: (trees: Tree[]) => void;
};

const AppContext = createContext<AppContext>({
  trees: [],
  addTrees: () => undefined,
  setTrees: () => undefined,
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
        createMeMutation.mutate(
          { trees: [] },
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          { onSuccess: () => meQuery.refetch() }
        );
      }
    },
  });
  const upsertTreesMutation = api.users.upsert.useMutation();
  const [trees, setTrees] = useState<Tree[]>(meQuery.data?.user?.trees || []);

  const addTrees = (newlyPlantedTrees: number) => {
    const newTrees: Tree[] = range(newlyPlantedTrees).map((_) => ({
      x: Math.random(),
      y: Math.random(),
    }));
    const allTrees = [...trees, ...newTrees].sort(ySort);
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrees));
    upsertTreesMutation.mutate({ trees: allTrees });
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
