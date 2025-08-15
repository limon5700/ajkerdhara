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

async function addSeparatedPlacementTestArticles() {
  console.log('🚀 Adding test articles to demonstrate separated placements...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // Articles with ONLY article-related placement
    const relatedOnlyArticles = [
      {
        title: "RELATED ONLY: Tech Innovation in 2025",
        content: "This article should ONLY appear in the Related Articles section (full-width bottom), NOT in sidebar.",
        excerpt: "Tech innovation for related section only",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "tech innovation related",
        displayPlacements: ["article-related"], // ONLY article-related
        detailsPageCategories: ["Technology"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "RELATED ONLY: Sports Championship Update",
        content: "This article should ONLY appear in the Related Articles section, NOT in sidebar.",
        excerpt: "Sports championship for related section only",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "sports championship related",
        displayPlacements: ["article-related"], // ONLY article-related
        detailsPageCategories: ["Sports"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Articles with ONLY article-sidebar placement
    const sidebarOnlyArticles = [
      {
        title: "SIDEBAR ONLY: Quick Tech Tips",
        content: "This article should ONLY appear in the sidebar section, NOT in related articles.",
        excerpt: "Tech tips for sidebar only",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "tech tips sidebar",
        displayPlacements: ["article-sidebar"], // ONLY article-sidebar
        detailsPageCategories: ["Technology"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "SIDEBAR ONLY: Sports Quick Facts",
        content: "This article should ONLY appear in the sidebar section, NOT in related articles.",
        excerpt: "Sports facts for sidebar only",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "sports facts sidebar",
        displayPlacements: ["article-sidebar"], // ONLY article-sidebar
        detailsPageCategories: ["Sports"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Articles with BOTH placements (should appear in both places)
    const bothPlacementArticles = [
      {
        title: "BOTH PLACES: Important Tech News",
        content: "This article should appear in BOTH sidebar AND related articles sections because it has both placements.",
        excerpt: "Important tech news for both places",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "important tech both",
        displayPlacements: ["article-related", "article-sidebar"], // BOTH placements
        detailsPageCategories: ["Technology"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Insert all test articles
    const allTestArticles = [...relatedOnlyArticles, ...sidebarOnlyArticles, ...bothPlacementArticles];
    const result = await articlesCollection.insertMany(allTestArticles);
    
    console.log(`✅ Successfully added ${result.insertedCount} placement separation test articles!`);
    
    console.log('\n📋 Test Articles by Placement:');
    
    console.log('\n🔗 RELATED ONLY Articles (should appear only in Related Articles section):');
    relatedOnlyArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Placements: ${article.displayPlacements.join(', ')}`);
    });
    
    console.log('\n📧 SIDEBAR ONLY Articles (should appear only in Sidebar section):');
    sidebarOnlyArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Placements: ${article.displayPlacements.join(', ')}`);
    });
    
    console.log('\n🔄 BOTH PLACES Articles (should appear in both sections):');
    bothPlacementArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Placements: ${article.displayPlacements.join(', ')}`);
    });
    
    console.log('\n🎉 Placement separation test data setup completed!');
    console.log('\n📋 Testing Instructions:');
    console.log('1. Go to any Technology or Sports article details page');
    console.log('2. Check the RIGHT SIDEBAR: Should show only "SIDEBAR ONLY" and "BOTH PLACES" articles');
    console.log('3. Check the BOTTOM RELATED SECTION: Should show only "RELATED ONLY" and "BOTH PLACES" articles');
    console.log('4. Verify that placement targeting is now working correctly');
    
    console.log('\n🔬 Expected Test Results:');
    console.log('✅ Sidebar Section: "SIDEBAR ONLY" + "BOTH PLACES" articles');
    console.log('✅ Related Section: "RELATED ONLY" + "BOTH PLACES" articles');
    console.log('❌ NO mixing: "SIDEBAR ONLY" should NOT appear in Related section');
    console.log('❌ NO mixing: "RELATED ONLY" should NOT appear in Sidebar section');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding placement separation test articles:', error);
    process.exit(1);
  }
}

addSeparatedPlacementTestArticles();
