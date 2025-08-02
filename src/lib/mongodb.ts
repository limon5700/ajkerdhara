
import { MongoClient, Db, ServerApiVersion, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.trim() === "") {
  console.warn("⚠️  WARNING: MONGODB_URI is not defined or is empty.");
  console.warn("   For frontend development, using mock data instead.");
  console.warn("   To connect to a real database, define MONGODB_URI in your .env file");
  console.warn("   It should look like: MONGODB_URI=\"mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority\"");
  
  // For frontend development, we'll use mock data instead of throwing an error
  if (process.env.NODE_ENV === 'development') {
    console.warn("   Using mock data for development mode.");
    // Don't throw error in development mode
  } else {
    throw new Error(
      'The MONGODB_URI environment variable is not defined or is empty. Please define it in your .env file (e.g., MONGODB_URI="mongodb+srv://...") and ensure it is available to your application. It must start with "mongodb://" or "mongodb+srv://".'
    );
  }
}

// Only validate MONGODB_URI if it exists (for development mode, it might not be set)
if (MONGODB_URI && MONGODB_URI.trim() !== "") {
  const commonPlaceholders = ['YOUR_CLUSTER_URL', 'YOUR_DB_NAME', 'YOUR_USERNAME', 'YOUR_PASSWORD', '<cluster-url>', '<dbname>', '<username>', '<password>'];

  if (commonPlaceholders.some(ph => MONGODB_URI.includes(ph))) {
    console.error("🔴 CRITICAL ERROR: MONGODB_URI in your .env file appears to contain placeholder values (e.g., <username>, <password>, <cluster-url>, <dbname>, YOUR_USERNAME, etc.).");
    console.error("   Please replace these placeholders with your actual MongoDB credentials and cluster information.");
    let maskedUri = MONGODB_URI;
    const sensitivePlaceholdersToMask = ['<username>', '<password>', 'YOUR_USERNAME', 'YOUR_PASSWORD'];
    sensitivePlaceholdersToMask.forEach(ph => {
      if (MONGODB_URI.includes(ph)) {
          maskedUri = maskedUri.replace(new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '****');
      }
    });
    console.error("   Your current MONGODB_URI (partially masked for logging):", maskedUri);
    throw new Error(
      'MONGODB_URI contains placeholder values. Please update your .env file with actual credentials and ensure no placeholder bracketed values <> or "YOUR_..." strings remain.'
    );
  }

  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error("🔴 CRITICAL ERROR: Invalid MONGODB_URI scheme.");
      console.error(`   The connection string you provided starts with: "${MONGODB_URI.substring(0, 20)}..."`);
      console.error(`   It MUST start with "mongodb://" or "mongodb+srv://".`);
      console.error("   Please check and correct the MONGODB_URI in your .env file or your hosting provider's environment variable settings.");
      throw new Error(
          'Invalid MONGODB_URI scheme. The connection string must start with "mongodb://" or "mongodb+srv://". Please check your .env file.'
      );
  }
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  // Require MONGODB_URI to be set - no more mock data fallback
  if (!MONGODB_URI || MONGODB_URI.trim() === "") {
    throw new Error("MONGODB_URI environment variable is required. Please set it in your .env.local file.");
  }

  // Check cached connection with fast timeout
  if (cachedClient && cachedDb) {
    try {
      // Very fast ping check with short timeout
      const pingPromise = cachedDb.admin().ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ping timeout')), 1000) // 1 second timeout
      );
      await Promise.race([pingPromise, timeoutPromise]);
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn("Cached MongoDB connection lost, clearing cache.", error);
      cachedClient = null;
      cachedDb = null;
    }
  }


  // Create client with very aggressive timeouts for fail-fast behavior
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Very aggressive timeouts to prevent hanging
    serverSelectionTimeoutMS: 3000, // 3 seconds
    connectTimeoutMS: 3000, // 3 seconds
    socketTimeoutMS: 3000, // 3 seconds
    maxPoolSize: 1, // Minimal pool size
    minPoolSize: 0, // No minimum pool
  });

  try {
    // Wrap connection in a timeout to ensure it doesn't hang
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    let dbName;
    try {
        const url = new URL(MONGODB_URI);
        const pathSegments = url.pathname.substring(1).split('/');
        dbName = pathSegments[0] || undefined; 

        if (!dbName && MONGODB_URI.startsWith('mongodb+srv://')) {
            console.warn(`Database name not explicitly found in MONGODB_URI path for SRV connection: ${url.pathname}. The driver will use the default database specified in your connection string options or 'test' if none is found. Ensure your SRV URI is complete, like 'mongodb+srv://user:pass@cluster/<dbname>?options'.`);
        } else if (!dbName) {
            console.warn(`Database name not found in MONGODB_URI path: ${url.pathname}. The driver may default to 'test'. Ensure your URI includes the database name, like 'mongodb://host/<dbname>'.`);
        }
    } catch (e: any) {
        console.error("Could not parse MONGODB_URI to extract database name. This might indicate a malformed URI. URI used (password and username masked for security):", MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:****@'));
        console.error("Parsing error details:", e.message);
    }

    const db = client.db(dbName); 
    
    cachedClient = client;
    cachedDb = db;

    console.log("✅ Successfully connected to MongoDB. Database being used: " + (db.databaseName || (dbName ? dbName : "default/test")));
    return { client, db };
  } catch (error: any) {
    // Ensure client is closed on error
    if (client && typeof client.close === 'function') {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing MongoDB client after connection failure:", closeError);
      }
    }

    // Log the error with context
    console.error("🔴 CRITICAL ERROR: Failed to connect to MongoDB.");
    console.error("   URI used (username/password masked):", MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:****@'));
    console.error("   Connection Error Details:", error.message);
    console.error("   Error Type:", error.name || 'Unknown');
    
    // Provide specific guidance based on error type
    if (error.name === 'MongoTimeoutError' || error.message.includes('timeout')) {
      console.error("   ⚠️  TIMEOUT ERROR: Database connection timed out. This usually means:");
      console.error("     1. Network connectivity issues");
      console.error("     2. MongoDB Atlas IP whitelist - your IP is not allowlisted");
      console.error("     3. Firewall blocking the connection");
      console.error("     4. MongoDB cluster is down or unreachable");
    } else if (error.message && error.message.includes('querySrv EBADNAME')) {
      console.error("   ⚠️  DNS ERROR: Cannot resolve cluster URL. Check your MONGODB_URI cluster name.");
    } else if (error.message && error.message.includes('Authentication failed')) {
      console.error("   ⚠️  AUTH ERROR: Invalid username/password in MONGODB_URI.");
    } else if (error.message && (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED'))) {
      console.error("   ⚠️  CONNECTION REFUSED: Server is not accepting connections.");
    }

    // Throw error instead of returning mock connection - force real database usage
    throw new Error(`Failed to connect to MongoDB: ${error.message}. Please check your connection string and network settings.`);
  }
}

export { ObjectId };
    
