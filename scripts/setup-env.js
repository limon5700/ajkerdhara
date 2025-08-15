const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for MongoDB connection...\n');

const envContent = `# MongoDB Connection String
# Replace <username> and <password> with your actual MongoDB Atlas credentials
MONGODB_URI=mongodb+srv://ajkerdhara:ajkerdhara@ajkerdhara.lsyhesv.mongodb.net/?retryWrites=true&w=majority&appName=ajkerdhara

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file already exists!');
    console.log('   Please update it manually with your MongoDB credentials.');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📝 Please edit .env.local and replace:');
    console.log('   - <username> with your MongoDB Atlas username');
    console.log('   - <password> with your MongoDB Atlas password');
  }
  
  console.log('\n🔗 Next steps:');
  console.log('1. Go to MongoDB Atlas dashboard');
  console.log('2. Add your IP address to Network Access');
  console.log('3. Verify your database credentials');
  console.log('4. Update .env.local with real credentials');
  console.log('5. Restart your development server');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
} 