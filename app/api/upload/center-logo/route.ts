import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';
import { TrainingCenterService } from '@/lib/services/training-center-service';
import { withRLSContext } from '@/lib/auth/rls-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;

    // Get the training center for this user
    const trainingCenter = await withRLSContext(userId, async () => {
      return await TrainingCenterService.getByUserId(userId);
    });

    if (!trainingCenter) {
      return NextResponse.json({ error: 'Centre de formation non trouvé' }, { status: 404 });
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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 5MB' }, { status: 400 });
    }

    // Generate file path: {training_center_id}/logo.{extension}
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `${trainingCenter.id}/logo.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('logo-centres')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('logo-centres')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du logo' },
      { status: 500 }
    );
  }
}
