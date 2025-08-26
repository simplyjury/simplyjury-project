import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  private static readonly JWT_SECRET = process.env.AUTH_SECRET!;
  private static readonly JWT_EXPIRES_IN = '7d';

  static async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  static async generateJWT(userId: number, email: string, userType: string): Promise<string> {
    const secret = new TextEncoder().encode(this.JWT_SECRET);
    
    return await new SignJWT({ userId, email, userType })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(this.JWT_EXPIRES_IN)
      .setIssuedAt()
      .sign(secret);
  }

  static async verifyJWT(token: string): Promise<any> {
    const secret = new TextEncoder().encode(this.JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static generateEmailVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async createUser(data: {
    email: string;
    password: string;
    name?: string;
    userType: 'centre' | 'jury';
  }) {
    const hashedPassword = await this.hashPassword(data.password);
    const verificationToken = this.generateEmailVerificationToken();

    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      userType: data.userType,
      emailVerificationToken: verificationToken,
      emailVerified: false,
      profileCompleted: false,
      validationStatus: 'pending',
    }).returning();

    return { user, verificationToken };
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();

    return !!user;
  }

  static async sendPasswordResetEmail(email: string): Promise<string | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (!user) return null;
    
    const token = this.generatePasswordResetToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
      
    return token;
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return true;
  }

  static async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  static async getUserWithProfile(userId: number) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  }

  static async validateUserProfile(userId: number, status: 'validated' | 'rejected', comment?: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({
        validationStatus: status,
        validationComment: comment,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return !!user;
  }

  static async markProfileCompleted(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  static async authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Debug log to check the user object
    console.log('AuthService.authenticateUser - User object:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    });

    return { success: true, user };
  }

  static async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }
}
