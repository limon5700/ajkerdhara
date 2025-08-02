const { createDatabaseIndexes, checkDatabaseIndexes } = require('../src/lib/database-indexes.ts');

async function setupDatabase() {
  console.log('🚀 Setting up database indexes for optimal performance...');
  
  try {
    // Create indexes
    await createDatabaseIndexes();
    
    // Check indexes
    const indexReport = await checkDatabaseIndexes();
    
    if (indexReport) {
      console.log('\n📊 Database Index Report:');
      Object.entries(indexReport).forEach(([collection, indexes]) => {
        console.log(`  ${collection}: ${indexes.length} indexes`);
      });
    }
    
    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 