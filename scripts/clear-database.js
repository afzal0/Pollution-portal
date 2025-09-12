const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...');
  
  try {
    // Use raw SQL for more efficient clearing
    console.log('📊 Clearing pollution_daily table...');
    const { error: pollutionError } = await supabase.rpc('truncate_table', { table_name: 'pollution_daily' });
    
    if (pollutionError) {
      // Fallback to regular delete if RPC doesn't exist
      console.log('⚠️  RPC not available, using regular delete...');
      const { error: deleteError } = await supabase
        .from('pollution_daily')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('❌ Error clearing pollution_daily:', deleteError);
        return false;
      }
    }
    console.log('✅ pollution_daily table cleared');

    // Clear ASGS boundary data
    console.log('🗺️  Clearing ASGS boundary tables...');
    
    const { error: sa2Error } = await supabase.rpc('truncate_table', { table_name: 'asgs_sa2_2021' });
    if (sa2Error) {
      const { error: deleteError } = await supabase
        .from('asgs_sa2_2021')
        .delete()
        .neq('code', 'dummy');
      if (deleteError) {
        console.error('❌ Error clearing asgs_sa2_2021:', deleteError);
      } else {
        console.log('✅ asgs_sa2_2021 table cleared');
      }
    } else {
      console.log('✅ asgs_sa2_2021 table cleared');
    }

    const { error: sa3Error } = await supabase.rpc('truncate_table', { table_name: 'asgs_sa3_2021' });
    if (sa3Error) {
      const { error: deleteError } = await supabase
        .from('asgs_sa3_2021')
        .delete()
        .neq('code', 'dummy');
      if (deleteError) {
        console.error('❌ Error clearing asgs_sa3_2021:', deleteError);
      } else {
        console.log('✅ asgs_sa3_2021 table cleared');
      }
    } else {
      console.log('✅ asgs_sa3_2021 table cleared');
    }

    const { error: sa4Error } = await supabase.rpc('truncate_table', { table_name: 'asgs_sa4_2021' });
    if (sa4Error) {
      const { error: deleteError } = await supabase
        .from('asgs_sa4_2021')
        .delete()
        .neq('code', 'dummy');
      if (deleteError) {
        console.error('❌ Error clearing asgs_sa4_2021:', deleteError);
      } else {
        console.log('✅ asgs_sa4_2021 table cleared');
      }
    } else {
      console.log('✅ asgs_sa4_2021 table cleared');
    }

    // Clear any custom geometry table if it exists
    console.log('📍 Clearing custom geometry tables...');
    
    const { error: sa2GeomError } = await supabase.rpc('truncate_table', { table_name: 'sa2_geometry' });
    if (sa2GeomError) {
      const { error: deleteError } = await supabase
        .from('sa2_geometry')
        .delete()
        .neq('sa2_code', 'dummy');
      if (deleteError) {
        console.log('ℹ️  sa2_geometry table does not exist or is already empty');
      } else {
        console.log('✅ sa2_geometry table cleared');
      }
    } else {
      console.log('✅ sa2_geometry table cleared');
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('📊 All pollution data and boundary data has been removed.');
    console.log('🚀 Ready for fresh data load.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during database cleanup:', error);
    return false;
  }
}

// Run the cleanup
if (require.main === module) {
  clearDatabase()
    .then(success => {
      if (success) {
        console.log('\n✅ Database cleanup completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Database cleanup failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { clearDatabase };
