'use client';
import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectGroup } from '@radix-ui/react-select';
import { Lock, Plus, Share } from 'lucide-react';
import { Button } from '../ui/button';
import { v4 } from 'uuid';
import CollaboratorSearch from './collaborator-search';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { User, Workspace } from '@/lib/types'; // Assuming you have generic User and Workspace types
interface User_Prop{
    user:User|null,
}

const WorkspaceCreator: React.FC<User_Prop> = ({
    user,
}) => {
    
  if(user===null) return;
  const [permissions, setPermissions] = useState('private');
  const [title, setTitle] = useState('');
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const addCollaborator = (user: User) => {
    setCollaborators([...collaborators, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
  };

  const createWorkspace = async (workspaceData: Workspace) => {
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workspaceData),
    });
    if (!response.ok) throw new Error('Failed to create workspace');
    return await response.json();
  };

  const addCollaborators = async (collaborators: User[], workspaceId: string) => {
    console.log(collaborators);
    const response = await fetch('/api/collaborators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collaborators, workspaceId }),
    });
  
    if (!response.ok) throw new Error('Failed to add collaborators');
    return await response.json();
  };
  

  const createItem = async () => {
    setIsLoading(true);
    const uuid = v4();
    try {
      const newWorkspace: Workspace = {
        id: uuid,
        createdAt: new Date().toISOString(),
        userId: user.id, // Replace with your current user's ID from session
        title,
        iconId: '💼',
        logo: null,
        folders: [], // Assuming Folder is defined elsewhere
        files: [],   // Assuming File is defined elsewhere
        user: user
      };

      if (permissions === 'private') {
        await createWorkspace(newWorkspace);
        toast({ title: 'Success', description: 'Created the workspace' });
        router.refresh();
      } else if (permissions === 'shared') {
        console.log("HIIIIIIII")
        await createWorkspace(newWorkspace);
        await addCollaborators(collaborators, uuid);
        toast({ title: 'Success', description: 'Created the workspace with collaborators' });
        router.refresh();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create the workspace' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <div>
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Workspace Name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <Select
          onValueChange={(val) => setPermissions(val)}
          defaultValue={permissions}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>Your workspace is private to you. You can choose to share it later.</p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share />
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {permissions === 'shared' && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={addCollaborator}
            usser = {user}
          >
            <Button type="button" className="text-sm mt-4">
              <Plus /> Add Collaborators
            </Button>
          </CollaboratorSearch>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Collaborators {collaborators.length || ''}
            </span>
            <ScrollArea className="h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
              {collaborators.length ? (
                collaborators.map((c) => (
                  <div key={c.id} className="p-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <Avatar>
                        <AvatarImage src="/avatars/7.png" />
                        <AvatarFallback>PJ</AvatarFallback>
                      </Avatar>
                      <div className="text-sm text-muted-foreground sm:w-[300px] w-[140px] overflow-hidden overflow-ellipsis">
                        {c.email}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => removeCollaborator(c)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                  <span className="text-muted-foreground text-sm">
                    You have no collaborators
                  </span>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
      <Button
        type="button"
        disabled={!title || (permissions === 'shared' && collaborators.length === 0) || isLoading}
        variant="secondary"
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreator;