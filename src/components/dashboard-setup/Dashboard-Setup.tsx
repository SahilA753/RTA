import React, { useState } from 'react';
import { v4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Loader from '../global/Loader';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { User,Workspace,Subscription } from '@/lib/types';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { useContext } from 'react';
import { TotalContext} from '@/lib/provider/Central_Storage_Provider';

interface DashboardSetupProps {
  user: User;
  subscription?: Subscription|null;
  workspace?: Workspace|null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({ user, subscription, workspace }) => {

  const { toast } = useToast();
  const router = useRouter();
  const {workspaces, setWorkspaces } = useContext(TotalContext);
  const [selectedEmoji, setSelectedEmoji] = useState('💼');
  const [formData, setFormData] = useState<{
    workspaceName: string;
    logo: string | null;
  }>({
    workspaceName: '',
    logo: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ workspaceName?: string }>({});

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
  
    if (name === "logo" && files?.[0]) {
      const file = files[0];
      const reader = new FileReader();
  
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64String = `data:${file.type};base64,${btoa(
              new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
              )
            )}`;
  
            setFormData(prev => ({
              ...prev,
              logo: base64String,
            }));
          } catch (error) {
            console.error("Error converting file to Base64:", error);
          }
        }
      };
  
      reader.onerror = () => {
        console.error("Error reading file");
      };
  
      reader.readAsArrayBuffer(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  
    // console.log(formData.logo);
  };

  const validateForm = () => {
    const result = CreateWorkspaceFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = result.error.format();
      setErrors({ workspaceName: newErrors.workspaceName?._errors[0] });
      return false;
    }
    setErrors({});
    return true;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const workspaceUUID = v4();
    
    // Function to convert Base64 to Uint8Array
    const base64ToUint8Array = (base64: string): Uint8Array => {
      const binaryString = atob(base64.split(',')[1]); // Remove base64 prefix and decode
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };
  
    const logo = formData.logo ? base64ToUint8Array(formData.logo) : null;
    
    try {
      setIsSubmitting(true);
  
      const newWorkspace: Workspace = {
        id: workspaceUUID,
        createdAt: new Date().toISOString(),
        userId: user.id,
        title: formData.workspaceName,
        iconId: selectedEmoji,
        logo: logo, // Now `logo` is `Uint8Array` or `null`
        folders: [], // Assuming Folder is defined elsewhere
        files: [],   // Assuming File is defined elsewhere
        user: user 
      };

      setWorkspaces((prevWorkspaces) => (prevWorkspaces ? [...prevWorkspaces, newWorkspace] : [newWorkspace]));
      await createWorkspace(newWorkspace);
      toast({ title: 'Workspace Created', description: `${newWorkspace.title} has been created successfully.` });
      router.replace(`/dashboard/${workspaceUUID}`);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create workspace.' });
    } finally {
      setIsSubmitting(false);
      setFormData({ workspaceName: '', logo: null });
    }
  };
  

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>Let's create a private workspace to get you started. You can add collaborators later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <div className="w-full">
                <Label htmlFor="workspaceName" className="text-sm text-muted-foreground">Name</Label>
                <Input
                  id="workspaceName"
                  type="text"
                  name="workspaceName"
                  value={formData.workspaceName}
                  onChange={handleInputChange}
                  placeholder="Workspace Name"
                  disabled={isSubmitting}
                />
                <small className="text-red-600">{errors.workspaceName}</small>
              </div>
            </div>
            <div>
              <Label htmlFor="logo" className="text-sm text-muted-foreground">Workspace Logo</Label>
              <Input id="logo" type="file" name="logo" accept="image/*" disabled={isSubmitting} onChange={handleInputChange} />
            </div>
            <div className="self-end">
              <Button disabled={isSubmitting} type="submit">
                {!isSubmitting ? 'Create Workspace' : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
