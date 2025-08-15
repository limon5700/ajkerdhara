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

async function addTestArticles() {
  console.log('🚀 Adding test articles for different display placements...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // Home page articles
    const homePageArticles = [
      {
        title: "Home Page Hero Article - Breaking News Today",
        content: "This is a sample article for the home page hero section. It contains important news that should be featured prominently on the homepage.",
        excerpt: "Breaking news article for homepage hero",
        category: "Politics",
        publishedDate: new Date(),
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "home page hero news",
        displayPlacements: ["homepage-hero"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Latest Post 1 - Technology Update",
        content: "This is a latest post for the homepage latest posts section. Technology updates and innovations.",
        excerpt: "Technology updates for latest posts",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "homepage latest technology",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Latest Post 2 - Sports News",
        content: "This is another latest post for the homepage latest posts section. Sports news and updates.",
        excerpt: "Sports news for latest posts",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "homepage latest sports",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "More Headlines 1 - Business Update",
        content: "This is a business article for the homepage more headlines section.",
        excerpt: "Business news for more headlines",
        category: "Business",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "homepage headlines business",
        displayPlacements: ["homepage-more-headlines"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Must Read Article - Health News",
        content: "This is a health article for the sidebar must read section.",
        excerpt: "Health news for must read",
        category: "Health",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "sidebar must read health",
        displayPlacements: ["sidebar-must-read"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Details page articles
    const detailsPageArticles = [
      {
        title: "Related Article 1 - Environmental News",
        content: "This is an environmental article specifically for article details pages related section.",
        excerpt: "Environmental news for article details",
        category: "Environment",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "article related environment",
        displayPlacements: ["article-related"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Related Article 2 - Education Update",
        content: "This is an education article specifically for article details pages related section.",
        excerpt: "Education news for article details",
        category: "Education",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "article related education",
        displayPlacements: ["article-related"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Article Sidebar 1 - Entertainment News",
        content: "This is an entertainment article specifically for article details page sidebar.",
        excerpt: "Entertainment news for article sidebar",
        category: "Entertainment",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 7), // 7 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "article sidebar entertainment",
        displayPlacements: ["article-sidebar"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Article Sidebar 2 - Local News",
        content: "This is a local news article specifically for article details page sidebar.",
        excerpt: "Local news for article sidebar",
        category: "Local",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "article sidebar local",
        displayPlacements: ["article-sidebar"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Insert articles
    const allTestArticles = [...homePageArticles, ...detailsPageArticles];
    const result = await articlesCollection.insertMany(allTestArticles);
    
    console.log(`✅ Successfully added ${result.insertedCount} test articles!`);
    console.log('\nHome Page Articles:');
    homePageArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} [${article.displayPlacements.join(', ')}]`);
    });
    
    console.log('\nDetails Page Articles:');
    detailsPageArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} [${article.displayPlacements.join(', ')}]`);
    });
    
    console.log('\n🎉 Test data setup completed!');
    console.log('You can now test the different article displays on:');
    console.log('- Home page: Shows articles with homepage-* and sidebar-must-read placements');
    console.log('- Article details pages: Shows articles with article-* placements');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding test articles:', error);
    process.exit(1);
  }
}

addTestArticles();
