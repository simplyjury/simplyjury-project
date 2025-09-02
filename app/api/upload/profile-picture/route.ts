import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/storage/supabase-client';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
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
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Erreur lors du téléchargement', details: error }, { status: 500 });
    }


    // Get signed URL for private bucket (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: signedUrlData.signedUrl,
      path: filePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
}
