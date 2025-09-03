import { NextRequest, NextResponse } from 'next/server';
import { SystemSettingsService } from '@/lib/services/system-settings-service';
import { verifyToken } from '@/lib/auth/session';

export async function GET() {
  try {
    const settings = await SystemSettingsService.getSystemSettings();
    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode ?? false,
      maintenanceMessage: settings?.maintenanceMessage ?? null,
    });
  } catch (error) {
    console.error('Error getting maintenance settings:', error);
    return NextResponse.json(
      { error: 'Failed to get maintenance settings' },
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

    const { maintenanceMode, maintenanceMessage } = await request.json();

    if (typeof maintenanceMode !== 'boolean') {
      return NextResponse.json(
        { error: 'maintenanceMode must be a boolean' },
        { status: 400 }
      );
    }

    const updatedSettings = await SystemSettingsService.updateMaintenanceMode(
      maintenanceMode,
      maintenanceMessage || null,
      session.userId
    );

    return NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: updatedSettings.maintenanceMode,
        maintenanceMessage: updatedSettings.maintenanceMessage,
      },
    });
  } catch (error) {
    console.error('Error updating maintenance mode:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance mode' },
      { status: 500 }
    );
  }
}
