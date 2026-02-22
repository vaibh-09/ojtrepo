
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vharvahgmlilbuppwjdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYXJ2YWhnbWxpbGJ1cHB3amRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDgzMDAsImV4cCI6MjA4NTc4NDMwMH0.e9qrPlfkRM-FfdQhD1DLV4dSB33vcR8fFoGGc7lf8ms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('--- Fetching contact_images data ---');
  const { data, error } = await supabase.from('contact_images').select('*').limit(5);
  if (error) {
    console.error('Error fetching table:', error);
  } else {
    console.log('Table Data:', JSON.stringify(data, null, 2));
  }

  console.log('\n--- Listing Storage Buckets ---');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('Error listing buckets:', bError);
  } else {
    console.log('Buckets:', JSON.stringify(buckets, null, 2));
  }
}

debug();
