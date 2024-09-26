'use client';
import { File, Folder, Workspace } from '@/lib/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import EmojiPicker from '../global/emoji-picker';
import { XCircleIcon } from 'lucide-react';
// import BannerUpload from '../banner-upload/banner-upload';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { useSocket } from '@/lib/provider/socket-provider';

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  dirType: 'workspace' | 'folder' | 'file';
}

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const QuillEditor: React.FC<QuillEditorProps> = ({ dirDetails, dirType }) => {
  // console.log("dir",dirDetails,dirType);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [user, setUser] = useState();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<{ id: string; email: string; avatarUrl: string }[]>([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);
  const [selectedDir, setSelectedDir] = useState<File | Folder | Workspace | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string | null>();
  const [workspaceId, setWorkspaceId] = useState<string>();
  const [fileId, setFileId] = useState<string|null>();
  const [folderId, setFolderId] = useState<string|null>();
  const [textMutex, setTextMutex] = useState(false);
  const [cursorMutex, setCursorMutex] = useState(false);
   
  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);
      const q = new Quill(editor, {
        theme: 'snow',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);


  useEffect(() => {
    const fetchUserAndDirectoryDetails = async () => {
      try{
        setSelectedDir(dirDetails);
      }
      catch(error){
        console.log(error)
      }
      const session = await getSession();
      if (!session || !session.user?.email) {
        router.push('/login');
        return;
      }

      const userEmail = session.user.email;
      const userdata = await fetch(`/api/getUserByEmail?email=${userEmail}`);
      const userr = await(userdata.json())
      setUser(userr);
    };
    fetchUserAndDirectoryDetails();
  }, [dirType, dirDetails, router]);

  
  useEffect(() => {
    if (!pathname) return;

    const fetchBreadcrumbs = async () => {
      try {
        const segments = pathname.split('/').filter((val) => val !== 'dashboard' && val);

        if (segments.length === 0) return;

        const workspaceResponse = await axios.get(`/api/getWorkspacebyId?workspaceId=${segments[0]}`);
        const workspaceDetails = workspaceResponse.data;

        const workspaceBreadCrumb = workspaceDetails ? `${workspaceDetails.iconId} ${workspaceDetails.title}` : '';

        if (segments.length === 1) {
          setBreadcrumbs(workspaceBreadCrumb);
          setWorkspaceId(segments[0]);
          return;
        }

        const folderResponse = await axios.get(`/api/getFolderbyId?folderId=${segments[1]}`);
        const folderDetails = folderResponse.data;
        const folderBreadCrumb = folderDetails ? `/ ${folderDetails.iconId} ${folderDetails.title}` : '';

        if (segments.length === 2) {
          setBreadcrumbs(`${workspaceBreadCrumb} ${folderBreadCrumb}`);
          setFolderId(segments[1]);
          return;
        }

        const fileResponse = await axios.get(`/api/getFilebyId?fileId=${segments[2]}`);
        const fileDetails = fileResponse.data;
        const fileBreadCrumb = fileDetails ? `/ ${fileDetails.title}` : '';

        setBreadcrumbs(`${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`);
        setFileId(segments[2]);
      } catch (error) {
        console.error('Error fetching breadcrumbs:', error);
        setBreadcrumbs(null);
      }
    };

    fetchBreadcrumbs();
  }, [pathname]);


  useEffect(() => {

    if (quill === null || !selectedDir || !selectedDir.data) return;
  
    const fetchInformation = async () => {
      try {
            const contentData = selectedDir.data;
            console.log("Setting content:", contentData);
            quill.setText(contentData);         
      } catch (error) {
        console.error('Error restoring Quill content:', error);
      }
    };
  
    fetchInformation();
  }, [fileId]);

  useEffect(() => {
    if (quill === null) return;
  
    const handleTextChange = () => {
      const text = quill.getText();
      console.log("Current Plain Text:", text);
      setSelectedDir(prev => {
        if (prev) {
          return {
            ...prev,
            data: text
          };
        }
        return prev;
      });
    };
  
      quill.on('text-change', handleTextChange);  // Listen for text changes
  
    return () => {
      quill.off('text-change', handleTextChange);  // Clean up the listener when component unmounts
    };
  }, [quill]);

  useEffect(() => {
    if (!socket || !fileId) return;
    
    console.log("EMITTING CREATE ROOM")
    socket.emit('create-room', fileId);
  
    return () => {
      socket.emit('leave-room', fileId);
    };
  }, [socket, fileId]);
 
  // Handling text changes
  useEffect(() => {
    if (!quill || !socket || !fileId) return;
  
    const handleTextChange = () => {
      if (!textMutex) {
        setTextMutex(true);
        const text = quill.getText();
        socket.emit('send-changes', text, fileId);
        setTimeout(() => setTextMutex(false), 20);
      }
    };
  
    quill.on('text-change', handleTextChange);
  
    return () => {
      quill.off('text-change', handleTextChange);
    };
  }, [quill, socket, fileId, textMutex]);
  
  // Handling incoming text changes
  useEffect(() => {
    if (!socket || !quill || !fileId) return;
  
    const handleIncomingChanges = (text, roomId) => {
      if (roomId === fileId && !textMutex) {
        setTextMutex(true);
        quill.setText(text);
        setTimeout(() => setTextMutex(false), 20);
      }
    };
  
    socket.on('receive-changes', handleIncomingChanges);
  
    return () => {
      socket.off('receive-changes', handleIncomingChanges);
    };
  }, [socket, quill, fileId, textMutex]);
  
  // Handling cursor updates
  useEffect(() => {
    if (!socket || !quill || !fileId) return;
  
    const handleCursorMove = (range, roomId, cursorId) => {
      if (roomId === fileId && !cursorMutex) {
        setCursorMutex(true);
        const userCursor = quill.getModule('cursors');
        userCursor.moveCursor(cursorId, range);
        setTimeout(() => setCursorMutex(false), 20);
      }
    };
  
    socket.on('receive-cursor-move', handleCursorMove);
  
    return () => {
      socket.off('receive-cursor-move', handleCursorMove);
    };
  }, [socket, quill, fileId, cursorMutex]);
  



  // const restoreFileHandler = async () => {
  //   try {
  //     if (dirType === 'file') {
  //       if (!folderId || !workspaceId) return;

  //       await axios.patch('/api/updateFile', {
  //         inTrash: '',
  //         fileId,
  //         folderId,
  //         workspaceId,
  //       });

  //       const updatedFileResponse = await axios.get(`/api/getFileById?fileId=${fileId}`);
  //       setSelectedDir(updatedFileResponse.data);
  //     }

  //     if (dirType === 'folder') {
  //       if (!workspaceId) return;

  //       await axios.patch('/api/updateFolder', {
  //         inTrash: '',
  //         folderId: fileId,
  //         workspaceId,
  //       });

  //       const updatedFolderResponse = await axios.get(`/api/getFolderById?folderId=${fileId}`);
  //       setSelectedDir(updatedFolderResponse.data);
  //     }
  //   } catch (error) {
  //     console.error('Error restoring item:', error);
  //   }
  // };

  // const deleteFileHandler = async () => {
  //   try {
  //     if (dirType === 'file') {
  //       if (!folderId || !workspaceId) return;

  //       await axios.delete('/api/deleteFile', {
  //         data: { fileId, folderId, workspaceId },
  //       });

  //       router.replace(`/dashboard/${workspaceId}`);
  //     }

  //     if (dirType === 'folder') {
  //       if (!workspaceId) return;

  //       await axios.delete('/api/deleteFolder', {
  //         data: { folderId: fileId, workspaceId },
  //       });

  //       router.replace(`/dashboard/${workspaceId}`);
  //     }
  //   } catch (error) {
  //     console.error('Error deleting item:', error);
  //   }
  // };

  // const iconOnChange = async (icon: string) => {
  //   try {
  //     if (!fileId) return;

  //     let endpoint: string;
  //     let payload: { iconId: string; workspaceId?: string; folderId?: string };

  //     switch (dirType) {
  //       case 'workspace':
  //         endpoint = '/api/updateWorkspaceIcon';
  //         payload = { iconId: icon, workspaceId: fileId };
  //         break;
  //       case 'folder':
  //         if (!workspaceId) return;
  //         endpoint = '/api/updateFolderIcon';
  //         payload = { iconId: icon, workspaceId, folderId: fileId };
  //         break;
  //       case 'file':
  //         if (!workspaceId || !folderId) return;
  //         endpoint = '/api/updateFileIcon';
  //         payload = { iconId: icon, workspaceId, folderId, fileId };
  //         break;
  //       default:
  //         return;
  //     }

  //     await axios.patch(endpoint, payload);
  //   } catch (error) {
  //     console.error('Error updating icon:', error);
  //   }
  // };

  // const deleteBanner = async () => {
  //   if (!fileId) return;

  //   setDeletingBanner(true);

  //   try {
  //     let endpoint: string;
  //     let payload: { bannerUrl: string; workspaceId?: string; folderId?: string };

  //     switch (dirType) {
  //       case 'file':
  //         if (!folderId || !workspaceId) return;
  //         endpoint = '/api/updateFileBanner';
  //         payload = { bannerUrl: '', workspaceId, folderId: fileId };
  //         break;
  //       case 'folder':
  //         if (!workspaceId) return;
  //         endpoint = '/api/updateFolderBanner';
  //         payload = { bannerUrl: '', workspaceId, folderId: fileId };
  //         break;
  //       case 'workspace':
  //         endpoint = '/api/updateWorkspaceBanner';
  //         payload = { bannerUrl: '', workspaceId: fileId };
  //         break;
  //       default:
  //         return;
  //     }

  //     await axios.patch(endpoint, payload);
  //     await axios.delete(`/api/removeBanner?fileId=${fileId}`);
  //   } catch (error) {
  //     console.error('Error deleting banner:', error);
  //   } finally {
  //     setDeletingBanner(false);
  //   }
  // };





  
  

  // useEffect(() => {
  //   // Check if essential values are available
  //   if (quill === null || socket === null || !fileId || !localCursors.length) return;
  
  //   // Function to handle incoming cursor move events from the socket
  //   const socketHandler = (range: any, roomId: string, cursorId: string) => {
  //     // Ensure the event is relevant to the current file
  //     if (roomId === fileId) {
  //       // Find the cursor that needs to be moved
  //       const cursorToMove = localCursors.find((c: any) => c.cursors()?.[0].id === cursorId);
  //       // Move the cursor if found
  //       if (cursorToMove) {
  //         cursorToMove.moveCursor(cursorId, range);
  //       }
  //     }
  //   };
  
  //   // Register the event listener for cursor movements
  //   socket.on('receive-cursor-move', socketHandler);
  
  //   // Cleanup function to remove the event listener
  //   return () => {
  //     socket.off('receive-cursor-move', socketHandler);
  //   };
  // }, [quill, socket, fileId, localCursors]);

  // useEffect(() => {
  //   if (quill === null || socket === null || !fileId || !user) return;
  
  //   const selectionChangeHandler = (cursorId: string) => {
  //     return (range: any, oldRange: any, source: any) => {
  //       if (source === 'user' && cursorId) {
  //         socket.emit('send-cursor-move', range, fileId, cursorId);
  //       }
  //     };
  //   };
  
  //   const quillHandler = async (delta: any, oldDelta: any, source: any) => {
  //     if (source !== 'user') return;
  
  //     if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  //     setSaving(true);
  
  //     const contents = quill.getContents();
  //     const quillLength = quill.getLength();
  
  //     saveTimerRef.current = setTimeout(async () => {
  //       try {
  //         if (contents && quillLength !== 1) {
  //           const data = JSON.stringify(contents);
  
  //           // Determine the appropriate endpoint and payload based on dirType
  //           let endpoint = '';
  //           const payload: any = { data, fileId };
  
  //           switch (dirType) {
  //             case 'workspace':
  //               endpoint = '/api/updateWorkspace';
  //               break;
  
  //             case 'folder':
  //               endpoint = '/api/updateFolder';
  //               break;
  
  //             case 'file':
  //               endpoint = '/api/updateFile';
  //               break;
  
  //             default:
  //               throw new Error('Invalid dirType');
  //           }
  
  //           await axios.patch(endpoint, payload);
  //         }
  //       } catch (error) {
  //         console.error('Error saving content:', error);
  //       } finally {
  //         setSaving(false);
  //       }
  //     }, 850);
  
  //     socket.emit('send-changes', delta, fileId);
  //   };
  
  //   quill.on('text-change', quillHandler);
  //   quill.on('selection-change', selectionChangeHandler(user.id));
  
  //   return () => {
  //     quill.off('text-change', quillHandler);
  //     quill.off('selection-change', selectionChangeHandler(user.id));
  //     if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  //   };
  // }, [quill, socket, fileId, user, dirType]);
  
  // useEffect(() => {
  //   if (quill === null || socket === null) return;
  //   const socketHandler = (deltas: any, id: string) => {
  //     if (id === fileId) {
  //       quill.updateContents(deltas);
  //     }
  //   };
  //   socket.on('receive-changes', socketHandler);
  //   return () => {
  //     socket.off('receive-changes', socketHandler);
  //   };
  // }, [quill, socket, fileId]);


  // useEffect(() => {
  //   if (!fileId || quill === null || !user) return;
  
  //   // Function to handle the presence update
  //   const handlePresenceUpdate = (newCollaborators: any[]) => {
  //     setCollaborators(newCollaborators);
  
  //     if (user) {
  //       const allCursors: any = [];
  //       newCollaborators.forEach((collaborator: { id: string; email: string; avatar: string }) => {
  //         if (collaborator.id !== user.id) {
  //           const userCursor = quill.getModule('cursors');
  //           userCursor.createCursor(
  //             collaborator.id,
  //             collaborator.email.split('@')[0],
  //             `#${Math.random().toString(16).slice(2, 8)}`
  //           );
  //           allCursors.push(userCursor);
  //         }
  //       });
  //       setLocalCursors(allCursors);
  //     }
  //   };
  
    // Fetch initial collaborators from the backend
  //   const fetchCollaborators = async () => {
  //     try {
  //       const response = await fetch(`/api/collaborators?workspaceId=${workspaceId}`);
  //       const data = await response.json();
  //       const newCollaborators = data.collaborators;
  //       handlePresenceUpdate(newCollaborators);
  //     } catch (error) {
  //       console.error('Error fetching collaborators:', error);
  //     }
  //   };
  //   fetchCollaborators();
  //   return () => {
      
  //   };
  // }, [fileId, quill, user, workspaceId]);
  

  // console.log(quill.root.innerHTML);

  return (
    <>
      <div className="relative">
        {selectedDir?.inTrash && (
          <article className="py-2 z-40 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">This {dirType} is in the trash.</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                // onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                // onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{selectedDir?.inTrash}</span>
          </article>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          <div>{breadcrumbs}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators?.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                        <AvatarImage
                          src={collaborator.avatarUrl ? collaborator.avatarUrl : ''}
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {saving ? (
              <Badge
                variant="secondary"
                className="bg-orange-600 top-4 text-white right-4 z-50"
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-emerald-600 top-4 text-white right-4 z-50"
              >
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
      {selectedDir?.bannerUrl && (
        <div className="relative w-full h-[200px]">
          <Image
            src={selectedDir?.bannerUrl}
            fill
            className="w-full md:h-48 h-20 object-cover"
            alt="Banner Image"
          />
        </div>
      )}
      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div className="w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          <div className="text-[80px]">
            {/* <EmojiPicker getValue={iconOnChange}>
              <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                {selectedDir?.iconId}
              </div>
            </EmojiPicker> */}
          </div>
          <div className="flex">
            {/* <BannerUpload
              id={fileId}
              dirType={dirType}
              className="mt-2 text-sm text-muted-foreground p-2 hover:text-card-foreground transition-all rounded-md"
            >
              {selectedDir?.bannerUrl ? 'Update Banner' : 'Add Banner'}
            </BannerUpload> */}
            {selectedDir?.bannerUrl && (
              <Button
                disabled={deletingBanner}
                // onClick={deleteBanner}
                variant="ghost"
                className="gap-2 hover:bg-background flex item-center justify-center mt-2 text-sm text-muted-foreground w-36 p-2 rounded-md"
              >
                <XCircleIcon size={16} />
                <span className="whitespace-nowrap font-normal">Remove Banner</span>
              </Button>
            )}
          </div>
          <span className="text-muted-foreground text-3xl font-bold h-9">
            {selectedDir?.title}
          </span>
          <span className="text-muted-foreground text-sm">{dirType.toUpperCase()}</span>
        </div>
        <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
      </div>
    </>
  );
  
};

export default QuillEditor;
