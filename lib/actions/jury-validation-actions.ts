'use server';

import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { EmailService } from '@/lib/email/resend-service';

export async function notifyValidatorsOfNewJury(juryUserId: number) {
  try {
    console.log('Starting validator notification process for jury user ID:', juryUserId);

    // Get the jury profile with user data
    const juryData = await db
      .select({
        user: users,
        profile: juryProfiles,
      })
      .from(users)
      .innerJoin(juryProfiles, eq(juryProfiles.userId, users.id))
      .where(eq(users.id, juryUserId))
      .limit(1);

    if (!juryData.length) {
      console.error('Jury profile not found for user ID:', juryUserId);
      return { success: false, error: 'Jury profile not found' };
    }

    const { user: juryUser, profile: juryProfile } = juryData[0];

    // Get all validators (admins and users with is_validator = true)
    const validators = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        isValidator: users.isValidator,
      })
      .from(users)
      .where(
        or(
          eq(users.userType, 'admin'),
          eq(users.isValidator, true)
        )
      );

    console.log(`Found ${validators.length} validators to notify`);

    if (validators.length === 0) {
      console.warn('No validators found in the system');
      return { success: false, error: 'No validators found' };
    }

    // Send email to each validator
    const emailPromises = validators.map(async (validator) => {
      try {
        console.log(`Sending validation email to validator: ${validator.email}`);
        
        await EmailService.sendJuryValidationRequest(
          validator.email,
          validator.name || 'Validateur',
          {
            firstName: juryProfile.firstName,
            lastName: juryProfile.lastName,
            region: juryProfile.region,
            city: juryProfile.city || undefined,
            hourlyRate: juryProfile.hourlyRate ? Number(juryProfile.hourlyRate) : undefined,
            profilePhotoUrl: juryProfile.profilePhotoUrl || undefined,
            expertiseDomains: juryProfile.expertiseDomains || [],
          }
        );

        console.log(`Successfully sent email to validator: ${validator.email}`);
        return { success: true, email: validator.email };
      } catch (error) {
        console.error(`Failed to send email to validator ${validator.email}:`, error);
        return { success: false, email: validator.email, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    
    // Count successful and failed emails
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    ).length;

    console.log(`Notification summary: ${successful} successful, ${failed} failed`);

    return {
      success: true,
      message: `Notifications sent to ${successful} validators`,
      details: {
        total: validators.length,
        successful,
        failed,
        juryName: `${juryProfile.firstName} ${juryProfile.lastName}`,
      }
    };

  } catch (error) {
    console.error('Error in notifyValidatorsOfNewJury:', error);
    return {
      success: false,
      error: 'Failed to notify validators',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
