const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseArticles() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔍 Checking Database Articles...');
    console.log('================================');
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const articlesCollection = db.collection('articles');
    
    // Count total articles
    const totalArticles = await articlesCollection.countDocuments();
    console.log(`📊 Total articles in database: ${totalArticles}`);
    
    if (totalArticles === 0) {
      console.log('⚠️  No articles found in database');
      console.log('💡 The application will use sample data');
      return;
    }
    
    // Get all articles with their image URLs
    const articles = await articlesCollection.find({}).toArray();
    
    console.log('\n📋 Articles in Database:');
    console.log('========================');
    
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. Article ID: ${article._id}`);
      console.log(`   Title: ${article.title || 'No title'}`);
      console.log(`   Category: ${article.category || 'No category'}`);
      console.log(`   Image URL: ${article.imageUrl || '❌ NO IMAGE URL'}`);
      console.log(`   Published: ${article.publishedDate || 'No date'}`);
      
      if (!article.imageUrl) {
        console.log('   ⚠️  This article has no image URL!');
      }
    });
    
    // Count articles with images
    const articlesWithImages = articles.filter(article => article.imageUrl);
    const articlesWithoutImages = articles.filter(article => !article.imageUrl);
    
    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`✅ Articles with images: ${articlesWithImages.length}`);
    console.log(`❌ Articles without images: ${articlesWithoutImages.length}`);
    
    if (articlesWithoutImages.length > 0) {
      console.log('\n💡 To fix missing images, you can:');
      console.log('   1. Add imageUrl field to articles in admin panel');
      console.log('   2. Use placeholder images like: https://picsum.photos/seed/[category]/800/400');
      console.log('   3. Upload images to your server and use those URLs');
    }
    
  } catch (error) {
    console.error('❌ Error checking database articles:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

checkDatabaseArticles(); 