#!/usr/bin/env node

/**
 * List Neighborhoods Script
 * Shows available neighborhoods in the database
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function listNeighborhoods() {
  console.log('🏘️  Fetching neighborhoods...');
  console.log('🔗 Using URL:', SUPABASE_URL);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/neighborhoods?select=id,name,created_at&limit=20`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const neighborhoods = await response.json();
    
    if (!neighborhoods || neighborhoods.length === 0) {
      console.log('📭 No neighborhoods found');
      return;
    }
    
    console.log(`✅ Found ${neighborhoods.length} neighborhoods:`);
    neighborhoods.forEach((n, i) => {
      console.log(`   ${i+1}. ${n.name}`);
      console.log(`      ID: ${n.id}`);
      console.log(`      Created: ${n.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fetching neighborhoods:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
      console.log('2. Make sure you can access the Supabase API');
      console.log('3. Check your network connection');
    }
  }
}

// Run the script
listNeighborhoods();
