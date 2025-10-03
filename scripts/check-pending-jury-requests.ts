/**
 * Script to check jury users with pending requests for future sessions
 * 
 * This script queries the database to find:
 * - Jury users who have pending requests (status = 'pending')
 * - For sessions scheduled in the future (session_date > today)
 * - Shows count and details of pending requests per jury
 * 
 * Usage: npx tsx scripts/check-pending-jury-requests.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPendingJuryRequests() {
  console.log('🔍 Checking for jury users with pending future session requests...\n');

  try {
    // Query jury requests with pending status for future sessions
    const { data: requests, error } = await supabase
      .from('jury_requests')
      .select(`
        id,
        jury_id,
        status,
        session_date,
        session_start_time,
        session_end_time,
        certification_title,
        certification_code,
        candidate_count,
        modality,
        session_location,
        created_at,
        training_centers!inner(
          id,
          name,
          contact_person_name,
          contact_person_email
        ),
        users!jury_requests_jury_id_fkey!inner(
          id,
          email,
          name,
          user_type
        )
      `)
      .eq('status', 'pending')
      .gte('session_date', new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true });

    if (error) {
      console.error('❌ Database query error:', error);
      return;
    }

    if (!requests || requests.length === 0) {
      console.log('✅ No pending requests found for future sessions');
      return;
    }

    // Get jury profile details
    const juryIds = [...new Set(requests.map(r => r.jury_id))];
    const { data: juryProfiles, error: profileError } = await supabase
      .from('jury_profiles')
      .select('user_id, first_name, last_name, phone, region, city')
      .in('user_id', juryIds);

    if (profileError) {
      console.error('⚠️  Could not fetch jury profiles:', profileError);
    }

    // Create a map of jury profiles
    const profileMap = new Map(
      juryProfiles?.map(p => [p.user_id, p]) || []
    );

    // Group requests by jury
    const requestsByJury = requests.reduce((acc, request) => {
      const juryId = request.jury_id;
      if (!acc[juryId]) {
        acc[juryId] = {
          jury: request.users,
          profile: profileMap.get(juryId),
          requests: []
        };
      }
      acc[juryId].requests.push(request);
      return acc;
    }, {} as Record<number, any>);

    // Display results
    console.log(`📊 Found ${requests.length} pending request(s) for ${Object.keys(requestsByJury).length} jury user(s)\n`);
    console.log('═'.repeat(80));

    Object.entries(requestsByJury).forEach(([juryId, data], index) => {
      const { jury, profile, requests } = data;
      
      console.log(`\n${index + 1}. JURY USER #${juryId}`);
      console.log('─'.repeat(80));
      console.log(`   Name: ${profile?.first_name || ''} ${profile?.last_name || jury.name || 'N/A'}`);
      console.log(`   Email: ${jury.email}`);
      console.log(`   Phone: ${profile?.phone || 'Not provided'}`);
      console.log(`   Location: ${profile?.city || 'N/A'}, ${profile?.region || 'N/A'}`);
      console.log(`   Pending Requests: ${requests.length}`);
      console.log('');

      requests.forEach((req: any, reqIndex: number) => {
        const sessionDate = new Date(req.session_date);
        const daysUntil = Math.ceil((sessionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`   ${reqIndex + 1}. Request #${req.id}`);
        console.log(`      📅 Session Date: ${sessionDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })} (in ${daysUntil} days)`);
        
        if (req.session_start_time) {
          console.log(`      ⏰ Time: ${req.session_start_time} - ${req.session_end_time || 'N/A'}`);
        }
        
        console.log(`      🎓 Certification: ${req.certification_title}`);
        if (req.certification_code) {
          console.log(`      📋 Code: ${req.certification_code}`);
        }
        
        console.log(`      🏢 Training Center: ${req.training_centers.name}`);
        console.log(`      👥 Candidates: ${req.candidate_count}`);
        console.log(`      📍 Modality: ${req.modality}`);
        
        if (req.session_location) {
          console.log(`      🗺️  Location: ${req.session_location}`);
        }
        
        console.log(`      📧 Center Contact: ${req.training_centers.contact_person_name} (${req.training_centers.contact_person_email})`);
        
        const createdDate = new Date(req.created_at);
        const daysAgo = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`      📨 Request sent: ${daysAgo} day(s) ago`);
        console.log('');
      });
    });

    console.log('═'.repeat(80));
    console.log('\n✅ Query completed successfully');

    // Summary statistics
    const urgentRequests = requests.filter(r => {
      const daysUntil = Math.ceil((new Date(r.session_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });

    console.log('\n📈 SUMMARY:');
    console.log(`   Total pending requests: ${requests.length}`);
    console.log(`   Unique jury users: ${Object.keys(requestsByJury).length}`);
    console.log(`   Urgent (≤7 days): ${urgentRequests.length}`);
    console.log(`   Average requests per jury: ${(requests.length / Object.keys(requestsByJury).length).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkPendingJuryRequests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
