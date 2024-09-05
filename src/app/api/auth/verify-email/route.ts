import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Invalid verification token' }, { status: 400 });
    }

    // Find the user by the verification token
    const user = await db.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Verify the user's email and clear the verification token
    await db.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null, // Clear the token
      },
    });

    // Redirect to the sign-in page with a success message
    return NextResponse.redirect('/login?verified=true');
  } catch (error) {
    return NextResponse.json({ message: 'Failed to verify email', error }, { status: 500 });
  }
}
