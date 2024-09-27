'use client'
import QuillEditor from '@/components/quill-editor/quill-editor';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { TotalContext } from '@/lib/provider/Central_Storage_Provider';
import { Workspace } from '@/lib/types';

const Workspace_Component = ({ params }: { params: { workspaceId: string } }) => {
  const { workspaces } = useContext(TotalContext);
  const [workspaceData, setWorkspaceData] = useState<Workspace | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    console.log(workspaces)
    if (Array.isArray(workspaces)) {
      const data = workspaces.find((workspace) => workspace.id === params.workspaceId);
      if (data) {
        setWorkspaceData(data); // Set the workspace data if found
      } else {
        // Handle case where workspace isn't found in the existing context
        console.warn(`Workspace with ID ${params.workspaceId} not found.`);
        // Optionally navigate to a different route or show a message
        router.push('/dashboard'); // Redirect to dashboard
      }
    } else {
      // If workspaces is not available, navigate back to the dashboard
      console.warn("Workspaces are not available in context.");
      router.push('/dashboard'); // Redirect to dashboard
    }
  }, [params.workspaceId, workspaces, router]);

  // Check if workspaceData is available
  if (!workspaceData) {
    return <div>Loading workspace data...</div>; // Loading state or redirect handled above
  }

  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        dirDetails={workspaceData}
      />
    </div>
  );
};

export default Workspace_Component;
