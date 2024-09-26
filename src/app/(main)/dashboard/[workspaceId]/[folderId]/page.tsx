export const dynamic = 'force-dynamic';

import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import { redirect } from 'next/navigation';

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const res = await fetch(`http://localhost:3000/api/getFolderbyId?folderId=${params.folderId}`);
  
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }

  const data = await res.json();

  return (
    <div className="relative ">
      <QuillEditor
        dirType="folder"
        dirDetails={data || {}}
      />
    </div>
  );
};

export default Folder;
