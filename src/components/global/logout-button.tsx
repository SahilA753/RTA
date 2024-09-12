import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';



const LogoutButton= () => {
  const router = useRouter();

  const logout = async () => {
    await signOut({
      redirect: false,
    });
    router.push('/login');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-0"
      onClick={logout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
