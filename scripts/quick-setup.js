#!/usr/bin/env node

/**
 * Quick Setup Script for Admin User
 * This script helps you create a SuperAdmin user in MongoDB
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Quick Admin Setup for Samay-Barta');
console.log('=====================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    console.log('Choose your setup method:\n');
    console.log('1. Web Interface (Recommended)');
    console.log('2. Command Line Script');
    console.log('3. Manual Database Setup');
    console.log('4. Exit\n');

    const choice = await askQuestion('Enter your choice (1-4): ');

    switch (choice) {
      case '1':
        console.log('\n✅ Web Interface Setup Selected');
        console.log('\n📋 Steps:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Open your browser and go to: http://localhost:9002/admin/setup');
        console.log('3. Use default credentials or create custom ones');
        console.log('4. Click "Create SuperAdmin"');
        console.log('5. Go to http://localhost:9002/admin/login to access admin panel');
        break;

      case '2':
        console.log('\n✅ Command Line Script Setup Selected');
        console.log('\n📋 Steps:');
        console.log('1. Make sure your MongoDB is running and MONGODB_URI is set');
        console.log('2. Run: npm run setup-admin');
        console.log('3. The script will create a SuperAdmin user automatically');
        console.log('4. Use the created credentials to login');
        break;

      case '3':
        console.log('\n✅ Manual Database Setup Selected');
        console.log('\n📋 Steps:');
        console.log('1. Connect to your MongoDB database');
        console.log('2. Create SuperAdmin role (see ADMIN_SETUP.md for details)');
        console.log('3. Create SuperAdmin user with bcrypt hashed password');
        console.log('4. Use the credentials to login');
        break;

      case '4':
        console.log('\n👋 Goodbye!');
        break;

      default:
        console.log('\n❌ Invalid choice. Please run the script again.');
    }

    if (choice !== '4') {
      console.log('\n📚 For detailed instructions, see ADMIN_SETUP.md');
      console.log('🔗 GitHub: https://github.com/your-repo/Samay-Barta');
    }

  } catch (error) {
    console.error('💥 Error during setup:', error);
  } finally {
    rl.close();
  }
}

main();
