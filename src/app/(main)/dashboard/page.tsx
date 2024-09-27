'use client'
import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import DashboardSetup from '@/components/dashboard-setup/Dashboard-Setup';
import { User, Workspace, Subscription } from '@/lib/types';
import { TotalContext } from '@/lib/provider/Central_Storage_Provider';

interface UserResponse {
  user: User;
  workspace?: Workspace | null;
  subscription?: Subscription | null;
}

const DashboardPage = () => {
  const { user, setUser, subscription, setSubscription, workspaces, setWorkspaces , privateWorkspaces,setPrivateWorkspaces, sharedWorkspaces,setSharedWorkspaces, setCollaboratingWorkspaces, collaboratingWorkspaces} = useContext(TotalContext);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();

        if (!session || !session.user?.email) {
          router.push('/login');
          return;
        }

        const userEmail = session.user.email;
        const userResponse = await fetch(`api/getUserByEmail?email=${userEmail}`);
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data.');
        }

        const userData: UserResponse = await userResponse.json();

        if (!userData.user) {
          throw new Error('User data is missing');
        }

        // Set user data and check for errors
        try {
          setUser(userData.user);
        } catch (err) {
          console.error("Error setting user:", err);
          setError('Failed to set user data.');
          return; // Early return if there's an error
        }
        
                // Fetch workspaces for the current user
        const workspacesRes = await fetch(`/api/workspaces?userId=${userData.user.id}`);
        const { privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces } = await workspacesRes.json();
        console.log(privateWorkspaces,collaboratingWorkspaces,sharedWorkspaces,"IWJRVIOJERIUVERIUVEIUVIUERJFI")
        // Set individual workspace categories
        setPrivateWorkspaces(privateWorkspaces);
        setCollaboratingWorkspaces(collaboratingWorkspaces);
        setSharedWorkspaces(sharedWorkspaces);

        // Merge all workspaces into a single array and set it in the context
        const allWorkspaces = [
          ...privateWorkspaces,
          ...collaboratingWorkspaces,
          ...sharedWorkspaces,
        ];
        setWorkspaces(allWorkspaces);
        setWorkspace(allWorkspaces.length > 0 ? allWorkspaces[0] : null);
        setSubscription(userData.user.subscriptions ? userData.user.subscriptions[0] : null);

        if (allWorkspaces.length > 0) {
          router.push(`/dashboard/${allWorkspaces[0].id}`);
        }
      } catch (err) {
        setError((err as Error).message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    console.log("User state updated:", user);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-background h-screen w-screen flex justify-center items-center">
      {!workspace && user && !subscription && (
        <DashboardSetup user={user} subscription={subscription} workspace={workspace} />
      )}
    </div>
  );
};

export default DashboardPage;
