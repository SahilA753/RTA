"use client"; // This enables the component to handle client-side logic

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from '@/components/ui/button'; // Adjust the path if necessary

const Dashboard = () => {
  // Handle sign-out
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/' // Redirect URL after sign-out
    });
  };

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Here is your dashboard content.</p>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
};

export default Dashboard;
