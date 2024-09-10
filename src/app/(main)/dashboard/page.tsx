'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import DashboardSetup from '@/components/dashboard-setup/Dashboard-Setup';
import { User, Workspace, Subscription } from '@/lib/types';

interface UserResponse {
  user: User;
  workspace? : Workspace|null,
  subscription? : Subscription|null,
}

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace|null>(null);
  const [subscription, setSubscription] = useState<Subscription|null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the session and get the user's email
        const session = await getSession();

        if (!session || !session.user?.email) {
          router.push('/login');
          return;
        }

        const userEmail = session.user.email;

        const userResponse = await fetch(`api/getUserByEmail?email=${userEmail}`);
        const userData: UserResponse = await userResponse.json();

        if (!userResponse.ok || !userData.user) {
          setError('Failed to fetch user data');
          return;
        }

        setUser(userData.user); 
        setWorkspace(user?.workspaces ? user.workspaces[0] : null);
        setSubscription(user?.subscriptions ? user.subscriptions[0] : null);

        if (userData.user.workspaces && userData.user.workspaces.length > 0) {
          const workspace = userData.user.workspaces[0]; 
          console.log("redirecting workspaces")
          router.push(`/dashboard/${workspace.id}`);
        }
      } catch (err) {
        setError((err as Error).message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     console.log("Updated user:", user); // Logs updated user
  //   }
  // }, [user]);

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
      ) }
    </div>
  );
};

export default DashboardPage;
