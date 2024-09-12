'use client';
import React, { useEffect, useState } from 'react';
// import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@/lib/types'; // Replace with your generic backend types
import { useToast } from '../ui/use-toast';
import { Accordion } from '../ui/accordion';
import TooltipComponent from '../global/tooltip-component';
import Dropdown from './Dropdown';
// import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';

interface FoldersDropdownListProps {
  workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceId,
}) => {
  // const { open, setOpen } = useSubscriptionModal();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchWorkspaceFolders = async () => {
      try {
        const response = await fetch(`/api/folders?workspaceId=${encodeURIComponent(workspaceId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
        const fetchedFolders: Folder[] = await response.json();
        setFolders(fetchedFolders);
      } catch (error) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not load folders',
        });
      }
    };
  
    fetchWorkspaceFolders();
  }, [workspaceId, toast]);
  const addFolderHandler = async () => {

    const newFolder = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      data: null,
      inTrash: null,
      bannerUrl: '',
      workspaceId:workspaceId,
      // files: [],
    };

    setFolders((prevFolders) => [...prevFolders, { ...newFolder, files: [] }]);

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFolder),
      });
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      toast({
        title: 'Success',
        description: 'Created folder.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not create the folder',
      });
      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== newFolder.id));
    }
  };

  return (
    <>
      <div
        className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8"
      >
        <span className="text-Neutrals-8 font-bold text-xs">
          FOLDERS
        </span>
        <TooltipComponent message='Create Folder'>
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
          </TooltipComponent>
        
      </div>
      <Accordion
        type="multiple"
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
              iconId={folder.iconId}
              workspaceId = {workspaceId}
              folderId={null}
            />
          ))}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;
