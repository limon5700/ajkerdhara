// Load environment variables
require('dotenv').config();

// Since we can't directly import TypeScript from Node.js, we'll use the compiled version
const { MongoClient, ObjectId } = require('mongodb');

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'samay_barta';
  
  if (!uri || !dbName) {
    throw new Error('MongoDB connection details not provided');
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  
  return { db, client };
}

async function addPostSpecificTestArticles() {
  console.log('🚀 Adding post-specific targeting test articles...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // First, get some existing article IDs to target
    const existingArticles = await articlesCollection.find({}, { 
      projection: { _id: 1, title: 1 } 
    }).limit(5).toArray();
    
    if (existingArticles.length === 0) {
      console.log('❌ No existing articles found. Please add some articles first.');
      await client.close();
      return;
    }
    
    console.log('📋 Found existing articles to target:');
    existingArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} (ID: ${article._id})`);
    });
    
    // Create articles that target specific posts
    const postSpecificArticles = [
      {
        title: "Targeted Article 1 - Specifically for First Post",
        content: `This article will ONLY appear when viewing the details of "${existingArticles[0].title}". It's specifically targeted to that post.`,
        excerpt: "Article targeted to specific post 1",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "targeted post specific",
        displayPlacements: ["article-related"],
        detailsPageCategories: [], // No category restriction
        detailsPageSpecificPosts: [existingArticles[0]._id.toString()], // Target specific post
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Targeted Article 2 - For Two Specific Posts",
        content: `This article will appear when viewing details of "${existingArticles[0].title}" OR "${existingArticles[1].title}". Multi-post targeting.`,
        excerpt: "Article targeted to two specific posts",
        category: "Business",
        publishedDate: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "multi post targeting",
        displayPlacements: ["article-sidebar"],
        detailsPageCategories: [], // No category restriction
        detailsPageSpecificPosts: [
          existingArticles[0]._id.toString(),
          existingArticles[1]._id.toString()
        ], // Target two specific posts
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Hybrid Targeting Article - Category + Specific Post",
        content: `This article uses both category and post-specific targeting. It will show in Technology category articles AND specifically in "${existingArticles[2].title}".`,
        excerpt: "Hybrid category and post targeting",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "hybrid targeting",
        displayPlacements: ["article-related"],
        detailsPageCategories: ["Technology"], // Category targeting
        detailsPageSpecificPosts: [existingArticles[2]._id.toString()], // AND post-specific targeting
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Insert articles
    const result = await articlesCollection.insertMany(postSpecificArticles);
    
    console.log(`\n✅ Successfully added ${result.insertedCount} post-specific targeting test articles!`);
    console.log('\n🎯 Post-Specific Targeting Articles:');
    postSpecificArticles.forEach((article, index) => {
      console.log(`\n  ${index + 1}. ${article.title}`);
      console.log(`     Placement: ${article.displayPlacements.join(', ')}`);
      console.log(`     Category Filter: ${article.detailsPageCategories.length > 0 ? article.detailsPageCategories.join(', ') : 'None (Universal)'}`);
      console.log(`     Specific Posts: ${article.detailsPageSpecificPosts.length > 0 ? article.detailsPageSpecificPosts.length + ' posts targeted' : 'None'}`);
      if (article.detailsPageSpecificPosts.length > 0) {
        article.detailsPageSpecificPosts.forEach(postId => {
          const targetPost = existingArticles.find(a => a._id.toString() === postId);
          console.log(`       → ${targetPost ? targetPost.title : 'Unknown post'}`);
        });
      }
    });
    
    console.log('\n🎉 Post-specific targeting test data setup completed!');
    console.log('\n📋 Testing Instructions:');
    console.log('1. Go to admin dashboard → Articles → Add/Edit');
    console.log('2. Select "Article Related Posts" or "Article Sidebar" placement');
    console.log('3. You\'ll see TWO sections:');
    console.log('   - "Category-Based Display" - shows in specific categories');
    console.log('   - "Specific Post Targeting" - shows in specific individual posts');
    console.log('4. Select specific posts from the scrollable list');
    console.log('5. View those specific post details to see targeted content');
    console.log('\n🔬 Test Results:');
    console.log(`   - Article 1 will ONLY show in: "${existingArticles[0].title}"`);
    console.log(`   - Article 2 will show in: "${existingArticles[0].title}" AND "${existingArticles[1].title}"`);
    console.log(`   - Article 3 will show in: ALL Technology posts AND "${existingArticles[2].title}"`);
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding post-specific test articles:', error);
    process.exit(1);
  }
}

addPostSpecificTestArticles();
