// Load environment variables
require('dotenv').config();

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

async function addInlineAdMarkers() {
  console.log('📝 Adding inline ad markers to articles...');
  
  try {
    const { db, client } = await connectToDatabase();
    const articlesCollection = db.collection('articles');
    
    // Get some articles to add inline ad markers
    const articles = await articlesCollection.find({}).limit(5).toArray();
    console.log(`\n📰 Found ${articles.length} articles to update`);
    
    if (articles.length === 0) {
      console.log('❌ No articles found to update');
      await client.close();
      return;
    }
    
    const updatePromises = articles.map(async (article) => {
      // Add [AD_INLINE] markers to the content at strategic points
      const paragraphs = article.content.split('\n').filter(p => p.trim().length > 0);
      
      if (paragraphs.length >= 3) {
        // Insert ad markers after every 2-3 paragraphs
        const updatedParagraphs = [];
        paragraphs.forEach((paragraph, index) => {
          updatedParagraphs.push(paragraph);
          
          // Add inline ad marker after 2nd paragraph and then every 3 paragraphs
          if (index === 1 || (index > 1 && (index - 1) % 3 === 0)) {
            updatedParagraphs.push('[AD_INLINE]');
          }
        });
        
        const updatedContent = updatedParagraphs.join('\n');
        
        // Also add some inline ad snippets
        const inlineAdSnippets = [
          `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px;">🎯 Targeted Advertisement</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your ad content here - Article Specific</p>
          </div>`,
          `<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px;">🛍️ Special Offer</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Limited time deal - Article Specific</p>
          </div>`
        ];
        
        return articlesCollection.updateOne(
          { _id: article._id },
          { 
            $set: { 
              content: updatedContent,
              inlineAdSnippets: inlineAdSnippets
            } 
          }
        );
      }
    });
    
    const results = await Promise.all(updatePromises.filter(Boolean));
    console.log(`✅ Updated ${results.length} articles with inline ad markers`);
    
    console.log('\n📋 Articles updated:');
    articles.forEach((article, index) => {
      if (index < results.length) {
        const markerCount = (article.content.match(/\[AD_INLINE\]/g) || []).length;
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      Added inline ad markers and snippets`);
      }
    });
    
    console.log('\n🎉 Inline ad setup completed!');
    console.log('\n💡 Testing instructions:');
    console.log('1. Visit one of the updated articles');
    console.log('2. Look for inline ads within the article content');
    console.log('3. The ads should appear between paragraphs where [AD_INLINE] markers were placed');
    console.log('4. Check that both article-specific snippets and default gadgets are working');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error adding inline ad markers:', error);
    process.exit(1);
  }
}

addInlineAdMarkers();
