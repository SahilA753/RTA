'use client'
import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '../ui/scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import UserCard from './user-card';
import { User, Workspace, Subscription } from '@/lib/types';
import { TotalContext } from '@/lib/provider/Central_Storage_Provider';

interface UserResponse {
  user: User;
  workspace?: Workspace | null;
  subscription?: Subscription | null;
}

interface SidebarProps {
  params: { workspaceId: string };
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ params, className }) => {
  const { user, setUser, subscription, setSubscription, workspaces, setWorkspaces, privateWorkspaces,collaboratingWorkspaces,sharedWorkspaces,setCollaboratingWorkspaces,setPrivateWorkspaces,setSharedWorkspaces } = useContext(TotalContext);
  const [workspaceFolders, setWorkspaceFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!user) return null; // Handle null user case early

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        
        if (!session || !session.user?.email) {
          router.push('/login');
          return;
        }

      } catch (err) {
        setError((err as Error).message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.workspaceId, router, user?.id, setWorkspaces]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <aside
      className={twMerge(
        'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
        className
      )}
    >
      <div>
        { 
        user ? (
          <WorkspaceDropdown
            privateWorkspaces={privateWorkspaces}
            sharedWorkspaces={sharedWorkspaces}
            collaboratingWorkspaces={collaboratingWorkspaces}
            user={user}
            defaultValue={[
              ...privateWorkspaces,
              ...collaboratingWorkspaces,
              ...sharedWorkspaces,
            ].find((workspace) => workspace.id === params.workspaceId)}
          />
        ) : (
          <div>Loading...</div>
        )}
        
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea className="overflow-scroll relative h-[450px]">
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />
          <FoldersDropdownList workspaceId={params.workspaceId} />
        </ScrollArea>
      </div>
      {user ? (
        <UserCard subscription={subscription} user={user} />
      ) : (
        <div>Loading...</div>
      )}
    </aside>
  );
};

export default Sidebar;
