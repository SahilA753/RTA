import { db } from '@/lib/db'; 
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // For generating verification tokens
import sendVerificationEmail from '@/lib/email';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = signupSchema.parse(body);

    console.log(email,password);

    // Check if the user already exists
    const existingUser = await db.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User is already registered' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create a new user in the database with an unverified status
    await db.user.create({
      data: {
        email,
        pwd: hashedPassword,
        verified: false, // Flag for email verification
        verificationToken, // Save the token for email verification
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: 'Verification email sent. Please check your inbox.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to register user', error }, { status: 400 });
  }
}
