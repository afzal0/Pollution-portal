const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupGeometryTable() {
  console.log('🔧 Setting up SA2 geometry table...');
  
  try {
    // Create the SA2 geometry table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.sa2_geometry (
          sa2_code TEXT PRIMARY KEY,
          sa2_name TEXT NOT NULL,
          state_name TEXT NOT NULL,
          centroid_lat DOUBLE PRECISION NOT NULL,
          centroid_lon DOUBLE PRECISION NOT NULL,
          geom GEOMETRY(Point, 4326) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ SA2 geometry table created');
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.sa2_geometry ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // Add policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'sa2_geometry' AND policyname = 'allow read'
          ) THEN
            CREATE POLICY "allow read" ON public.sa2_geometry FOR SELECT USING (true);
          END IF;
        END $$;
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'sa2_geometry' AND policyname = 'allow insert'
          ) THEN
            CREATE POLICY "allow insert" ON public.sa2_geometry FOR INSERT WITH CHECK (true);
          END IF;
        END $$;
      `
    });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    } else {
      console.log('✅ Policies created');
    }
    
    // Add indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_sa2_geometry_state ON public.sa2_geometry(state_name);
        CREATE INDEX IF NOT EXISTS idx_sa2_geometry_geom ON public.sa2_geometry USING GIST (geom);
      `
    });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created');
    }
    
    console.log('🎉 SA2 geometry table setup complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
if (require.main === module) {
  setupGeometryTable().catch(console.error);
}

module.exports = { setupGeometryTable };
