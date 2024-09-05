import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db"; 

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
      

          if (user&&user.pwd===password) {
            return { id: user.id, name: user.fullName, email: user.email };
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
    signIn: "/login", // Point to your custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
