// src/api/getWorkspaceById/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the import path to your Prisma client instance
import { z } from 'zod';

// Define validation schema using Zod
const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(), // Use z.string().datetime() to match ISO format
  userId: z.string(),
  title: z.string(),
  iconId: z.string(),
  logo: z.union([
    z.string().nullable(), // If logo can be a base64 string
    z.instanceof(Uint8Array).nullable() // For Uint8Array directly
  ]),
  folders: z.array(z.any()).optional(), // Assuming Folder is defined elsewhere
  files: z.array(z.any()).optional(),   // Assuming File is defined elsewhere
  user: z.any(),  
});

type WorkspaceResponse = z.infer<typeof WorkspaceSchema>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    // Fetch the workspace details by ID
    const workspace = await db.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        Folders: true, // Assuming you want to include related folders
        user: true,    // Assuming you want to include related user information
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Validate and transform the workspace data if needed
    const parsedWorkspace = WorkspaceSchema.parse(workspace);

    return NextResponse.json(parsedWorkspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
