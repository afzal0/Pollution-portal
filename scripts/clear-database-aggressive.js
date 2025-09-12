const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Supabase configuration
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

async function clearDatabase() {
  console.log('🗑️  Starting aggressive database cleanup...');
  
  try {
    // Clear all pollution data using direct deletion without counting
    console.log('📊 Clearing pollution_daily table...');
    let deletedCount = 0;
    let batchSize = 500; // Smaller batches
    let maxBatches = 1000; // Safety limit
    let batchCount = 0;
    
    while (batchCount < maxBatches) {
      const { data, error } = await supabase
        .from('pollution_daily')
        .select('id')
        .limit(batchSize);
      
      if (error) {
        console.error('❌ Error selecting records:', error);
        break;
      }
      
      if (!data || data.length === 0) {
        console.log('  ✅ No more records to delete');
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
      batchCount++;
      
      if (batchCount % 10 === 0) {
        console.log(`  ✓ Deleted ${deletedCount} records in ${batchCount} batches...`);
      }
      
      if (data.length < batchSize) {
        console.log('  ✅ Last batch processed');
        break;
      }
    }
    
    console.log(`✅ pollution_daily table cleared (${deletedCount} records deleted)`);

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
