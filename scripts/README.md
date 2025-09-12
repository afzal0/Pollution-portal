# Data Loading Scripts

This directory contains robust data loading scripts for the pollution portal that can handle large datasets with progress tracking and resume capabilities.

## Scripts Overview

### 1. `clear-database.js`
Clears all existing data from the database tables.

**Usage:**
```bash
node scripts/clear-database.js
# or
npm run data:clear
```

### 2. `progress-tracker.js`
A utility class that tracks the progress of data loading, including:
- Files processed
- Records inserted
- Errors encountered
- Resume points
- Time estimates

### 3. `load-data-robust.js`
The main data loading script with resume capability.

**Usage:**
```bash
# Resume from where it left off
node scripts/load-data-robust.js

# Start fresh (ignore progress)
node scripts/load-data-robust.js --fresh

# Clear database first, then load
node scripts/load-data-robust.js --clear

# Using npm scripts
npm run data:load          # Resume
npm run data:load-fresh    # Fresh start
npm run data:load-clear    # Clear + load
```

### 4. `load-all-data-master.js`
Interactive master control script with menu options.

**Usage:**
```bash
# Interactive mode
node scripts/load-all-data-master.js
# or
npm run data:master

# Command line mode
node scripts/load-all-data-master.js clear-and-load
node scripts/load-all-data-master.js resume
node scripts/load-all-data-master.js fresh
node scripts/load-all-data-master.js progress
node scripts/load-all-data-master.js reset

# Check progress
npm run data:progress
```

## Features

### Progress Tracking
- Tracks which files have been processed
- Stores progress in `data-load-progress.json`
- Can resume from any interruption point
- Shows estimated time remaining

### Error Handling
- Continues processing even if individual files fail
- Logs all errors for review
- Tracks error counts and empty files

### Batch Processing
- Processes files in configurable batches
- Inserts records in smaller batches to avoid memory issues
- Configurable batch sizes for optimal performance

### Data Validation
- Validates CSV data before insertion
- Skips invalid or empty records
- Ensures data integrity

## Configuration

You can modify these settings in `load-data-robust.js`:

```javascript
const BATCH_SIZE = 100; // Records per batch
const FILE_BATCH_SIZE = 10; // Files to process in parallel
const PROGRESS_UPDATE_INTERVAL = 50; // Update progress every N files
```

## Data Structure Expected

The scripts expect CSV files in the following structure:
```
Data/
├── ACT-pollution-data/
│   ├── SO2_OFFL/
│   │   ├── file1.csv
│   │   └── file2.csv
│   └── NO2_OFFL/
│       └── file3.csv
├── Nsw-pollution-data/
│   └── ...
└── ...
```

Each CSV file should have these columns:
- `SA2_CODE21` - SA2 area code
- `SA2_NAME21` - SA2 area name
- `date` - Date in YYYY-MM-DD format
- `value` - Pollution value
- `centroid_lat` - Latitude
- `centroid_lon` - Longitude

## Progress File

The progress is stored in `data-load-progress.json` with this structure:
```json
{
  "startTime": "2024-01-01T00:00:00.000Z",
  "lastUpdate": "2024-01-01T01:00:00.000Z",
  "totalFiles": 1000,
  "processedFiles": 500,
  "totalRecords": 1000000,
  "errorFiles": 5,
  "emptyFiles": 10,
  "completedStates": ["Victoria", "NSW"],
  "completedPollutants": {
    "Victoria-SO2": { "completed": true, "timestamp": "..." }
  },
  "processedFilesList": [...],
  "currentState": "Queensland",
  "currentPollutant": "NO2",
  "status": "processing"
}
```

## Troubleshooting

### If the process gets stuck:
1. Check the progress: `npm run data:progress`
2. Reset if needed: `node scripts/load-all-data-master.js reset`
3. Resume: `npm run data:load`

### If you want to start completely fresh:
1. Clear database: `npm run data:clear`
2. Reset progress: `node scripts/load-all-data-master.js reset`
3. Start loading: `npm run data:load`

### Memory issues:
- Reduce `BATCH_SIZE` in the configuration
- Reduce `FILE_BATCH_SIZE` in the configuration
- Process fewer files at once

## Monitoring

The scripts provide detailed logging:
- ✅ Success indicators
- ❌ Error indicators  
- ⚠️ Warning indicators
- ⏭️ Skip indicators
- 📊 Progress updates
- 📈 Statistics

Check the console output for real-time progress and any issues.
