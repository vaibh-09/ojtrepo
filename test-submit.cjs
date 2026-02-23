
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vharvahgmlilbuppwjdh.supabase.co';
const supabaseKey = 'sb_publishable_09C44UEV3lThah0xXBnT1A_UX9RYfuB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- Testing insert into contact_form ---');
  const { data, error } = await supabase
    .from('contact_form')
    .insert([
      {
        name: 'Debug Test',
        email: 'test@example.com',
        project_type: 'Test Project',
        message: 'This is a debug test message',
      }
    ]);

  if (error) {
    console.error('Insert Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert Success! Data:', data);
  }
}

testInsert();
