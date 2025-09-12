const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...');
  
  try {
    // Clear all pollution data using TRUNCATE
    console.log('📊 Clearing pollution_daily table...');
    const { error: pollutionError } = await supabase
      .from('pollution_daily')
      .select('count', { count: 'exact' });
    
    if (pollutionError) {
      console.error('❌ Error checking pollution_daily:', pollutionError);
      return false;
    }
    
    // Use a more efficient approach - delete in smaller batches
    console.log('📊 Deleting pollution data in batches...');
    let deletedCount = 0;
    let batchSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('pollution_daily')
        .select('id')
        .limit(batchSize);
      
      if (error) {
        console.error('❌ Error selecting records:', error);
        break;
      }
      
      if (!data || data.length === 0) {
        break;
      }
      
      const ids = data.map(row => row.id);
      const { error: deleteError } = await supabase
        .from('pollution_daily')
        .delete()
        .in('id', ids);
      
      if (deleteError) {
        console.error('❌ Error deleting batch:', deleteError);
        break;
      }
      
      deletedCount += data.length;
      console.log(`  ✓ Deleted ${deletedCount} records...`);
      
      if (data.length < batchSize) {
        break;
      }
    }
    
    console.log('✅ pollution_daily table cleared');

    // Clear ASGS boundary data
    console.log('🗺️  Clearing ASGS boundary tables...');
    
    const { error: sa2Error } = await supabase
      .from('asgs_sa2_2021')
      .delete()
      .neq('code', 'dummy');
    
    if (sa2Error) {
      console.error('❌ Error clearing asgs_sa2_2021:', sa2Error);
    } else {
      console.log('✅ asgs_sa2_2021 table cleared');
    }

    const { error: sa3Error } = await supabase
      .from('asgs_sa3_2021')
      .delete()
      .neq('code', 'dummy');
    
    if (sa3Error) {
      console.error('❌ Error clearing asgs_sa3_2021:', sa3Error);
    } else {
      console.log('✅ asgs_sa3_2021 table cleared');
    }

    const { error: sa4Error } = await supabase
      .from('asgs_sa4_2021')
      .delete()
      .neq('code', 'dummy');
    
    if (sa4Error) {
      console.error('❌ Error clearing asgs_sa4_2021:', sa4Error);
    } else {
      console.log('✅ asgs_sa4_2021 table cleared');
    }

    // Clear any custom geometry table if it exists
    console.log('📍 Clearing custom geometry tables...');
    
    const { error: sa2GeomError } = await supabase
      .from('sa2_geometry')
      .delete()
      .neq('sa2_code', 'dummy');
    
    if (sa2GeomError) {
      console.log('ℹ️  sa2_geometry table does not exist or is already empty');
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
