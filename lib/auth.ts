import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { User } from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).lean();
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, (user as any).password);
        if (!valid) return null;
        return {
          id:                ((user as any)._id as any).toString(),
          email:             (user as any).email,
          name:              (user as any).full_name,
          image:             (user as any).avatar_url,
          role:              (user as any).role,
          assigned_place_id: (user as any).assigned_place_id,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                = user.id;
        token.role              = (user as any).role;
        token.assigned_place_id = (user as any).assigned_place_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id                = token.id;
        (session.user as any).role              = token.role;
        (session.user as any).assigned_place_id = token.assigned_place_id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
