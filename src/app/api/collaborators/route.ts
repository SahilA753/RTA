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
