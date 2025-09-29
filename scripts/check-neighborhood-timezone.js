#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNeighborhoodTimezone(neighborhoodId) {
  console.log('🔍 Checking timezone settings for neighborhood:', neighborhoodId);

  try {
    // First, let's list all neighborhoods to see what's available
    console.log('\n📋 Listing all neighborhoods...');
    const { data: allNeighborhoods, error: allError } = await supabase
      .from('neighborhoods')
      .select('id, name, timezone, last_weekly_digest_sent, created_at');

    if (allError) {
      console.error('❌ Error fetching all neighborhoods:', allError);
    } else {
      console.log(`Found ${allNeighborhoods?.length || 0} neighborhoods:`);
      if (allNeighborhoods?.length > 0) {
        allNeighborhoods.forEach(n => {
          console.log(`  - ${n.name} (${n.id.slice(0,8)}...)`);
          console.log(`    Timezone: ${n.timezone || 'NOT SET'}`);
        });
      }
    }

    // Get specific neighborhood details including timezone
    const { data: neighborhood, error } = await supabase
      .from('neighborhoods')
      .select('id, name, timezone, last_weekly_digest_sent, created_at')
      .eq('id', neighborhoodId)
      .single();

    if (error) {
      console.error('❌ Error fetching neighborhood:', error);
      return;
    }

    if (!neighborhood) {
      console.error('❌ Neighborhood not found with ID:', neighborhoodId);
      return;
    }

    console.log('\n📍 Neighborhood Details:');
    console.log('  Name:', neighborhood.name);
    console.log('  ID:', neighborhood.id);
    console.log('  Timezone:', neighborhood.timezone || 'NOT SET ❌');
    console.log('  Last digest sent:', neighborhood.last_weekly_digest_sent || 'NEVER');
    console.log('  Created:', neighborhood.created_at);

    // Check current time in different timezones
    const now = new Date();
    console.log('\n🕒 Current Time Analysis:');
    console.log('  UTC Time:', now.toISOString());
    console.log('  Local Time (PDT):', now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

    if (neighborhood.timezone) {
      try {
        const neighborhoodTime = now.toLocaleString('en-US', {
          timeZone: neighborhood.timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
        console.log(`  Neighborhood Time (${neighborhood.timezone}):`, neighborhoodTime);
      } catch (tzError) {
        console.log(`  ❌ Invalid timezone: ${neighborhood.timezone}`);
      }
    }

    // Test the digest readiness function
    console.log('\n🧪 Testing digest readiness...');
    const { data: readyNeighborhoods, error: readyError } = await supabase
      .rpc('get_neighborhoods_ready_for_digest');

    if (readyError) {
      console.error('❌ Error checking digest readiness:', readyError);
    } else {
      const isReady = readyNeighborhoods?.find(n => n.neighborhood_id === neighborhoodId);
      console.log('  Ready for digest:', isReady ? '✅ YES' : '❌ NO');

      if (readyNeighborhoods?.length > 0) {
        console.log('\n📋 All neighborhoods ready for digest:');
        readyNeighborhoods.forEach(n => {
          console.log(`  - ${n.neighborhood_name} (${n.neighborhood_id})`);
          console.log(`    Timezone: ${n.timezone || 'NOT SET'}`);
          console.log(`    Last sent: ${n.last_sent || 'NEVER'}`);
        });
      } else {
        console.log('  No neighborhoods are currently ready for digest');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get neighborhood ID from command line or use default
const neighborhoodId = process.argv[2] || '1d0871ba-a651-4c22-9fe6-7dfb915b5cc9';

checkNeighborhoodTimezone(neighborhoodId);