'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import EmojiPicker from '../global/emoji-picker';
import { useToast } from '../ui/use-toast';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon, Trash } from 'lucide-react';
import { v4 } from 'uuid';
import { useSession } from '@/lib/providers/session-provider'; // Assuming you have a session provider

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file';
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  ...props
}) => {
  const { toast } = useToast();
  const { user } = useSession(); // Use session provider to get the current user
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const folderTitle: string | undefined = useMemo(() => {
    if (listType === 'folder') {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === 'file') {
      const fileAndFolderId = id.split('folder');
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  const navigatePage = (accordionId: string, type: string) => {
    if (type === 'folder') {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === 'file') {
      router.push(
        `/dashboard/${workspaceId}/${folderId}/${accordionId.split('folder')[1]}`
      );
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    const fId = id.split('folder');
    if (fId?.length === 1) {
      if (!folderTitle) return;
      toast({
        title: 'Success',
        description: 'Folder title changed.',
      });
      // Replace with your generic API call
      const response = await fetch('/api/update-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fId[0], title: folderTitle }),
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the folder title',
        });
      }
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return;
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fId[1], title: fileTitle }),
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the file title',
        });
      } else {
        toast({
          title: 'Success',
          description: 'File title changed.',
        });
      }
    }
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;
    if (listType === 'folder') {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          workspaceId,
          folderId: id,
          folder: { iconId: selectedEmoji },
        },
      });
      const response = await fetch('/api/update-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, iconId: selectedEmoji }),
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the emoji for this folder',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Update emoji for the folder',
        });
      }
    }
  };

  const folderTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const fid = id.split('folder');
    if (fid.length === 1) {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { title: e.target.value },
          folderId: fid[0],
          workspaceId,
        },
      });
    }
  };

  const fileTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !folderId) return;
    const fid = id.split('folder');
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: { title: e.target.value },
          folderId,
          workspaceId,
          fileId: fid[1],
        },
      });
    }
  };

  const moveToTrash = async () => {
    if (!user?.id || !workspaceId) return;
    const pathId = id.split('folder');
    if (listType === 'folder') {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { inTrash: `Deleted by ${user?.id}` },
          folderId: pathId[0],
          workspaceId,
        },
      });
      const response = await fetch('/api/update-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pathId[0], inTrash: `Deleted by ${user?.id}` }),
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the folder to trash',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Moved folder to trash',
        });
      }
    }

    if (listType === 'file') {
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: { inTrash: `Deleted by ${user?.id}` },
          folderId: pathId[0],
          workspaceId,
          fileId: pathId[1],
        },
      });
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pathId[1], inTrash: `Deleted by ${user?.id}` }),
      });
      if (!response.ok) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the file to trash',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Moved file to trash',
        });
      }
    }
  };

  const isFolder = listType === 'folder';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    {
      'group/folder': isFolder,
      'group/file': !isFolder,
    }
  );

  const listStyles = useMemo(
    () =>
      clsx('relative', {
        'border-none text-md': isFolder,
        'border-none ml-6 text-[16px] py-1': !isFolder,
      }),
    [isFolder]
  );

  const hoverStyles = useMemo(
    () =>
      clsx(
        'h-full hidden rounded-sm absolute right-0 items-center justify-center',
        {
          'group-hover/file:block': listType === 'file',
          'group-hover/folder:block': listType === 'folder',
        }
      ),
    [isFolder]
  );

  const addNewFile = async () => {
    if (!workspaceId) return;
    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: 'Untitled',
      iconId: '📄',
      id: v4(),
      workspaceId,
      bannerUrl: '',
    };
    dispatch({
      type: 'ADD_FILE',
      payload: { file: newFile
