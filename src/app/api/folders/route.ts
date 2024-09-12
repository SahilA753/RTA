import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';  // Assuming db is your Prisma instance
import { File } from '@/lib/types';
// Zod schema to validate request body

const FileSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    title: z.string(),
    iconId: z.string(),
    file: z.instanceof(Uint8Array),
    data: z.string().nullable(),
    inTrash: z.string().nullable(),
    bannerUrl: z.string().nullable(),
    workspaceId: z.string(),
    folderId: z.string(),
  });
  
  const FolderSchema = z.object({
    id: z.string().optional(),
    createdAt: z.string(),
    title: z.string(),
    iconId: z.string(),
    data: z.string().nullable(),
    inTrash: z.string().nullable(),
    bannerUrl: z.string().nullable(),
    workspaceId: z.string(),
    files: z.array(FileSchema).optional(), // Define the files field as an optional array of FileSchema
  });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');
    console.log(workspaceId);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    // Fetch folders by workspaceId
    const folders = await db.folder.findMany({
      where: { workspaceId },
    });
    return NextResponse.json(folders, { status: 200 });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newFolder = body;
    // const newFolder = FolderSchema.parse(body);
    console.log(newFolder)
    if (newFolder.id) {
      // Check if the folder exists
      const existingFolder = await db.folder.findUnique({
        where: { id: newFolder.id },
      });

      
      if (existingFolder) {
        
        console.log("Existing Folder" ,existingFolder);
        await db.folder.update({
          where: { id: newFolder.id },
          data: {
            ...(newFolder.title && { title: newFolder.title }),
            ...(newFolder.iconId && { iconId: newFolder.iconId }),
            ...(newFolder.data !== undefined && { data: newFolder.data }),
            ...(newFolder.inTrash !== undefined && { inTrash: newFolder.inTrash }),
            ...(newFolder.bannerUrl !== undefined && { bannerUrl: newFolder.bannerUrl }),
            ...(newFolder.workspaceId && { workspaceId: newFolder.workspaceId }),
          },
        });
        

        return NextResponse.json({ message: 'Folder updated successfully' }, { status: 200 });
      } 
    else {
      // Create a new folder
      const alpha = await db.folder.create({
        data: {
          ...newFolder,
          createdAt: new Date().toISOString(), // Set creation timestamp
        },
      });

      console.log(alpha)

      return NextResponse.json({ message: 'Folder created successfully' }, { status: 201 });
    }
  } }catch (error) {
    console.error('Error handling folders:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
