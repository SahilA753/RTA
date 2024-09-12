import { NextResponse } from 'next/server';
import { db } from '@/lib/db';  // Assuming db is your Prisma instance
import { z } from 'zod';

const searchUserSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = searchUserSchema.parse(body);

    const users = await db.user.findMany({
      where: {
        email: {
          contains: query,
          mode: 'insensitive',  // Case-insensitive search
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
