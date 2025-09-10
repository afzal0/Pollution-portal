const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ptxlochlphdolhxmpyfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGxvY2hscGhkb2xoeG1weWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTA3NDAsImV4cCI6MjA3Mjk4Njc0MH0.wsvVLfaiPrzarHe7NiJjroxQLlDh4YqNHJ4mhtaKxn8';
const supabase = createClient(supabaseUrl, supabaseKey);

// State mapping
const stateMap = {
  'ACT-pollution-data': 'Australian Capital Territory',
  'Nsw-pollution-data': 'New South Wales', 
  'NT-pollution-data': 'Northern Territory',
  'QLD-pollution-data': 'Queensland'
};

// Pollutant mapping from folder names
const pollutantMap = {
  'SO2_OFFL': 'SO2',
  'NO2_OFFL': 'NO2', 
  'CO_OFFL': 'CO',
  'O3_OFFL': 'O3',
  'HCHO_OFFL': 'HCHO',
  'AER_AI_OFFL': 'AER_AI',
  'AER_LH_OFFL': 'AER_LH',
  'CH4_OFFL': 'CH4',
  'CLOUD_OFFL': 'CLOUD',
  'O3_TCL_OFFL': 'O3_TCL'
};

async function loadCSVFile(filePath, stateName, pollutant) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map CSV columns to our database schema
        const record = {
          pollutant: pollutant,
          date: row.date,
          ste_name: stateName,
          sa2_code: row.SA2_CODE21,
          sa2_name: row.SA2_NAME21,
          centroid_lat: parseFloat(row.centroid_lat),
          centroid_lon: parseFloat(row.centroid_lon),
          value: parseFloat(row.value)
        };
        results.push(record);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function loadSampleData() {
  const dataDir = path.join(__dirname, '..', '..', 'Data');
  let totalRecords = 0;
  let processedFiles = 0;
  
  console.log('Loading sample data (first 5 files from each state)...');
  
  // Process each state folder
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      console.log(`Skipping ${stateName} - folder not found`);
      continue;
    }
    
    console.log(`\nProcessing ${stateName}...`);
    
    // Get all year folders
    const yearFolders = fs.readdirSync(stateDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .slice(0, 2); // Only process first 2 year folders
    
    for (const yearFolder of yearFolders) {
      const yearDir = path.join(stateDir, yearFolder);
      
      // Extract pollutant from folder name
      const pollutantMatch = yearFolder.match(/([A-Z_]+)_OFFL$/);
      if (!pollutantMatch) continue;
      
      const pollutant = pollutantMap[pollutantMatch[1]] || pollutantMatch[1];
      
      // Get first 5 CSV files in this year folder
      const csvFiles = fs.readdirSync(yearDir)
        .filter(file => file.endsWith('.csv'))
        .slice(0, 5); // Only process first 5 files
      
      console.log(`  Processing ${yearFolder} (${csvFiles.length} files)...`);
      
      for (const csvFile of csvFiles) {
        try {
          const filePath = path.join(yearDir, csvFile);
          const records = await loadCSVFile(filePath, stateName, pollutant);
          
          if (records.length > 0) {
            // Insert batch into Supabase
            const { error } = await supabase
              .from('pollution_daily')
              .insert(records);
            
            if (error) {
              console.error(`Error inserting ${csvFile}:`, error);
            } else {
              totalRecords += records.length;
              processedFiles++;
              console.log(`    ✓ ${csvFile}: ${records.length} records`);
            }
          }
        } catch (error) {
          console.error(`Error processing ${csvFile}:`, error);
        }
      }
    }
  }
  
  console.log(`\nSample data load complete!`);
  console.log(`Total files processed: ${processedFiles}`);
  console.log(`Total records inserted: ${totalRecords}`);
  
  // Update geometry column using RPC
  console.log('\nUpdating geometry column...');
  const { error: geomError } = await supabase.rpc('update_pollution_geometry');
    
  if (geomError) {
    console.error('Error updating geometry:', geomError);
  } else {
    console.log('Geometry updated successfully!');
  }
  
  // Show sample of loaded data
  console.log('\nSample of loaded data:');
  const { data: sampleData, error: sampleError } = await supabase
    .from('pollution_daily')
    .select('*')
    .limit(5);
    
  if (sampleError) {
    console.error('Error fetching sample data:', sampleError);
  } else {
    console.log(sampleData);
  }
}

// Run the sample data load
if (require.main === module) {
  loadSampleData().catch(console.error);
}

module.exports = { loadSampleData };
