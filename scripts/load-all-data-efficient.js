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

// Track unique SA2 codes and their geometry
const sa2GeometryMap = new Map();
const pollutionData = [];

async function loadCSVFile(filePath, stateName, pollutant) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store SA2 geometry info (only once per SA2 code)
        const sa2Code = row.SA2_CODE21;
        if (!sa2GeometryMap.has(sa2Code)) {
          sa2GeometryMap.set(sa2Code, {
            sa2_code: sa2Code,
            sa2_name: row.SA2_NAME21,
            state_name: stateName,
            centroid_lat: parseFloat(row.centroid_lat),
            centroid_lon: parseFloat(row.centroid_lon)
          });
        }
        
        // Store pollution data (without geometry)
        const record = {
          pollutant: pollutant,
          date: row.date,
          ste_name: stateName,
          sa2_code: sa2Code,
          sa2_name: row.SA2_NAME21,
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
  console.log('📊 This will process all CSV files and create efficient geometry storage\n');
  
  // First pass: collect all SA2 geometry data
  console.log('📍 Phase 1: Collecting SA2 geometry data...');
  
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      console.log(`⚠️  Skipping ${stateName} - folder not found`);
      continue;
    }
    
    console.log(`\n🗺️  Processing ${stateName}...`);
    
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
      
      totalFiles += csvFiles.length;
      
      // Process first file to get SA2 geometry (they're all the same for each SA2)
      if (csvFiles.length > 0) {
        try {
          const firstFile = csvFiles[0];
          const filePath = path.join(yearDir, firstFile);
          await loadCSVFile(filePath, stateName, pollutant);
          console.log(`  ✓ Collected geometry from ${firstFile}`);
        } catch (error) {
          console.error(`  ❌ Error processing ${csvFiles[0]}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\n✅ Phase 1 Complete: Found ${sa2GeometryMap.size} unique SA2 codes`);
  
  // Insert SA2 geometry data
  console.log('\n📍 Phase 2: Inserting SA2 geometry data...');
  
  const sa2GeometryArray = Array.from(sa2GeometryMap.values());
  const batchSize = 100;
  
  for (let i = 0; i < sa2GeometryArray.length; i += batchSize) {
    const batch = sa2GeometryArray.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('sa2_geometry')
        .upsert(batch, { onConflict: 'sa2_code' });
      
      if (error) {
        console.error(`❌ Error inserting SA2 geometry batch ${i}-${i + batchSize}:`, error);
      } else {
        console.log(`  ✓ Inserted SA2 geometry batch ${i + 1}-${Math.min(i + batchSize, sa2GeometryArray.length)}`);
      }
    } catch (error) {
      console.error(`❌ Error inserting SA2 geometry batch:`, error);
    }
  }
  
  // Second pass: collect all pollution data
  console.log('\n📊 Phase 3: Collecting pollution data...');
  
  for (const [folderName, stateName] of Object.entries(stateMap)) {
    const stateDir = path.join(dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      continue;
    }
    
    console.log(`\n🌍 Processing ${stateName} pollution data...`);
    
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
      
      console.log(`  📁 Processing ${yearFolder} (${csvFiles.length} files)...`);
      
      // Process files in batches
      for (let i = 0; i < csvFiles.length; i += 10) {
        const batch = csvFiles.slice(i, i + 10);
        
        for (const csvFile of batch) {
          try {
            const filePath = path.join(yearDir, csvFile);
            const records = await loadCSVFile(filePath, stateName, pollutant);
            
            if (records.length > 0) {
              pollutionData.push(...records);
              totalRecords += records.length;
              processedFiles++;
              
              if (processedFiles % 100 === 0) {
                console.log(`    📈 Processed ${processedFiles}/${totalFiles} files, ${totalRecords} records...`);
              }
            }
          } catch (error) {
            console.error(`    ❌ Error processing ${csvFile}:`, error.message);
          }
        }
      }
    }
  }
  
  console.log(`\n✅ Phase 3 Complete: Collected ${totalRecords} pollution records`);
  
  // Insert pollution data in batches
  console.log('\n📊 Phase 4: Inserting pollution data...');
  
  const pollutionBatchSize = 1000;
  let insertedRecords = 0;
  
  for (let i = 0; i < pollutionData.length; i += pollutionBatchSize) {
    const batch = pollutionData.slice(i, i + pollutionBatchSize);
    
    try {
      const { error } = await supabase
        .from('pollution_daily')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting pollution batch ${i}-${i + pollutionBatchSize}:`, error);
      } else {
        insertedRecords += batch.length;
        console.log(`  ✓ Inserted pollution batch ${i + 1}-${Math.min(i + pollutionBatchSize, pollutionData.length)} (${insertedRecords}/${totalRecords})`);
      }
    } catch (error) {
      console.error(`❌ Error inserting pollution batch:`, error);
    }
  }
  
  console.log(`\n🎉 Data load complete!`);
  console.log(`📊 Total files processed: ${processedFiles}`);
  console.log(`📍 Unique SA2 codes: ${sa2GeometryMap.size}`);
  console.log(`📈 Total pollution records: ${insertedRecords}`);
  
  // Show sample of loaded data
  console.log('\n📋 Sample of loaded data:');
  const { data: sampleData, error: sampleError } = await supabase
    .from('pollution_daily')
    .select('*')
    .limit(3);
    
  if (sampleError) {
    console.error('❌ Error fetching sample data:', sampleError);
  } else {
    console.log(sampleData);
  }
}

// Run the data load
if (require.main === module) {
  loadAllData().catch(console.error);
}

module.exports = { loadAllData };
