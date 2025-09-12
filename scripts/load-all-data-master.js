#!/usr/bin/env node

const { clearDatabase } = require('./clear-database-aggressive');
const { RobustDataLoader } = require('./load-data-robust');
const ProgressTracker = require('./progress-tracker');

class MasterDataLoader {
  constructor() {
    this.tracker = new ProgressTracker();
  }

  async showMenu() {
    console.log('\n🚀 Pollution Data Loader - Master Control');
    console.log('==========================================');
    console.log('1. Clear database and start fresh');
    console.log('2. Resume existing data load');
    console.log('3. Start fresh data load (keep existing data)');
    console.log('4. Show current progress');
    console.log('5. Reset progress tracker');
    console.log('6. Exit');
    console.log('');
  }

  async getUserChoice() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your choice (1-6): ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  async clearAndLoad() {
    console.log('\n🗑️  Clearing database...');
    const cleared = await clearDatabase();
    
    if (!cleared) {
      console.error('❌ Failed to clear database');
      return false;
    }
    
    console.log('✅ Database cleared successfully');
    console.log('\n🚀 Starting fresh data load...');
    
    const loader = new RobustDataLoader();
    const results = await loader.loadData(false);
    
    console.log('\n🎉 Fresh data load completed!');
    return results;
  }

  async resumeLoad() {
    console.log('\n📊 Resuming data load...');
    
    const loader = new RobustDataLoader();
    const results = await loader.loadData(true);
    
    console.log('\n🎉 Data load resumed and completed!');
    return results;
  }

  async freshLoad() {
    console.log('\n🚀 Starting fresh data load (keeping existing data)...');
    
    const loader = new RobustDataLoader();
    const results = await loader.loadData(false);
    
    console.log('\n🎉 Fresh data load completed!');
    return results;
  }

  async showProgress() {
    console.log('\n📊 Current Progress:');
    console.log('===================');
    
    const progress = this.tracker.getProgress();
    this.tracker.printProgress();
    
    if (progress.processedFilesList.length > 0) {
      console.log('\n📁 Recently processed files:');
      const recent = progress.processedFilesList.slice(-10);
      recent.forEach(file => {
        const status = file.hasError ? '❌' : file.isEmpty ? '⚠️' : '✅';
        console.log(`   ${status} ${file.file} (${file.recordCount} records)`);
      });
    }
  }

  async resetProgress() {
    console.log('\n🔄 Resetting progress tracker...');
    this.tracker.reset();
    console.log('✅ Progress tracker reset');
  }

  async run() {
    console.log('Welcome to the Pollution Data Loader!');
    
    while (true) {
      await this.showMenu();
      const choice = await this.getUserChoice();
      
      switch (choice) {
        case '1':
          await this.clearAndLoad();
          break;
          
        case '2':
          await this.resumeLoad();
          break;
          
        case '3':
          await this.freshLoad();
          break;
          
        case '4':
          await this.showProgress();
          break;
          
        case '5':
          await this.resetProgress();
          break;
          
        case '6':
          console.log('\n👋 Goodbye!');
          process.exit(0);
          break;
          
        default:
          console.log('\n❌ Invalid choice. Please enter 1-6.');
      }
      
      console.log('\nPress Enter to continue...');
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });
    }
  }
}

// Command line interface
async function cli() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    const master = new MasterDataLoader();
    await master.run();
  } else {
    // Command line mode
    const command = args[0];
    const master = new MasterDataLoader();
    
    switch (command) {
      case 'clear-and-load':
        await master.clearAndLoad();
        break;
        
      case 'resume':
        await master.resumeLoad();
        break;
        
      case 'fresh':
        await master.freshLoad();
        break;
        
      case 'progress':
        await master.showProgress();
        break;
        
      case 'reset':
        await master.resetProgress();
        break;
        
      default:
        console.log('Usage: node load-all-data-master.js [command]');
        console.log('Commands:');
        console.log('  clear-and-load  - Clear database and start fresh');
        console.log('  resume          - Resume existing data load');
        console.log('  fresh           - Start fresh data load (keep existing)');
        console.log('  progress        - Show current progress');
        console.log('  reset           - Reset progress tracker');
        console.log('');
        console.log('Run without arguments for interactive mode');
        process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  cli().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { MasterDataLoader };
