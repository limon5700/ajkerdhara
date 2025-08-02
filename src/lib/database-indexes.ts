import { connectToDatabase } from './mongodb';

// Database indexes for optimal query performance
export async function createDatabaseIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    if (!db || Object.keys(db).length === 0) {
      console.log("No database connection available for creating indexes");
      return;
    }

    console.log("Creating database indexes for optimal performance...");

    // Articles collection indexes
    const articlesCollection = db.collection('articles');
    
    // Index for sorting by published date (most common query)
    await articlesCollection.createIndex(
      { publishedDate: -1 },
      { name: 'publishedDate_desc' }
    );

    // Index for author filtering
    await articlesCollection.createIndex(
      { authorId: 1 },
      { name: 'authorId_asc' }
    );

    // Index for category filtering
    await articlesCollection.createIndex(
      { category: 1 },
      { name: 'category_asc' }
    );

    // Compound index for author + published date
    await articlesCollection.createIndex(
      { authorId: 1, publishedDate: -1 },
      { name: 'authorId_publishedDate' }
    );

    // Text index for search functionality
    await articlesCollection.createIndex(
      { 
        title: 'text', 
        content: 'text', 
        excerpt: 'text' 
      },
      { 
        name: 'text_search',
        weights: {
          title: 10,
          excerpt: 5,
          content: 1
        }
      }
    );

    // Advertisements/Gadgets collection indexes
    const advertisementsCollection = db.collection('advertisements');
    
    // Index for section filtering
    await advertisementsCollection.createIndex(
      { section: 1, isActive: 1 },
      { name: 'section_active' }
    );

    // Index for placement filtering (legacy support)
    await advertisementsCollection.createIndex(
      { placement: 1, isActive: 1 },
      { name: 'placement_active' }
    );

    // Index for ordering
    await advertisementsCollection.createIndex(
      { order: 1, createdAt: -1 },
      { name: 'order_createdAt' }
    );

    // Users collection indexes
    const usersCollection = db.collection('users');
    
    // Index for username lookup
    await usersCollection.createIndex(
      { username: 1 },
      { unique: true, name: 'username_unique' }
    );

    // Index for email lookup
    await usersCollection.createIndex(
      { email: 1 },
      { sparse: true, name: 'email_sparse' }
    );

    // Index for active users
    await usersCollection.createIndex(
      { isActive: 1 },
      { name: 'isActive' }
    );

    // Roles collection indexes
    const rolesCollection = db.collection('roles');
    
    // Index for role name lookup
    await rolesCollection.createIndex(
      { name: 1 },
      { unique: true, name: 'roleName_unique' }
    );

    // Activity logs collection indexes
    const activityLogsCollection = db.collection('activity_logs');
    
    // Index for timestamp-based queries
    await activityLogsCollection.createIndex(
      { timestamp: -1 },
      { name: 'timestamp_desc' }
    );

    // Index for user activity
    await activityLogsCollection.createIndex(
      { userId: 1, timestamp: -1 },
      { name: 'userId_timestamp' }
    );

    // Index for action-based queries
    await activityLogsCollection.createIndex(
      { action: 1, timestamp: -1 },
      { name: 'action_timestamp' }
    );

    console.log("✅ Database indexes created successfully!");
    
    // Log index information
    const collections = ['articles', 'advertisements', 'users', 'roles', 'activity_logs'];
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`📊 ${collectionName} collection has ${indexes.length} indexes`);
    }

  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
  }
}

// Function to check if indexes exist
export async function checkDatabaseIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    if (!db || Object.keys(db).length === 0) {
      console.log("No database connection available for checking indexes");
      return;
    }

    const collections = ['articles', 'advertisements', 'users', 'roles', 'activity_logs'];
    const indexReport: Record<string, any[]> = {};

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      indexReport[collectionName] = indexes;
    }

    return indexReport;
  } catch (error) {
    console.error("Error checking database indexes:", error);
    return null;
  }
}

// Function to drop all indexes (use with caution)
export async function dropAllIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    if (!db || Object.keys(db).length === 0) {
      console.log("No database connection available for dropping indexes");
      return;
    }

    const collections = ['articles', 'advertisements', 'users', 'roles', 'activity_logs'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      await collection.dropIndexes();
      console.log(`Dropped all indexes from ${collectionName} collection`);
    }

    console.log("✅ All indexes dropped successfully!");
  } catch (error) {
    console.error("❌ Error dropping indexes:", error);
  }
} 