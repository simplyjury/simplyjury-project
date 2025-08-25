import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

// Service pour définir le contexte utilisateur pour RLS
export async function setRLSContext(userId: number): Promise<void> {
  // Cette fonction doit être appelée après l'authentification JWT
  // pour définir le contexte utilisateur pour les politiques RLS
  
  // Définir l'utilisateur actuel pour les politiques RLS
  await db.execute(sql`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`);
}

// Utilisation dans le middleware d'authentification
export async function withRLSContext<T>(userId: number, callback: () => Promise<T>): Promise<T> {
  await setRLSContext(userId);
  try {
    return await callback();
  } finally {
    // Nettoyer le contexte après utilisation
    await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
  }
}

// Helper pour obtenir l'ID utilisateur actuel depuis le contexte RLS
export async function getCurrentUserId(): Promise<number | null> {
  const result = await db.execute(sql`SELECT current_setting('app.current_user_id', true) as user_id`);
  const userId = result[0]?.user_id;
  return userId && userId !== '' ? parseInt(userId as string) : null;
}
