const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeConstraints() {
  console.log('🔧 Removing database constraints...');
  
  try {
    // Remove NOT NULL constraints
    const constraints = [
      'ALTER TABLE public.pollution_daily ALTER COLUMN date DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN ste_name DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN sa2_code DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN sa2_name DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN value DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN pollutant DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN centroid_lat DROP NOT NULL;',
      'ALTER TABLE public.pollution_daily ALTER COLUMN centroid_lon DROP NOT NULL;'
    ];
    
    for (const sql of constraints) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.log(`⚠️  ${sql} - ${error.message}`);
        } else {
          console.log(`✅ ${sql}`);
        }
      } catch (err) {
        console.log(`⚠️  ${sql} - ${err.message}`);
      }
    }
    
    console.log('\n🎉 Constraint removal complete!');
    
  } catch (error) {
    console.error('❌ Error removing constraints:', error);
  }
}

// Run the constraint removal
if (require.main === module) {
  removeConstraints().catch(console.error);
}

module.exports = { removeConstraints };
