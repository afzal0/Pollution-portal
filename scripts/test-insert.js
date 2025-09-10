const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing data insert...');
  
  // Test with a few sample records
  const testRecords = [
    {
      pollutant: 'SO2',
      date: '2024-01-01',
      ste_name: 'Australian Capital Territory',
      sa2_code: '801031113',
      sa2_name: 'Canberra East',
      centroid_lat: -35.359881369742176,
      centroid_lon: 149.16075888543332,
      value: 0.0004346235351459171
    },
    {
      pollutant: 'NO2',
      date: '2024-01-01',
      ste_name: 'New South Wales',
      sa2_code: '101011001',
      sa2_name: 'Sydney - Haymarket - The Rocks',
      centroid_lat: -33.8688,
      centroid_lon: 151.2093,
      value: 0.001234567
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('pollution_daily')
      .insert(testRecords)
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      
      // Check if it's an RLS issue
      if (error.code === '42501') {
        console.log('\nRLS Policy Issue Detected!');
        console.log('The table has Row Level Security enabled but no policy allows inserts.');
        console.log('Let me check the current policies...');
        
        // Check current policies
        const { data: policies, error: policyError } = await supabase
          .rpc('get_table_policies', { table_name: 'pollution_daily' });
        
        if (policyError) {
          console.log('Could not fetch policies:', policyError);
        } else {
          console.log('Current policies:', policies);
        }
      }
    } else {
      console.log('Success! Inserted records:', data);
      
      // Verify the data was inserted
      const { data: verifyData, error: verifyError } = await supabase
        .from('pollution_daily')
        .select('*')
        .limit(5);
      
      if (verifyError) {
        console.error('Verify error:', verifyError);
      } else {
        console.log('Verified data in table:', verifyData);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testInsert();
