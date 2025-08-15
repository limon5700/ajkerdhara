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

async function addTestPostsForCategoryFiltering() {
  console.log('🚀 Adding test posts across different categories for filtered selection...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // Add posts across different categories
    const testPosts = [
      // Technology Posts
      {
        title: "AI Revolution: How Machine Learning is Transforming Industries",
        content: "Detailed article about AI impact on various industries...",
        excerpt: "AI is changing how businesses operate",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "AI technology industry",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Quantum Computing: The Next Frontier in Technology",
        content: "Exploring the potential of quantum computing...",
        excerpt: "Quantum computing breakthroughs",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "quantum computing",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Cybersecurity Trends in 2025: What You Need to Know",
        content: "Latest cybersecurity developments and threats...",
        excerpt: "Cybersecurity trends and protection",
        category: "Technology",
        publishedDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "cybersecurity trends",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      
      // Sports Posts
      {
        title: "World Cup 2026: Host Cities and Stadium Updates",
        content: "Latest updates on World Cup 2026 preparations...",
        excerpt: "World Cup 2026 preparations underway",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "world cup football",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Olympic Games: New Sports Added for Next Olympics",
        content: "Exciting new sports joining the Olympic roster...",
        excerpt: "New Olympic sports announced",
        category: "Sports",
        publishedDate: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "olympics new sports",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      
      // Business Posts
      {
        title: "Global Market Trends: Economic Outlook for 2025",
        content: "Analysis of global economic trends and forecasts...",
        excerpt: "Economic outlook and market analysis",
        category: "Business",
        publishedDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "market trends economy",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Startup Success Stories: Companies That Made It Big",
        content: "Inspiring stories of successful startups...",
        excerpt: "Successful startup journeys",
        category: "Business",
        publishedDate: new Date(Date.now() - 1000 * 60 * 70), // 70 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "startup success stories",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      
      // Entertainment Posts
      {
        title: "Hollywood Blockbusters 2025: Most Anticipated Movies",
        content: "Preview of the most exciting movies coming this year...",
        excerpt: "Upcoming blockbuster movies",
        category: "Entertainment",
        publishedDate: new Date(Date.now() - 1000 * 60 * 80), // 80 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "hollywood movies 2025",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      {
        title: "Music Industry: Streaming vs Traditional Album Sales",
        content: "Analysis of how streaming has changed the music industry...",
        excerpt: "Music industry evolution",
        category: "Entertainment",
        publishedDate: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "music streaming industry",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      },
      
      // World News Posts
      {
        title: "Climate Change Summit: Global Leaders Unite for Action",
        content: "Latest developments from the international climate summit...",
        excerpt: "Climate action and global cooperation",
        category: "World",
        publishedDate: new Date(Date.now() - 1000 * 60 * 100), // 100 minutes ago
        imageUrl: "/placeholder-image.svg",
        dataAiHint: "climate change summit",
        displayPlacements: ["homepage-latest-posts"],
        authorId: "SYSTEM",
        _id: new ObjectId(),
      }
    ];
    
    // Insert articles
    const result = await articlesCollection.insertMany(testPosts);
    
    console.log(`✅ Successfully added ${result.insertedCount} test posts across different categories!`);
    
    // Group by category for display
    const categories = {};
    testPosts.forEach(post => {
      if (!categories[post.category]) {
        categories[post.category] = [];
      }
      categories[post.category].push(post.title);
    });
    
    console.log('\n📋 Test Posts by Category:');
    Object.entries(categories).forEach(([category, posts]) => {
      console.log(`\n🏷️  ${category} (${posts.length} posts):`);
      posts.forEach((title, index) => {
        console.log(`   ${index + 1}. ${title}`);
      });
    });
    
    console.log('\n🎉 Category-filtered post selection test data setup completed!');
    console.log('\n📋 Testing Instructions:');
    console.log('1. Go to admin dashboard → Articles → Add New Article');
    console.log('2. Select "Article Related Posts" or "Article Sidebar" placement');
    console.log('3. In "Category-Based Display" section, select specific categories (e.g., Technology, Sports)');
    console.log('4. Notice the "Specific Post Targeting" section now shows:');
    console.log('   📋 "Filtered by selected categories: Technology, Sports"');
    console.log('5. The post list will only show posts from the selected categories');
    console.log('6. Clear category selections to see all posts again');
    
    console.log('\n🔬 Test Results Expected:');
    console.log('   - Select "Technology": See only 3 tech-related posts');
    console.log('   - Select "Sports": See only 2 sports-related posts');
    console.log('   - Select "Technology + Sports": See 5 posts from both categories');
    console.log('   - Select no categories: See all 10 posts');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding test posts for category filtering:', error);
    process.exit(1);
  }
}

addTestPostsForCategoryFiltering();
