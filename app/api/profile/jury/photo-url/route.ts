import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/storage/supabase-client';
import { getSession } from '@/lib/auth/session';
import { JuryProfileService } from '@/lib/services/jury-profile-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get jury profile to find the photo path
    const profile = await JuryProfileService.getByUserId(session.userId);
    
    if (!profile?.profilePhotoUrl) {
      return NextResponse.json({ error: 'Aucune photo de profil' }, { status: 404 });
    }

    // Extract file path from URL
    const urlParts = profile.profilePhotoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `jury-profiles/${fileName}`;

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error } = await supabaseAdmin.storage
      .from('profile-pictures')
      .createSignedUrl(filePath, 60 * 60); // 1 hour

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: signedUrlData.signedUrl
    });

  } catch (error) {
    console.error('Photo URL error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'URL de la photo' },
      { status: 500 }
    );
  }
}
