import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/storage/supabase-client';
import { getSession } from '@/lib/auth/session';
import { JuryProfileService } from '@/lib/services/jury-profile-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 5MB' }, { status: 400 });
    }

    const userId = session.userId;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `jury-profiles/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
    }

    // Get signed URL for private bucket (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL' }, { status: 500 });
    }

    // Update jury profile with the photo URL
    await JuryProfileService.updateProfile(userId, {
      profilePhotoUrl: signedUrlData.signedUrl
    });

    // Get updated profile
    const updatedProfile = await JuryProfileService.getByUserId(userId);

    return NextResponse.json({ 
      success: true, 
      url: signedUrlData.signedUrl,
      path: filePath,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;

    // Get current profile to find the photo path
    const profile = await JuryProfileService.getByUserId(userId);
    
    if (!profile?.profilePhotoUrl) {
      return NextResponse.json({ error: 'Aucune photo de profil à supprimer' }, { status: 404 });
    }

    // Extract file path from the signed URL or stored path
    // The profilePhotoUrl might be a signed URL, so we need to extract the actual path
    let filePath = '';
    
    console.log('Profile photo URL:', profile.profilePhotoUrl);
    
    // If it's a signed URL, extract the path from it
    if (profile.profilePhotoUrl.includes('supabase.co/storage/v1/object/sign/profile-pictures/')) {
      const urlParts = profile.profilePhotoUrl.split('/profile-pictures/')[1];
      if (urlParts) {
        filePath = urlParts.split('?')[0]; // Remove query parameters
        console.log('Extracted file path from signed URL:', filePath);
      }
    } else if (profile.profilePhotoUrl.includes('jury-profiles/')) {
      // If it's already a path format, extract everything after 'profile-pictures/'
      const pathIndex = profile.profilePhotoUrl.indexOf('profile-pictures/');
      if (pathIndex !== -1) {
        filePath = profile.profilePhotoUrl.substring(pathIndex + 'profile-pictures/'.length);
        console.log('Extracted file path from direct path:', filePath);
      }
    }

    // Delete from Supabase Storage if we have a valid path
    if (filePath) {
      console.log('Attempting to delete file:', filePath);
      const { error: deleteError } = await supabaseAdmin.storage
        .from('profile-pictures')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        console.error('Failed to delete file path:', filePath);
        // Continue anyway to update the profile, as the file might already be deleted
      } else {
        console.log('Successfully deleted file from storage:', filePath);
      }
    } else {
      console.error('Could not extract file path from URL:', profile.profilePhotoUrl);
    }

    // Update jury profile to remove the photo URL
    await JuryProfileService.updateProfile(userId, {
      profilePhotoUrl: null
    });

    // Get updated profile
    const updatedProfile = await JuryProfileService.getByUserId(userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Photo de profil supprimée avec succès',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la photo' },
      { status: 500 }
    );
  }
}
