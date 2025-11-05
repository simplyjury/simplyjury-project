import { NextResponse } from 'next/server';
import { SystemSettingsService } from '@/lib/services/system-settings-service';

// Public endpoint to get social network URLs for the homepage footer
export async function GET() {
  try {
    const settings = await SystemSettingsService.getSystemSettings();
    return NextResponse.json({
      linkedinUrl: settings?.linkedinUrl ?? null,
      youtubeUrl: settings?.youtubeUrl ?? null,
      instagramUrl: settings?.instagramUrl ?? null,
    });
  } catch (error) {
    console.error('Error getting social network settings:', error);
    return NextResponse.json(
      { error: 'Failed to get social network settings' },
      { status: 500 }
    );
  }
}
