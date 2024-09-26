import { z } from 'zod';
import { Socket, Server as NetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';


export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });


export const signupSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // path of error
  });

  export interface User {
    id: string;
    email: string;
    verified: boolean;
    verificationToken?: string | null;
    avatarUrl?: string | null;
    fullName?: string | null;
    pwd?: string | null;
    billingAddress?: Record<string, any> | null;
    updatedAt?: string | null; // DateTime in Prisma maps to string in TypeScript when using Timestamptz
    paymentMethod?: Record<string, any> | null;
    subscriptions: Subscription[]; // Assuming Subscription is defined elsewhereW
    workspaces: Workspace[];
  }
  
  // import { z } from 'zod';

  // Updated schema to handle Base64 string or null for `logo`
  export const CreateWorkspaceFormSchema = z.object({
    workspaceName: z.string().min(1, 'Workspace name is required'),
    logo: z.union([z.string().nullable(), z.null()]).optional(),
  });
  
  
  
  export interface Workspace {
    id: string;
    createdAt: string; // DateTime in Prisma maps to string in TypeScript
    userId: string;
    title: string;
    iconId: string;
    data?: string | null;
    inTrash?: string | null;
    logo?: Uint8Array | null;
    bannerUrl?: string | null;
  
    folders: Folder[]; // Assuming Folder is defined elsewhere
    files: File[];     // Assuming File is defined elsewhere
    user: User;        // Assuming User is defined elsewhere
  }
  
  export interface Subscription {
    id: string;
    status: string;
    // other subscription properties
  }

  export interface Folder {
    id: string;
    createdAt: string; // DateTime in Prisma maps to string in TypeScript
    title: string;
    iconId: string;
    data?: string | null;
    inTrash?: string | null;
    bannerUrl?: string | null;
    workspaceId: string;
    files: File[]; // One-to-many relationship with Files
  }
  
  export interface File {
    id: string;
    createdAt: string; // DateTime in Prisma maps to string in TypeScript
    title: string;
    iconId: string;
    data?: string | null;
    inTrash?: string | null;
    bannerUrl?: string | null;
    folderId: string;
  }
  
  export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
      server: NetServer & {
        io: SocketIOServer;
      };
    };
  };