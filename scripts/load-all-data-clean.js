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

// Pollutant mapping
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

async function processCSVFile(filePath, stateName, pollutant) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowCount = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Only process rows that have meaningful data
        if (row.SA2_CODE21 && row.date && row.value) {
          const record = {
            pollutant: pollutant,
            date: row.date,
            ste_name: stateName,
            sa2_code: row.SA2_CODE21,
            sa2_name: row.SA2_NAME21 || null,
            centroid_lat: parseFloat(row.centroid_lat) || null,
            centroid_lon: parseFloat(row.centroid_lon) || null,
            value: parseFloat(row.value) || null
          };
          results.push(record);
        }
      })
      .on('end', () => {
        resolve({ records: results, rowCount });
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
  let errorFiles = 0;
  let emptyFiles = 0;
  
  console.log('🚀 Starting comprehensive data load...');
  console.log('📊 Processing all CSV files with data validation\n');
  
  // Count total files
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
  
  // Process each state
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      console.log(`⚠️  Skipping ${stateName} - folder not found`);
      continue;
    }
    
    console.log(`🗺️  Processing ${stateName}...`);
    
    const yearFolders = fs.readdirSync(stateDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const yearFolder of yearFolders) {
      const yearDir = path.join(stateDir, yearFolder);
      
      // Extract pollutant from folder name
      const pollutantMatch = yearFolder.match(/([A-Z_]+)_OFFL$/);
      if (!pollutantMatch) continue;
      
      const pollutant = pollutantMap[pollutantMatch[1]] || pollutantMatch[1];
      
      const csvFiles = fs.readdirSync(yearDir)
        .filter(file => file.endsWith('.csv'));
      
      console.log(`  📁 ${yearFolder} (${csvFiles.length} files)`);
      
      // Process files in smaller batches
      for (let i = 0; i < csvFiles.length; i += 25) {
        const batch = csvFiles.slice(i, i + 25);
        
        for (const csvFile of batch) {
          try {
            const filePath = path.join(yearDir, csvFile);
            const { records, rowCount } = await processCSVFile(filePath, stateName, pollutant);
            
            if (records.length === 0) {
              emptyFiles++;
              console.log(`    ⚠️  No valid data in ${csvFile} (${rowCount} rows scanned)`);
            } else {
              // Insert records in smaller batches
              const batchSize = 100;
              for (let j = 0; j < records.length; j += batchSize) {
                const recordBatch = records.slice(j, j + batchSize);
                
                const { error } = await supabase
                  .from('pollution_daily')
                  .insert(recordBatch);
                
                if (error) {
                  console.error(`    ❌ Error inserting ${csvFile} batch:`, error.message);
                  errorFiles++;
                } else {
                  totalRecords += recordBatch.length;
                }
              }
            }
            
            processedFiles++;
            
            // Progress update
            if (processedFiles % 50 === 0) {
              console.log(`    📈 Progress: ${processedFiles}/${totalFiles} files, ${totalRecords.toLocaleString()} records, ${errorFiles} errors, ${emptyFiles} empty`);
            }
            
          } catch (error) {
            console.error(`    ❌ Error processing ${csvFile}:`, error.message);
            errorFiles++;
            processedFiles++;
          }
        }
      }
    }
  }
  
  console.log(`\n🎉 Data load complete!`);
  console.log(`📊 Files processed: ${processedFiles}/${totalFiles}`);
  console.log(`📈 Total records inserted: ${totalRecords.toLocaleString()}`);
  console.log(`❌ Files with errors: ${errorFiles}`);
  console.log(`⚠️  Empty files: ${emptyFiles}`);
  
  // Show final sample
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
