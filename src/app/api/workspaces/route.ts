import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the import path to your Prisma client instance
import { z } from 'zod';

// Define validation schema using Zod
const CreateWorkspaceSchema = z.object({
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

type CreateWorkspaceRequest = z.infer<typeof CreateWorkspaceSchema>;

export async function POST(req: Request) {
  try {


    const body = await req.json();
    console.log("Received body:", body);

    // Convert logo to Buffer if it exists
    let logoBuffer: Buffer | null = null;
    if (body.logo) {
      if (typeof body.logo === 'string') {
        // Handle base64 string case
        const base64Data = body.logo.split(',')[1];
        logoBuffer = Buffer.from(base64Data, 'base64');
      } else if (typeof body.logo === 'object') {
        const logoArray = Object.values(body.logo) as number[]; // Explicitly cast to number[]
        const uint8Array = new Uint8Array(logoArray); // Create Uint8Array
        logoBuffer = Buffer.from(uint8Array); // Convert Uint8Array to Buffer
      }
    }

    console.log("Converted logo to Buffer:", logoBuffer);

    // Validate and transform the body
    const parsedBody = CreateWorkspaceSchema.parse({
      ...body,
      logo: logoBuffer, // Ensure logo is set as a Buffer
    });

    // Save the workspace in the database
    const workspace = await db.workspace.create({
      data: {
        id: parsedBody.id,
        title: parsedBody.title,
        iconId: parsedBody.iconId,
        logo: parsedBody.logo as Buffer, // Ensure the logo is stored as a Buffer
        createdAt: parsedBody.createdAt,
        user: {
          connect: { id: parsedBody.userId },
        },
      },
    });

    console.log(workspace)

    const workspaceaccess = await db.workspaceAccess.create({
      data: {
        workspaceId: parsedBody.id,
        userId: parsedBody.userId,
        accessLevel: 'private', 
      },
    });

    console.log(workspaceaccess)

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error in POST handler:", error);
    console.log(Object.keys(db));  // Check if 'workspaceAccess' is listed

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch private workspaces
    const privateWorkspaces = await db.workspaceAccess.findMany({
      where: {
        userId,
        accessLevel: 'private',
      },
      include: {
        workspace: true,
      },
    });

    // Fetch collaborating workspaces
    const collaboratingWorkspaces = await db.workspaceAccess.findMany({
      where: {
        userId,
        accessLevel: 'collaborated',
      },
      include: {
        workspace: true,
      },
    });

    // Fetch shared workspaces
    const sharedWorkspaces = await db.workspaceAccess.findMany({
      where: {
        userId,
        accessLevel: 'shared',
      },
      include: {
        workspace: true,
      },
    });

    // console.log(privateWorkspaces,collaboratingWorkspaces,sharedWorkspaces);

    return NextResponse.json({
      privateWorkspaces: privateWorkspaces.map((wa) => wa.workspace),
      collaboratingWorkspaces: collaboratingWorkspaces.map((wa) => wa.workspace),
      sharedWorkspaces: sharedWorkspaces.map((wa) => wa.workspace),
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

