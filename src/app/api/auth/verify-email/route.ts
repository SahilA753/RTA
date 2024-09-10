import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
    }

    // Find the user with the corresponding verification token
    const user = await db.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Update the user to mark them as verified
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null, // Clear the token once verified
      },
    });

    return NextResponse.json({
      message: 'Email verified successfully',
      user: updatedUser,
    });
  } catch (error) {
    // Narrowing the type of error to handle it correctly
    if (error instanceof Error) {
      return NextResponse.json({
        message: 'Failed to verify email',
        error: error.message,
      }, { status: 500 });
    } else {
      // Fallback for unknown error types
      return NextResponse.json({
        message: 'Unknown error occurred during verification',
      }, { status: 500 });
    }
  }
}
