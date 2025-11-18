import { syncDatabase } from './models';

const runSync = async () => {
  const force = process.argv.includes('--force');
  
  console.log('🔄 Starting database synchronization...');
  console.log(`📌 Mode: ${force ? 'FORCE (drops all tables)' : 'SAFE (creates if not exists)'}`);
  
  try {
    await syncDatabase(force);
    console.log('✅ Database sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
};

runSync();
