'use client';
import React, { useEffect, useState } from 'react';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppState } from '@/lib/providers/state-provider';
import { Folder } from '@/lib/types'; // Replace with your generic backend types
import { createFolder } from '@/lib/api/folder'; // Replace with your API call
import { useToast } from '../ui/use-toast';
import { Accordion } from '../ui/accordion';
import Dropdown
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { getSessionUserId } from '@/lib/auth'; // Replace with your session handling function

interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  const { state, dispatch, folderId } = useAppState();
  const { open, setOpen } = useSubscriptionModal();
  const { toast } = useToast();
  const [folders, setFolders] = useState(workspaceFolders);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user ID from session
    getSessionUserId().then(id => setUserId(id));

    // Initialize folders state
    if (workspaceFolders.length > 0) {
      dispatch({
        type: 'SET_FOLDERS',
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files: state.workspaces
              .find((workspace) => workspace.id === workspaceId)
              ?.folders.find((f) => f.id === folder.id)?.files || [],
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId, state, dispatch]);

  useEffect(() => {
    setFolders(
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || []
    );
  }, [state, workspaceId]);

  const addFolderHandler = async () => {
    if (folders.length >= 3 && !userId) {
      setOpen(true);
      return;
    }
    const newFolder: Folder = {
      data: null,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      inTrash: null,
      workspaceId,
      bannerUrl: '',
    };

    dispatch({
      type: 'ADD_FOLDER',
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });

    try {
      await createFolder(newFolder);
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
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || '']}
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
            />
          ))}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;
