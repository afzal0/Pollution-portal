const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
const ProgressTracker = require('./progress-tracker');
const config = require('./config');

// Supabase configuration
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

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

// Configuration
const BATCH_SIZE = 100; // Records per batch
const FILE_BATCH_SIZE = 10; // Files to process in parallel
const PROGRESS_UPDATE_INTERVAL = 50; // Update progress every N files

class RobustDataLoader {
  constructor() {
    this.tracker = new ProgressTracker();
    this.dataDir = path.join(__dirname, '..', '..', 'Data');
  }

  async processCSVFile(filePath, stateName, pollutant) {
  return new Promise((resolve, reject) => {
    const results = [];
      let rowCount = 0;
      let validRows = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
          rowCount++;
        
          // Only process rows that have meaningful data
          if (row.SA2_CODE21 && row.date && row.value && 
              !isNaN(parseFloat(row.value)) && parseFloat(row.value) >= 0) {
        const record = {
              pollutant: pollutant,
              date: row.date,
              ste_name: stateName,
              sa2_code: row.SA2_CODE21,
          sa2_name: row.SA2_NAME21 || null,
              centroid_lat: parseFloat(row.centroid_lat) || null,
              centroid_lon: parseFloat(row.centroid_lon) || null,
              value: parseFloat(row.value)
            };
          results.push(record);
            validRows++;
        }
      })
      .on('end', () => {
          resolve({ 
            records: results, 
            rowCount, 
            validRows,
            isEmpty: validRows === 0
          });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

  async insertRecords(records) {
    if (records.length === 0) return { success: true, inserted: 0 };
    
    try {
      const { error } = await supabase
        .from('pollution_daily')
        .insert(records);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, inserted: records.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async processFileBatch(files, stateName, pollutant) {
    const results = {
      totalRecords: 0,
      processedFiles: 0,
      errorFiles: 0,
      emptyFiles: 0
    };

    for (const file of files) {
      const filePath = path.join(this.dataDir, file.relativePath);
      
      // Check if file was already processed
      if (this.tracker.isFileProcessed(filePath)) {
        console.log(`    ⏭️  Skipping already processed: ${file.name}`);
        results.processedFiles++;
        continue;
      }

      try {
        const { records, rowCount, validRows, isEmpty } = await this.processCSVFile(
          filePath, 
          stateName, 
          pollutant
        );

        if (isEmpty) {
          console.log(`    ⚠️  No valid data in ${file.name} (${rowCount} rows scanned)`);
          this.tracker.markFileProcessed(filePath, 0, false, true);
          results.emptyFiles++;
        } else {
          // Insert records in batches
          let insertedRecords = 0;
          let insertSuccess = true;
          
          for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            const insertResult = await this.insertRecords(batch);
            
            if (insertResult.success) {
              insertedRecords += insertResult.inserted;
            } else {
              console.error(`    ❌ Error inserting batch from ${file.name}:`, insertResult.error);
              this.tracker.markFileProcessed(filePath, insertedRecords, true, false);
              results.errorFiles++;
              insertSuccess = false;
              break;
            }
          }
          
          if (insertSuccess) {
            this.tracker.markFileProcessed(filePath, insertedRecords, false, false);
            results.totalRecords += insertedRecords;
            console.log(`    ✅ ${file.name}: ${insertedRecords} records (${validRows}/${rowCount} valid rows)`);
          }
        }
        
        results.processedFiles++;
        
      } catch (error) {
        console.error(`    ❌ Error processing ${file.name}:`, error.message);
        this.tracker.markFileProcessed(filePath, 0, true, false);
        results.errorFiles++;
        results.processedFiles++;
      }
    }

    return results;
  }

  async getAllFiles() {
    const allFiles = [];
    
    for (const [folderName, stateName] of Object.entries(stateMap)) {
      const stateDir = path.join(this.dataDir, folderName);
    
    if (!fs.existsSync(stateDir)) {
      console.log(`⚠️  Skipping ${stateName} - folder not found`);
      continue;
    }
    
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
          .filter(file => file.endsWith('.csv'))
          .map(file => ({
            name: file,
            relativePath: path.join(folderName, yearFolder, file),
            stateName,
            pollutant,
            yearFolder
          }));
        
        allFiles.push(...csvFiles);
      }
    }
    
    return allFiles;
  }

  async loadData(resume = true) {
    console.log('🚀 Starting robust data load...');
    console.log(`📊 Resume mode: ${resume ? 'enabled' : 'disabled'}\n`);
    
    if (!resume) {
      this.tracker.reset();
    }
    
    this.tracker.setStatus('scanning');
    
    // Get all files
    console.log('📋 Scanning for files...');
    const allFiles = await this.getAllFiles();
    console.log(`📁 Found ${allFiles.length} files to process\n`);
    
    this.tracker.setTotalFiles(allFiles.length);
    this.tracker.setStatus('processing');
    
    // Group files by state and pollutant for organized processing
    const filesByState = {};
    for (const file of allFiles) {
      if (!filesByState[file.stateName]) {
        filesByState[file.stateName] = {};
      }
      if (!filesByState[file.stateName][file.pollutant]) {
        filesByState[file.stateName][file.pollutant] = [];
      }
      filesByState[file.stateName][file.pollutant].push(file);
    }
    
    let totalProcessed = 0;
    let totalRecords = 0;
    let totalErrors = 0;
    let totalEmpty = 0;
    
    // Process each state
    for (const [stateName, pollutants] of Object.entries(filesByState)) {
      // Check if state was already completed
      if (resume && this.tracker.isStateCompleted(stateName)) {
        console.log(`⏭️  Skipping completed state: ${stateName}`);
        continue;
      }
      
      this.tracker.setCurrentState(stateName);
      console.log(`\n🗺️  Processing ${stateName}...`);
      
      // Process each pollutant in this state
      for (const [pollutant, files] of Object.entries(pollutants)) {
        // Check if pollutant was already completed
        if (resume && this.tracker.isPollutantCompleted(stateName, pollutant)) {
          console.log(`  ⏭️  Skipping completed pollutant: ${pollutant}`);
          continue;
        }
        
        this.tracker.setCurrentPollutant(pollutant);
        console.log(`  📊 Processing ${pollutant} (${files.length} files)...`);
        
        // Process files in batches
        for (let i = 0; i < files.length; i += FILE_BATCH_SIZE) {
          const batch = files.slice(i, i + FILE_BATCH_SIZE);
          const batchResults = await this.processFileBatch(batch, stateName, pollutant);
          
          totalProcessed += batchResults.processedFiles;
          totalRecords += batchResults.totalRecords;
          totalErrors += batchResults.errorFiles;
          totalEmpty += batchResults.emptyFiles;
          
          // Update progress
          if (totalProcessed % PROGRESS_UPDATE_INTERVAL === 0) {
            this.tracker.printProgress();
          }
        }
        
        // Mark pollutant as completed
        this.tracker.markPollutantCompleted(stateName, pollutant);
        console.log(`  ✅ Completed ${pollutant}: ${files.length} files processed`);
      }
      
      // Mark state as completed
      this.tracker.markStateCompleted(stateName);
      console.log(`✅ Completed ${stateName}`);
    }
    
    this.tracker.setStatus('completed');
  
  console.log(`\n🎉 Data load complete!`);
    console.log(`📊 Files processed: ${totalProcessed}/${allFiles.length}`);
  console.log(`📈 Total records inserted: ${totalRecords.toLocaleString()}`);
    console.log(`❌ Files with errors: ${totalErrors}`);
    console.log(`⚠️  Empty files: ${totalEmpty}`);
  
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
    
    return {
      totalFiles: allFiles.length,
      processedFiles: totalProcessed,
      totalRecords,
      errorFiles: totalErrors,
      emptyFiles: totalEmpty
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const resume = !args.includes('--fresh');
  const clearFirst = args.includes('--clear');
  
  const loader = new RobustDataLoader();
  
  if (clearFirst) {
    console.log('🗑️  Clearing database first...');
    const { clearDatabase } = require('./clear-database');
    const cleared = await clearDatabase();
    if (!cleared) {
      console.error('❌ Failed to clear database, aborting');
      process.exit(1);
    }
    console.log('✅ Database cleared\n');
  }
  
  try {
    const results = await loader.loadData(resume);
    console.log('\n✅ Data loading completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Data loading failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { RobustDataLoader };