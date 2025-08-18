#!/usr/bin/env tsx

import { createSuperAdmin } from '../lib/data';

async function setupAdmin() {
  try {
    console.log('🚀 Setting up SuperAdmin user...');
    
    // You can change these credentials
    const username = 'admin';
    const password = 'admin123';
    
    console.log(`📝 Creating SuperAdmin with username: ${username}`);
    
    const user = await createSuperAdmin(username, password);
    
    if (user) {
      console.log('✅ SuperAdmin created successfully!');
      console.log(`👤 Username: ${user.username}`);
      console.log(`🆔 User ID: ${user.id}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔐 Password: ${password} (remember this!)`);
      console.log('\n🎉 You can now login to the admin panel with these credentials!');
    } else {
      console.log('❌ Failed to create SuperAdmin');
    }
  } catch (error) {
    console.error('💥 Error setting up SuperAdmin:', error);
  }
}

// Run the setup
setupAdmin();
