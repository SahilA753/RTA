// /app/api/getUserByEmail/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        verified: true,
        verificationToken: true,
        avatarUrl: true,
        fullName: true,
        billingAddress: true,
        updatedAt: true,
        paymentMethod: true,
        subscriptions: true,  // Include related subscriptions
        workspaces: true,      // Include related workspaces
        pwd: true,             // Include pwd field
      },
    });
    
    // Set the pwd field to null
    if (user) {
      user.pwd = null; // Change pwd to null
    }
    
    // Now `user` will contain all fields with pwd set to null
    
      

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
