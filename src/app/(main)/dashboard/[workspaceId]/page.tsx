export const dynamic = 'force-dynamic';
import QuillEditor from '@/components/quill-editor/quill-editor';
// import { redirect } from 'next/navigation';
import React from 'react';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const res = await fetch(`http://localhost:3000/api/getWorkspacebyId?workspaceId=${params.workspaceId}`);
  
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }

  const data = await res.json();

  console.log("quill",data)
  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        dirDetails={data || {}}
      />
    </div>
  );
};

export default Workspace;
