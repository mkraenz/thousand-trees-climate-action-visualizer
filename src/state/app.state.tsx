import type { FC, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { range } from "../utils/mymath";

export const STORAGE_KEY = "tstt:plantedTrees";

interface Tree {
  x: number;
  y: number;
}

interface AppState {
  trees: Tree[];
}

export type AppContext = {
  trees: Tree[];
  addTrees: (newlyPlantedTrees: number) => void;
};

const AppContext = createContext<AppContext>({
  trees: [],
  addTrees: () => undefined,
});

export const AppStateProvider: FC<{ children: ReactNode | ReactNode[] }> = ({
  children,
}) => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const addTrees = (newlyPlantedTrees: number) => {
    const newTrees: Tree[] = range(newlyPlantedTrees).map((_) => ({
      x: Math.random(),
      y: Math.random(),
    }));
    const allTrees = [...trees, ...newTrees];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrees));
    setTrees(allTrees);
  };

  // on component did mount
  useEffect(() => {
    const plantedTrees = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    ) as Tree[];
    setTrees(plantedTrees);
  }, []);

  return (
    <AppContext.Provider value={{ trees, addTrees }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const value = useContext(AppContext);
  return { trees: value.trees, addTrees: value.addTrees };
};
