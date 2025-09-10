import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';
import { TrainingCenterService } from '@/lib/services/training-center-service';
import { withRLSContext } from '@/lib/auth/rls-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
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

    if (!trainingCenter.logoUrl) {
      return NextResponse.json({ error: 'Aucun logo à supprimer' }, { status: 404 });
    }

    // Extract the file path from the logo URL
    const url = new URL(trainingCenter.logoUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get {training_center_id}/logo.ext

    // Delete the file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('logo-centres')
      .remove([filePath]);

    if (deleteError) {
      console.error('Storage deletion error:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du fichier' }, { status: 500 });
    }

    // Update the database to remove the logo URL
    const updatedCenter = await withRLSContext(userId, async () => {
      return await TrainingCenterService.updateProfile(userId, { logoUrl: null });
    });

    if (!updatedCenter) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Logo supprimé avec succès'
    });

  } catch (error) {
    console.error('Logo deletion error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du logo' },
      { status: 500 }
    );
  }
}
