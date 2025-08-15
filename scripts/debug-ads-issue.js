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

async function debugAdsIssue() {
  console.log('🔍 Debugging ads/gadgets issue...');
  
  try {
    const { db, client } = await connectToDatabase();
    
    // Check if gadgets collection exists and has data
    const gadgetsCollection = db.collection('gadgets');
    const totalGadgets = await gadgetsCollection.countDocuments();
    console.log(`\n📊 Total gadgets in database: ${totalGadgets}`);
    
    if (totalGadgets > 0) {
      // Check active gadgets
      const activeGadgets = await gadgetsCollection.find({ isActive: true }).toArray();
      console.log(`\n✅ Active gadgets: ${activeGadgets.length}`);
      
      if (activeGadgets.length > 0) {
        console.log('\n📋 Active gadgets by section:');
        const gadgetsBySection = {};
        
        activeGadgets.forEach(gadget => {
          if (!gadgetsBySection[gadget.section]) {
            gadgetsBySection[gadget.section] = [];
          }
          gadgetsBySection[gadget.section].push({
            id: gadget._id,
            title: gadget.title || 'No title',
            section: gadget.section,
            isActive: gadget.isActive,
            hasContent: !!gadget.content
          });
        });
        
        // Show gadgets for each section
        Object.keys(gadgetsBySection).forEach(section => {
          console.log(`\n  🎯 ${section}: ${gadgetsBySection[section].length} gadgets`);
          gadgetsBySection[section].forEach((gadget, index) => {
            console.log(`     ${index + 1}. ${gadget.title} (${gadget.hasContent ? 'has content' : 'NO CONTENT'})`);
          });
        });
        
        // Check specifically for article page sections
        const articleSections = ['article-top', 'article-bottom', 'sidebar-right', 'sidebar-left', 'article-inline'];
        console.log('\n🎯 Article page specific gadgets:');
        
        articleSections.forEach(section => {
          const sectionGadgets = gadgetsBySection[section] || [];
          console.log(`   ${section}: ${sectionGadgets.length} gadgets`);
        });
        
      } else {
        console.log('\n❌ No active gadgets found!');
        
        // Check if there are inactive gadgets
        const inactiveGadgets = await gadgetsCollection.find({ isActive: false }).toArray();
        console.log(`   Inactive gadgets: ${inactiveGadgets.length}`);
        
        if (inactiveGadgets.length > 0) {
          console.log('\n📝 Inactive gadgets that could be activated:');
          inactiveGadgets.forEach((gadget, index) => {
            console.log(`     ${index + 1}. ${gadget.title || 'No title'} (section: ${gadget.section})`);
          });
        }
      }
    } else {
      console.log('\n❌ No gadgets found in database!');
      console.log('\n💡 Creating sample ad gadgets...');
      
      // Create sample gadgets for testing
      const sampleGadgets = [
        {
          title: "Article Top Ad",
          content: `<div style="background: #f0f8ff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; border-radius: 8px;">
            <h3 style="color: #2196F3; margin: 0 0 10px 0;">📢 Article Top Advertisement</h3>
            <p style="margin: 0; color: #666;">This is a sample ad in the article top section</p>
          </div>`,
          section: "article-top",
          isActive: true,
          _id: new ObjectId(),
        },
        {
          title: "Article Bottom Ad",
          content: `<div style="background: #fff8f0; border: 2px dashed #FF9800; padding: 20px; text-align: center; border-radius: 8px;">
            <h3 style="color: #FF9800; margin: 0 0 10px 0;">📢 Article Bottom Advertisement</h3>
            <p style="margin: 0; color: #666;">This is a sample ad in the article bottom section</p>
          </div>`,
          section: "article-bottom",
          isActive: true,
          _id: new ObjectId(),
        },
        {
          title: "Sidebar Right Ad",
          content: `<div style="background: #f0fff0; border: 2px dashed #4CAF50; padding: 15px; text-align: center; border-radius: 8px;">
            <h3 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 14px;">📢 Sidebar Ad</h3>
            <p style="margin: 0; color: #666; font-size: 12px;">This is a sample sidebar ad</p>
          </div>`,
          section: "sidebar-right",
          isActive: true,
          _id: new ObjectId(),
        },
        {
          title: "Article Inline Ad",
          content: `<div style="background: #fdf2ff; border: 2px dashed #9C27B0; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #9C27B0; margin: 0 0 10px 0;">📢 Inline Advertisement</h3>
            <p style="margin: 0; color: #666;">This is a sample inline ad that appears within article content</p>
          </div>`,
          section: "article-inline",
          isActive: true,
          _id: new ObjectId(),
        }
      ];
      
      const insertResult = await gadgetsCollection.insertMany(sampleGadgets);
      console.log(`✅ Created ${insertResult.insertedCount} sample ad gadgets`);
      
      console.log('\n📋 Sample gadgets created:');
      sampleGadgets.forEach((gadget, index) => {
        console.log(`   ${index + 1}. ${gadget.title} (${gadget.section})`);
      });
    }
    
    // Check articles with inline ad snippets
    const articlesCollection = db.collection('articles');
    const articlesWithInlineAds = await articlesCollection.find({ 
      inlineAdSnippets: { $exists: true, $ne: [], $ne: null } 
    }).toArray();
    
    console.log(`\n📰 Articles with inline ad snippets: ${articlesWithInlineAds.length}`);
    
    if (articlesWithInlineAds.length > 0) {
      console.log('\n📝 Articles with inline ads:');
      articlesWithInlineAds.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      Inline ad snippets: ${article.inlineAdSnippets?.length || 0}`);
      });
    }
    
    // Check for [AD_INLINE] markers in article content
    const articlesWithMarkers = await articlesCollection.find({ 
      content: { $regex: '\\[AD_INLINE\\]' } 
    }).toArray();
    
    console.log(`\n🏷️ Articles with [AD_INLINE] markers: ${articlesWithMarkers.length}`);
    
    console.log('\n✅ Debug complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Visit any article page and check if ads are now showing');
    console.log('2. Check browser console for any error messages');
    console.log('3. Verify that the renderGadgetsForSection function is being called');
    console.log('4. Check if gadgets are being fetched properly in the network tab');
    
    // Close database connection
    await client.close();
    
  } catch (error) {
    console.error('❌ Error debugging ads issue:', error);
    process.exit(1);
  }
}

debugAdsIssue();
