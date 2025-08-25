import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, name: string): Promise<string> {
  const token = generateVerificationToken();
  
  // Sauvegarder le token en base
  await db
    .update(users)
    .set({ 
      emailVerificationToken: token,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email));
    
  return token;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  if (!user) return false;

  await db
    .update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return true;
}

export async function resendVerificationEmail(email: string): Promise<string | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.emailVerified) return null;

  const token = generateVerificationToken();
  
  await db
    .update(users)
    .set({ 
      emailVerificationToken: token,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return token;
}
