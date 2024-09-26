import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';  // Assuming db is your Prisma instance

// Zod schema to validate the File request body
const FileSchema = z.object({
  id: z.string().optional(),  // Optional for create, required for update
  createdAt: z.string().optional(),  // Will be generated on creation
  title: z.string(),
  iconId: z.string(),
  data: z.string().nullable(),
  inTrash: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  folderId: z.string(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folderId = url.searchParams.get('id');
    // console.log(folderId)
    if (!folderId) {
      return NextResponse.json({ error: 'Missing folderId' }, { status: 400 });
    }

    // Fetch files by folderId
    const files = await db.file.findMany({
      where: { folderId },
    });
    
    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newFile = body;

    // console.log(newFile)

    // const newFile = FileSchema.parse(body);
    
    // Check if the file exists
    const existingFile = await db.file.findUnique({
        where: { id: newFile.id },
    });
    
    if (existingFile) {
        // Update the existing file
        await db.file.update({
            where: { id: newFile.id },
            data: {
                ...(newFile.title && { title: newFile.title }),
                ...(newFile.iconId && { iconId: newFile.iconId }),
                ...(newFile.data  && { data: newFile.data }),
                ...(newFile.inTrash  && { inTrash: newFile.inTrash }),
                ...(newFile.bannerUrl  && { bannerUrl: newFile.bannerUrl }),
                ...(newFile.folderId && { folderId: newFile.folderId }),
            },
        });
        
        return NextResponse.json({ message: 'File updated successfully' }, { status: 200 });
    } 
    
    console.log(newFile)

    const createdFile = await db.file.create({
        data: {
          ...newFile,
        },
      });      

    return NextResponse.json({ message: 'File created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error handling files:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
