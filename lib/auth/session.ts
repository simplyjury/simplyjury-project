import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  userId: number;
  email: string;
  userType: string;
  exp?: number;
  iat?: number;
  expires?: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    userId: user.id!,
    email: user.email,
    userType: user.userType || 'centre',
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  
  // Next.js 15 production-compatible cookie settings
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieStore = await cookies();
  cookieStore.set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  });
  
  // Debug logging for production
  console.log('🔍 SESSION: Cookie set with options:', {
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
    httpOnly: true
  });
}
