# MongoDB Connection Troubleshooting

## Common Issues and Solutions

### 1. Connection Timeout Error
**Error**: `Server selection timed out after 5000 ms`

**Possible Causes**:
- Network connectivity issues
- MongoDB Atlas IP whitelist - your IP is not allowlisted
- Firewall blocking the connection
- MongoDB cluster is down or unreachable

**Solutions**:
1. **Check your internet connection**
2. **Add your IP to MongoDB Atlas whitelist**:
   - Go to MongoDB Atlas dashboard
   - Navigate to Network Access
   - Click "Add IP Address"
   - Add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0) for development
3. **Check firewall settings** on your machine/network
4. **Verify your MongoDB cluster is running** in Atlas dashboard

### 2. Environment Variable Setup

Create a `.env.local` file in your project root with:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Replace the placeholders with your actual values:
- `<username>`: Your MongoDB Atlas username
- `<password>`: Your MongoDB Atlas password  
- `<cluster-url>`: Your cluster URL (e.g., cluster0.8obupn9.mongodb.net)
- `<database-name>`: Your database name

### 3. Testing Connection

Run the connection test script:
```bash
node scripts/test-mongodb-connection.js
```

### 4. Development Mode Fallback

The application is configured to use mock data when MongoDB is unavailable, so the app won't crash. However, you'll need a working database connection for full functionality.

### 5. Getting MongoDB Atlas Credentials

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster if you don't have one
3. Go to Database Access to create a user
4. Go to Network Access to whitelist your IP
5. Click "Connect" on your cluster to get the connection string

## Support

If you continue having issues:
1. Check MongoDB Atlas status page
2. Verify your connection string format
3. Test with MongoDB Compass or similar tool
4. Check your network/firewall settings 