// src/app/dashboard/layout.tsx
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex over-hidden h-screen">
      {children}
    </main>
  );
};

export default DashboardLayout;
