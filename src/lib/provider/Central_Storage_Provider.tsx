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
  privateWorkspaces: Workspace[] | null;
  setPrivateWorkspaces: React.Dispatch<React.SetStateAction<Workspace[] | null>>;
  collaboratingWorkspaces: Workspace[] | null;
  setCollaboratingWorkspaces: React.Dispatch<React.SetStateAction<Workspace[] | null>>;
  sharedWorkspaces: Workspace[] | null;
  setSharedWorkspaces: React.Dispatch<React.SetStateAction<Workspace[] | null>>;
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
  privateWorkspaces: null,
  setPrivateWorkspaces: () => {},
  collaboratingWorkspaces: null,
  setCollaboratingWorkspaces: () => {},
  sharedWorkspaces: null,
  setSharedWorkspaces: () => {},
});

export const CentralStorage: FC<ChildrenProp> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const[workspaces, setWorkspaces] = useState<Workspace[]|null>(null);
  const[privateWorkspaces, setPrivateWorkspaces] = useState<Workspace[]|null>(null);
  const[collaboratingWorkspaces, setCollaboratingWorkspaces] = useState<Workspace[]|null>(null);
  const[sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]|null>(null);

  return (
    <TotalContext.Provider value={{ user, setUser, subscription, setSubscription, workspaces, setWorkspaces,privateWorkspaces,setPrivateWorkspaces, collaboratingWorkspaces ,setCollaboratingWorkspaces, sharedWorkspaces, setSharedWorkspaces}}>
      {children}
    </TotalContext.Provider>
  );
};

export { TotalContext };
