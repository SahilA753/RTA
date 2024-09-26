export const dynamic = 'force-dynamic';
import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';

const File = async ({ params }: { params: { fileId: string } }) => {
  const res = await fetch(`http://localhost:3000/api/getFilebyId?fileId=${params.fileId}`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }

  const file = await res.json();

  return (
    <div className="relative">
      <QuillEditor
        dirType="file"
        dirDetails={file || {}}
      />
    </div>
  );
};

export default File;
