const fs = require('fs');
const path = require('path');

class ProgressTracker {
  constructor(progressFile = 'data-load-progress.json') {
    this.progressFile = path.join(__dirname, progressFile);
    this.progress = this.loadProgress();
  }

  loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const data = fs.readFileSync(this.progressFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️  Could not load progress file, starting fresh:', error.message);
    }
    
    return {
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      totalFiles: 0,
      processedFiles: 0,
      totalRecords: 0,
      errorFiles: 0,
      emptyFiles: 0,
      completedStates: [],
      completedPollutants: {},
      processedFilesList: [],
      currentState: null,
      currentPollutant: null,
      status: 'initialized'
    };
  }

  saveProgress() {
    try {
      this.progress.lastUpdate = new Date().toISOString();
      fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
    } catch (error) {
      console.error('❌ Error saving progress:', error.message);
    }
  }

  setTotalFiles(count) {
    this.progress.totalFiles = count;
    this.saveProgress();
  }

  markFileProcessed(filePath, recordCount = 0, hasError = false, isEmpty = false) {
    this.progress.processedFiles++;
    this.progress.totalRecords += recordCount;
    
    if (hasError) {
      this.progress.errorFiles++;
    }
    
    if (isEmpty) {
      this.progress.emptyFiles++;
    }

    this.progress.processedFilesList.push({
      file: filePath,
      timestamp: new Date().toISOString(),
      recordCount,
      hasError,
      isEmpty
    });

    this.saveProgress();
  }

  markStateCompleted(stateName) {
    if (!this.progress.completedStates.includes(stateName)) {
      this.progress.completedStates.push(stateName);
      this.saveProgress();
    }
  }

  markPollutantCompleted(stateName, pollutant) {
    const key = `${stateName}-${pollutant}`;
    this.progress.completedPollutants[key] = {
      completed: true,
      timestamp: new Date().toISOString()
    };
    this.saveProgress();
  }

  setCurrentState(stateName) {
    this.progress.currentState = stateName;
    this.saveProgress();
  }

  setCurrentPollutant(pollutant) {
    this.progress.currentPollutant = pollutant;
    this.saveProgress();
  }

  setStatus(status) {
    this.progress.status = status;
    this.saveProgress();
  }

  isFileProcessed(filePath) {
    return this.progress.processedFilesList.some(file => file.file === filePath);
  }

  isStateCompleted(stateName) {
    return this.progress.completedStates.includes(stateName);
  }

  isPollutantCompleted(stateName, pollutant) {
    const key = `${stateName}-${pollutant}`;
    return this.progress.completedPollutants[key]?.completed || false;
  }

  getProgress() {
    return {
      ...this.progress,
      progressPercentage: this.progress.totalFiles > 0 
        ? Math.round((this.progress.processedFiles / this.progress.totalFiles) * 100) 
        : 0,
      estimatedTimeRemaining: this.calculateEstimatedTimeRemaining()
    };
  }

  calculateEstimatedTimeRemaining() {
    if (this.progress.processedFiles === 0) return null;
    
    const now = new Date();
    const startTime = new Date(this.progress.startTime);
    const elapsedMs = now - startTime;
    const filesPerMs = this.progress.processedFiles / elapsedMs;
    const remainingFiles = this.progress.totalFiles - this.progress.processedFiles;
    
    if (filesPerMs === 0) return null;
    
    const remainingMs = remainingFiles / filesPerMs;
    return Math.round(remainingMs / 1000 / 60); // minutes
  }

  printProgress() {
    const progress = this.getProgress();
    const elapsed = new Date() - new Date(this.progress.startTime);
    const elapsedMinutes = Math.round(elapsed / 1000 / 60);
    
    console.log('\n📊 Progress Summary:');
    console.log(`   Status: ${progress.status}`);
    console.log(`   Files: ${progress.processedFiles}/${progress.totalFiles} (${progress.progressPercentage}%)`);
    console.log(`   Records: ${progress.totalRecords.toLocaleString()}`);
    console.log(`   Errors: ${progress.errorFiles}`);
    console.log(`   Empty: ${progress.emptyFiles}`);
    console.log(`   Elapsed: ${elapsedMinutes} minutes`);
    
    if (progress.estimatedTimeRemaining) {
      console.log(`   ETA: ${progress.estimatedTimeRemaining} minutes`);
    }
    
    if (progress.completedStates.length > 0) {
      console.log(`   Completed States: ${progress.completedStates.join(', ')}`);
    }
    
    if (progress.currentState) {
      console.log(`   Current: ${progress.currentState}${progress.currentPollutant ? ` - ${progress.currentPollutant}` : ''}`);
    }
  }

  reset() {
    this.progress = {
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      totalFiles: 0,
      processedFiles: 0,
      totalRecords: 0,
      errorFiles: 0,
      emptyFiles: 0,
      completedStates: [],
      completedPollutants: {},
      processedFilesList: [],
      currentState: null,
      currentPollutant: null,
      status: 'initialized'
    };
    this.saveProgress();
    console.log('🔄 Progress tracker reset');
  }

  cleanup() {
    try {
      if (fs.existsSync(this.progressFile)) {
        fs.unlinkSync(this.progressFile);
        console.log('🗑️  Progress file cleaned up');
      }
    } catch (error) {
      console.warn('⚠️  Could not clean up progress file:', error.message);
    }
  }
}

module.exports = ProgressTracker;
