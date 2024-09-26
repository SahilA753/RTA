import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';  // Assuming db is your Prisma instance

// Zod schema to validate request body
const CollaboratorSchema = z.object({
  collaborators: z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
    })
  ),
  workspaceId: z.string(),
});


export async function GET(req: Request) {
  try {
    // Extract the workspaceId from the query params
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // Query the database to find all collaborators for the given workspaceId
    const collaborators = await db.workspaceAccess.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (collaborators.length === 0) {
      return NextResponse.json({ message: 'No collaborators found' }, { status: 404 });
    }

    // Format the response to only return the necessary user details
    const collaboratorDetails = collaborators.map(({ user }) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    }));

    return NextResponse.json({ collaborators: collaboratorDetails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collaborators, workspaceId } = CollaboratorSchema.parse(body);

    // Adding collaborators to the workspace
    const addCollaborators = await db.$transaction(
      collaborators.map((collaborator) =>
        db.workspaceAccess.create({
          data: {
            workspaceId: workspaceId,
            userId: collaborator.id,  // Assuming the collaborator ID is provided
            accessLevel: 'collaborated', // Change access level as required
          },
        })
      )
    );

    // Update the access level of the workspace owner if needed
    await db.workspaceAccess.updateMany({
      where: { workspaceId, accessLevel: 'private' },
      data: { accessLevel: 'shared' },
    });

    return NextResponse.json({ message: 'Collaborators added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding collaborators:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
