import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';
import { TrainingCenterService } from '@/lib/services/training-center-service';
import { withRLSContext } from '@/lib/auth/rls-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    if (!trainingCenter || !trainingCenter.logoUrl) {
      return NextResponse.json({ error: 'Logo non trouvé' }, { status: 404 });
    }

    // Extract the file path from the logo URL
    const url = new URL(trainingCenter.logoUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get {training_center_id}/logo.ext

    // Create a signed URL for secure access (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('logo-centres')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      // Fallback to public URL if signed URL fails
      const { data: publicUrlData } = supabase.storage
        .from('logo-centres')
        .getPublicUrl(filePath);
      
      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl
      });
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl
    });

  } catch (error) {
    console.error('Logo URL retrieval error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du logo' },
      { status: 500 }
    );
  }
}
