#!/usr/bin/env node

/**
 * MongoDB Connection Diagnostic Script
 * 
 * This script helps diagnose MongoDB connection issues.
 * Run with: node scripts/test-mongodb-connection.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  console.log('🔍 MongoDB Connection Diagnostic');
  console.log('================================');
  
  // Check if MONGODB_URI exists
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in your .env file');
    console.log('💡 Add this to your .env file:');
    console.log('   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"');
    return;
  }
  
  // Check URI format
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid MONGODB_URI format');
    console.log('💡 URI must start with "mongodb://" or "mongodb+srv://"');
    return;
  }
  
  // Mask sensitive info for logging
  const maskedUri = MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:****@');
  console.log(`✅ MONGODB_URI format is valid: ${maskedUri}`);
  
  // Test connection
  console.log('\n🔄 Testing connection...');
  
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  
  try {
    console.log('⏳ Attempting to connect...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db();
    console.log(`📊 Database name: ${db.databaseName}`);
    
    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collections:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    console.error(`Type: ${error.name}`);
    
    // Provide specific guidance
    if (error.name === 'MongoTimeoutError') {
      console.log('\n💡 TIMEOUT ERROR - Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas IP whitelist includes your IP');
      console.log('   3. Check if MongoDB cluster is running');
      console.log('   4. Try connecting from a different network');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 AUTHENTICATION ERROR - Possible solutions:');
      console.log('   1. Check username and password in MONGODB_URI');
      console.log('   2. Verify the user has proper permissions');
      console.log('   3. Check if the user exists in the database');
    } else if (error.message.includes('querySrv EBADNAME')) {
      console.log('\n💡 DNS ERROR - Possible solutions:');
      console.log('   1. Check the cluster URL in your MONGODB_URI');
      console.log('   2. Verify the cluster name is correct');
      console.log('   3. Try using the full connection string from MongoDB Atlas');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 CONNECTION REFUSED - Possible solutions:');
      console.log('   1. Check if MongoDB server is running');
      console.log('   2. Verify firewall settings');
      console.log('   3. Check if the port is correct');
    }
    
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

// Run the test
testMongoDBConnection().catch(console.error); 