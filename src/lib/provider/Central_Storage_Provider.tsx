"use client";

import { createContext, useState, ReactNode, FC } from 'react';
import { User, Subscription } from '../types'; // Import your types
import { Workspace } from '../types';


interface ContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  subscription: Subscription | null;
  setSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
  workspaces: Workspace[] | null;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[] | null>>;
}

interface ChildrenProp {
  children: ReactNode;
}

// Create TotalContext with the combined user and subscription state
const TotalContext = createContext<ContextProps>({
  user: null,
  setUser: () => {},
  subscription: null,
  setSubscription: () => {},
  workspaces: null,
  setWorkspaces: () => {},
});

export const CentralStorage: FC<ChildrenProp> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const[workspaces, setWorkspaces] = useState<Workspace[]|null>(null);

  return (
    <TotalContext.Provider value={{ user, setUser, subscription, setSubscription, workspaces, setWorkspaces}}>
      {children}
    </TotalContext.Provider>
  );
};

export { TotalContext };
