import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendVerificationEmail from "@/lib/email";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "your-email@example.com" },
        password: { label: "Password", type: "password", placeholder: "your-password" },
      },
      async authorize(credentials: any) {
        try {
          const { email, password } = credentials;

          console.log('Starting user query...');

          // Query the database to find the user by email
          const user = await db.user.findFirst({
            where: { email },
          });

          if (user) {
            if (!user.verified) {
              // Generate a new verification token
              const newVerificationToken = crypto.randomBytes(32).toString('hex');

              // Update the user with the new verification token
              await db.user.update({
                where: { id: user.id },
                data: {
                  verificationToken: newVerificationToken,
                },
              });

              // Send the new verification email
              await sendVerificationEmail(email, newVerificationToken);

              console.log('User is not verified. Verification email resent.');
              return null; // Return null to indicate failure, but with a specific error message
            }

            // Verify password
            if (user.pwd) {
              const isPasswordValid = await bcrypt.compare(password, user.pwd);

              if (isPasswordValid) {
                return { id: user.id, name: user.fullName, email: user.email };
              }
            }
          }

          console.log('Authentication failed');
          return null;
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
