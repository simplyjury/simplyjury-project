import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '@/lib/email/resend-service';

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
  
  // Envoyer l'email via Resend
  try {
    await EmailService.sendVerificationEmail(email, name, token);
    console.log(`Email de vérification envoyé à ${email}`);
  } catch (error) {
    console.error('Erreur envoi email de vérification:', error);
    throw new Error('Impossible d\'envoyer l\'email de vérification');
  }
    
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

  // Envoyer l'email via Resend
  try {
    await EmailService.sendResendVerificationEmail(email, user.name || 'Utilisateur', token);
    console.log(`Email de vérification renvoyé à ${email}`);
  } catch (error) {
    console.error('Erreur renvoi email de vérification:', error);
    throw new Error('Impossible de renvoyer l\'email de vérification');
  }

  return token;
}
