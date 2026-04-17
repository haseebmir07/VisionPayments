// ============================================================
// Vision Glass & Interior — NextAuth v5 Configuration
// ============================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { UserRole } from '@/types';

import { authConfig } from '@/lib/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select(
          '+passwordHash'
        );

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isValid = await user.comparePassword(credentials.password as string);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await User.create({
            name: user.name ?? 'User',
            email: user.email ?? '',
            passwordHash: 'oauth-no-password',
            role: 'user',
            image: user.image ?? undefined,
          });
          user.id = newUser._id?.toString() || '';
          user.role = newUser.role as UserRole;
        } else {
          user.id = existingUser._id?.toString() || '';
          user.role = existingUser.role as UserRole;
        }
      }
      return true;
    },
  },
});
