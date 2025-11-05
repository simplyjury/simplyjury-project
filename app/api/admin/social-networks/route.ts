import { NextRequest, NextResponse } from 'next/server';
import { SystemSettingsService } from '@/lib/services/system-settings-service';
import { verifyToken } from '@/lib/auth/session';

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

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionCookie.value);
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const isAdmin = await SystemSettingsService.isUserAdmin(session.userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { linkedinUrl, youtubeUrl, instagramUrl } = await request.json();

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    if (linkedinUrl && !urlPattern.test(linkedinUrl)) {
      return NextResponse.json(
        { error: 'LinkedIn URL must be a valid URL starting with http:// or https://' },
        { status: 400 }
      );
    }
    if (youtubeUrl && !urlPattern.test(youtubeUrl)) {
      return NextResponse.json(
        { error: 'YouTube URL must be a valid URL starting with http:// or https://' },
        { status: 400 }
      );
    }
    if (instagramUrl && !urlPattern.test(instagramUrl)) {
      return NextResponse.json(
        { error: 'Instagram URL must be a valid URL starting with http:// or https://' },
        { status: 400 }
      );
    }

    const updatedSettings = await SystemSettingsService.updateSocialNetworkUrls(
      linkedinUrl || null,
      youtubeUrl || null,
      instagramUrl || null,
      session.userId
    );

    return NextResponse.json({
      success: true,
      settings: {
        linkedinUrl: updatedSettings.linkedinUrl,
        youtubeUrl: updatedSettings.youtubeUrl,
        instagramUrl: updatedSettings.instagramUrl,
      },
    });
  } catch (error) {
    console.error('Error updating social network URLs:', error);
    return NextResponse.json(
      { error: 'Failed to update social network URLs' },
      { status: 500 }
    );
  }
}
