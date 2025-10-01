import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findCenterWithRequests() {
  try {
    console.log('🔍 Searching for training centers with recent jury requests...\n');

    // Get training centers with recent requests (last 10 days)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const { data: requests, error } = await supabase
      .from('jury_requests')
      .select(`
        id,
        training_center_id,
        created_at,
        status,
        certification_type,
        training_centers!inner(
          id,
          name,
          user_id,
          users!inner(
            id,
            email,
            name,
            user_type
          )
        )
      `)
      .gte('created_at', tenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }

    if (!requests || requests.length === 0) {
      console.log('⚠️  No recent requests found in the last 10 days.');
      console.log('Let me check for ANY requests...\n');

      // Try to find ANY center with requests
      const { data: allRequests, error: allError } = await supabase
        .from('jury_requests')
        .select(`
          id,
          training_center_id,
          created_at,
          status,
          certification_type,
          training_centers!inner(
            id,
            name,
            user_id,
            users!inner(
              id,
              email,
              name,
              user_type
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (allError) {
        console.error('❌ Error fetching all requests:', allError);
        return;
      }

      if (!allRequests || allRequests.length === 0) {
        console.log('❌ No jury requests found in the database at all.');
        return;
      }

      console.log(`✅ Found ${allRequests.length} requests (not necessarily recent):\n`);
      
      // Group by center
      const centerMap = new Map();
      allRequests.forEach((req: any) => {
        const center = req.training_centers;
        const user = center.users;
        const centerId = center.id;
        
        if (!centerMap.has(centerId)) {
          centerMap.set(centerId, {
            centerName: center.name,
            email: user.email,
            userName: user.name,
            userId: user.id,
            requests: []
          });
        }
        
        centerMap.get(centerId).requests.push({
          id: req.id,
          createdAt: req.created_at,
          status: req.status,
          certification: req.certification_type
        });
      });

      // Display results
      centerMap.forEach((centerData, centerId) => {
        console.log(`📋 Center: ${centerData.centerName}`);
        console.log(`   Email: ${centerData.email}`);
        console.log(`   User ID: ${centerData.userId}`);
        console.log(`   Total requests: ${centerData.requests.length}`);
        console.log(`   Latest request: ${new Date(centerData.requests[0].createdAt).toLocaleString('fr-FR')}`);
        console.log(`   Oldest request: ${new Date(centerData.requests[centerData.requests.length - 1].createdAt).toLocaleString('fr-FR')}`);
        console.log('');
      });

      return;
    }

    console.log(`✅ Found ${requests.length} recent requests (last 10 days):\n`);

    // Group by center
    const centerMap = new Map();
    requests.forEach((req: any) => {
      const center = req.training_centers;
      const user = center.users;
      const centerId = center.id;
      
      if (!centerMap.has(centerId)) {
        centerMap.set(centerId, {
          centerName: center.name,
          email: user.email,
          userName: user.name,
          userId: user.id,
          requests: []
        });
      }
      
      centerMap.get(centerId).requests.push({
        id: req.id,
        createdAt: req.created_at,
        status: req.status,
        certification: req.certification_type
      });
    });

    // Display results
    centerMap.forEach((centerData, centerId) => {
      console.log(`📋 Center: ${centerData.centerName}`);
      console.log(`   ✉️  Email: ${centerData.email}`);
      console.log(`   👤 User ID: ${centerData.userId}`);
      console.log(`   📨 Recent requests (last 10 days): ${centerData.requests.length}`);
      console.log(`   📅 Latest request: ${new Date(centerData.requests[0].createdAt).toLocaleString('fr-FR')}`);
      console.log('');
    });

    console.log('\n✅ You can use any of the emails above to test the "Demandes récentes" feature.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

findCenterWithRequests();
