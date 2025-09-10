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
  'QLD-pollution-data': 'Queensland',
  'SA-pollution-data': 'South Australia',
  'TAS-pollution-data': 'Tasmania',
  'Vic-pollution-data': 'Victoria',
  'WA-pollution-data': 'Western Australia'
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
        // Map CSV columns to our database schema (NO GEOMETRY)
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

async function loadAllData() {
  const dataDir = path.join(__dirname, '..', '..', 'Data');
  let totalRecords = 0;
  let processedFiles = 0;
  let totalFiles = 0;
  
  console.log('🚀 Starting comprehensive data load...');
  console.log('📊 Processing all CSV files (NO GEOMETRY COLUMN)\n');
  
  // Count total files first
  console.log('📋 Counting files...');
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    if (!fs.existsSync(stateDir)) continue;
    
    const yearFolders = fs.readdirSync(stateDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const yearFolder of yearFolders) {
      const yearDir = path.join(stateDir, yearFolder);
      const csvFiles = fs.readdirSync(yearDir)
        .filter(file => file.endsWith('.csv'));
      totalFiles += csvFiles.length;
    }
  }
  
  console.log(`📁 Total files to process: ${totalFiles}\n`);
  
  // Process each state folder
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      console.log(`⚠️  Skipping ${stateName} - folder not found`);
      continue;
    }
    
    console.log(`🗺️  Processing ${stateName}...`);
    
    // Get all year folders
    const yearFolders = fs.readdirSync(stateDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const yearFolder of yearFolders) {
      const yearDir = path.join(stateDir, yearFolder);
      
      // Extract pollutant from folder name
      const pollutantMatch = yearFolder.match(/([A-Z_]+)_OFFL$/);
      if (!pollutantMatch) continue;
      
      const pollutant = pollutantMap[pollutantMatch[1]] || pollutantMatch[1];
      
      // Get all CSV files in this year folder
      const csvFiles = fs.readdirSync(yearDir)
        .filter(file => file.endsWith('.csv'));
      
      console.log(`  📁 ${yearFolder} (${csvFiles.length} files)`);
      
      // Process files in batches
      for (let i = 0; i < csvFiles.length; i += 20) {
        const batch = csvFiles.slice(i, i + 20);
        
        for (const csvFile of batch) {
          try {
            const filePath = path.join(yearDir, csvFile);
            const records = await loadCSVFile(filePath, stateName, pollutant);
            
            if (records.length > 0) {
              // Insert batch into Supabase
              const { error } = await supabase
                .from('pollution_daily')
                .insert(records);
              
              if (error) {
                console.error(`    ❌ Error inserting ${csvFile}:`, error.message);
              } else {
                totalRecords += records.length;
                processedFiles++;
                
                // Show progress every 50 files
                if (processedFiles % 50 === 0) {
                  console.log(`    📈 Progress: ${processedFiles}/${totalFiles} files, ${totalRecords.toLocaleString()} records`);
                }
              }
            }
          } catch (error) {
            console.error(`    ❌ Error processing ${csvFile}:`, error.message);
          }
        }
      }
    }
  }
  
  console.log(`\n🎉 Data load complete!`);
  console.log(`📊 Files processed: ${processedFiles}/${totalFiles}`);
  console.log(`📈 Total records inserted: ${totalRecords.toLocaleString()}`);
  
  // Show sample of loaded data
  console.log('\n📋 Sample of loaded data:');
  const { data: sampleData, error: sampleError } = await supabase
    .from('pollution_daily')
    .select('*')
    .limit(3);
    
  if (sampleError) {
    console.error('❌ Error fetching sample data:', sampleError);
  } else {
    console.log(JSON.stringify(sampleData, null, 2));
  }
}

// Run the data load
if (require.main === module) {
  loadAllData().catch(console.error);
}

module.exports = { loadAllData };
