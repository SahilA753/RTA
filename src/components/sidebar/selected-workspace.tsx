'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Workspace } from '@/lib/types';


interface SelectedWorkspaceProps {
  workspace: Workspace;
  onClick?: (option: Workspace) => void;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
  workspace,
  onClick,
}) => {
  const [workspaceLogo, setWorkspaceLogo] = useState('/cypresslogo.svg');

  // Fetch the workspace logo if it exists
  useEffect(() => {
    if (workspace.logo) {
      // Replace this with your own function to get the logo URL
      const fetchLogoUrl = async () => {
        try {
          const response = await fetch(`/api/getLogoUrl?logo=${workspace.logo}`);
          const data = await response.json();
          setWorkspaceLogo(data.url || '/cypresslogo.svg');
        } catch (error) {
          console.error('Error fetching logo:', error);
          setWorkspaceLogo('/cypresslogo.svg');
        }
      };

      fetchLogoUrl();
    }
  }, [workspace]);

  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => {
        if (onClick) onClick(workspace);
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center cursor-pointer items-center my-2"
    >
      <Image
        src={workspaceLogo}
        alt="Workspace logo"
        width={26}
        height={26}
        objectFit="cover"
      />
      <div className="flex flex-col">
        <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {workspace.title}
        </p>
      </div>
    </Link>
  );
};

export default SelectedWorkspace;
