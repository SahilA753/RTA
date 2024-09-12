'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect,useState, useMemo } from 'react';
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
import { File } from '@/lib/types';

interface DropdownProps {
  title: string;
  folderId: string|null;
  listType: 'folder' | 'file';
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
  workspaceId: string;
  id:string;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  folderId,
  listType,
  iconId,
  children,
  disabled,
  workspaceId,
  id,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [folderTitle, setFolderTitle] = useState(title);
  const [fileTitle, setFileTitle] = useState(title);
  const [files,setfiles] = useState<File[]>([]);
  const [emote,setemote] = useState(iconId);
  const router = useRouter();

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      const fetchedFiles: File[] = await response.json();
      setfiles(fetchedFiles);
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not load folders',
      });
    }
  };

    useEffect(() => {
      if (listType === 'folder') {
        fetchFiles();
      }
    }, [id]); 

    console.log(files)
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (listType === 'folder' && folderTitle !== title) {
      try {

        await fetch(`/api/folders`, {
          method: 'POST',
          body: JSON.stringify({id:id, title: folderTitle, iconId:iconId, inTrash:null, }),
        });
        toast({
          title: 'Success',
          description: 'Folder title updated.',
        });
      } catch {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Failed to update folder title.',
        });
      }
    }

    if (listType === 'file' && fileTitle !== title) {
      try {
        await fetch(`/api/files`, {
          method: 'POST',
          body: JSON.stringify({id:id, title: fileTitle }),
        });
        toast({
          title: 'Success',
          description: 'File title updated.',
        });
      } catch {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Failed to update file title.',
        });
      }
    }
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    try {
      setemote(selectedEmoji)
      await fetch(`/api/${listType==="file"?"files":"folders"}`, {
        method: 'POST',
        body: JSON.stringify({id:id, iconId: selectedEmoji }),
      });
      toast({
        title: 'Success',
        description: 'Emoji updated for folder.',
      });
    } catch {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to update emoji.',
      });
    }
  };

  const addNewFile = async () => {
    const newFile = {
      folderId: id,
      title: 'Untitled',
      iconId: '📄',
      id: v4(),
      createdAt: new Date().toISOString(),
    };

    setfiles((files) => [...files, newFile]);

    try {
      await fetch(`/api/files`, {
        method: 'POST',
        body: JSON.stringify(newFile),
      });
      toast({
        title: 'Success',
        description: 'New file created.',
      });
    } catch {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to create file.',
      });
    }
  };

  const moveToTrash = async () => {
    try {
      await fetch(`/api/${listType}s`, {
        method: 'POST',
        body: JSON.stringify({id:id,inTrash: "true" }),
      });
      toast({
        title: 'Success',
        description: `Moved ${listType} to trash.`,
      });
    } catch {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: `Failed to move ${listType} to trash.`,
      });
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

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation();
        if(listType=='folder')
        router.push(`/dashboard/${workspaceId}/${id}`);
        else
        router.push(`/dashboard/${workspaceId}/${folderId}/${id}`);
      }}
    >
      <AccordionTrigger className="hover:no-underline p-2 dark:text-muted-foreground text-sm">
        <div className={groupIdentifies}>
          <div className="flex gap-4 items-center justify-center overflow-hidden">
            <div className="relative">
              <EmojiPicker getValue={onChangeEmoji}>{emote}</EmojiPicker>
            </div>
            <input
              type="text"
              value={listType === 'folder' ? folderTitle : fileTitle}
              className={clsx(
                'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
                {
                  'bg-muted cursor-text': isEditing,
                  'bg-transparent cursor-pointer': !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={(e) =>
                listType === 'folder'
                  ? setFolderTitle(e.target.value)
                  : setFileTitle(e.target.value)
              }
            />
          </div>
          <div className={hoverStyles}>
            <TooltipComponent message={listType==='file'?'Delete File':'Delete Folder'}>
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </TooltipComponent>
            {listType === 'folder' && !isEditing && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
           
            {files
            .filter((file) => !file.inTrash)
              .map((file) => (
                <Dropdown
                  key={file.id}
                  title={file.title}
                  listType="file"
                  id={file.id}
                  iconId={file.iconId}
                  workspaceId={workspaceId}
                  folderId={id}
                />
              ))
          }
      </AccordionContent>
    </AccordionItem>
  );
};

export default Dropdown;
