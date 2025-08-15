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

async function addCategorySpecificTestArticles() {
  console.log('🚀 Adding category-specific test articles to demonstrate the new functionality...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // Category-specific details page articles
    const categorySpecificArticles = [
      {
        title: "Technology Related Article - AI Trends",
        content: "This article should appear only when viewing Technology category articles. It covers the latest AI trends and innovations.",
        excerpt: "AI trends for Technology articles",
        category: "Technology", 
        publishedDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "technology AI trends",
        displayPlacements: ["article-related"],
        detailsPageCategories: ["Technology"], // Only show in Technology article details
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Sports Related Article - Football Updates",
        content: "This article should appear only when viewing Sports category articles. Latest football league updates and scores.",
        excerpt: "Football updates for Sports articles",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "sports football updates",
        displayPlacements: ["article-related"],
        detailsPageCategories: ["Sports"], // Only show in Sports article details
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Business Sidebar - Market Analysis",
        content: "This article should appear in the sidebar only when viewing Business category articles. Market trends and analysis.",
        excerpt: "Market analysis for Business articles",
        category: "Business",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "business market analysis",
        displayPlacements: ["article-sidebar"],
        detailsPageCategories: ["Business"], // Only show in Business article details
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Multi-Category Related Article - Health & Sports",
        content: "This article should appear when viewing either Health or Sports category articles. Covers sports medicine and athlete wellness.",
        excerpt: "Health and sports medicine content",
        category: "Health",
        publishedDate: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "health sports medicine",
        displayPlacements: ["article-related"],
        detailsPageCategories: ["Health", "Sports"], // Show in both Health and Sports article details
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Universal Related Article - General News",
        content: "This article should appear in all article details pages since it has no category restrictions. General news and updates.",
        excerpt: "General news for all categories",
        category: "World",
        publishedDate: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "general world news",
        displayPlacements: ["article-related"],
        detailsPageCategories: [], // Empty array means show in all categories
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Insert articles
    const result = await articlesCollection.insertMany(categorySpecificArticles);
    
    console.log(`✅ Successfully added ${result.insertedCount} category-specific test articles!`);
    console.log('\nCategory-Specific Articles:');
    categorySpecificArticles.forEach((article, index) => {
      const categories = article.detailsPageCategories.length > 0 
        ? article.detailsPageCategories.join(', ') 
        : 'All categories';
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     Placement: ${article.displayPlacements.join(', ')}`);
      console.log(`     Show in: ${categories}`);
      console.log('');
    });
    
    console.log('🎉 Category-specific test data setup completed!');
    console.log('\n📋 Testing Instructions:');
    console.log('1. Go to admin dashboard and add/edit articles');
    console.log('2. Select "Article Related Posts" or "Article Sidebar" in Display Locations');
    console.log('3. When you select these, a "Category-Based Display" section will appear');
    console.log('4. Choose which categories should show this article in their details pages');
    console.log('5. View different category articles to see category-specific related posts');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding category-specific test articles:', error);
    process.exit(1);
  }
}

addCategorySpecificTestArticles();
