'use client'
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import ModeToggle from '../global/mode-toggle';
import { Subscription, User } from '@/lib/types';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { FaSignOutAlt } from 'react-icons/fa'; // Import the logout icon

interface UserCardProps {
  user : User|null;
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = ({ subscription, user }) => {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setProfile(user);
      } catch (err) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const logout = async () => {
    await signOut({
      redirect: false,
    });
    router.push('/login');
  };

  // console.log(user);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  return (
    <article
      className="hidden sm:flex justify-between items-center px-4 py-2 dark:bg-Neutrals/neutrals-12 rounded-3xl"
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile?.avatarUrl || ''} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-muted-foreground">
            {subscription?.status === 'active' ? 'Pro Plan' : 'Free Plan'}
          </span>
          <small
            className="w-[100px] overflow-hidden overflow-ellipsis"
          >
            {profile?.email || 'No Email'}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">

<Button variant="ghost" size="icon" className="p-0" onClick={logout}>
  <FaSignOutAlt />
</Button>

        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;
