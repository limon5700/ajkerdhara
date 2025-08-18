# Admin User Setup Guide

This guide explains how to set up admin users in MongoDB instead of using environment variables.

## Overview

The system now supports storing admin credentials in MongoDB, which is more secure and flexible than environment variables. You can still use environment variables as a fallback if needed.

## Setup Methods

### Method 1: Web Interface (Recommended)

1. **Access the setup page**: Navigate to `/admin/setup` in your browser
2. **Enter credentials**: Use the default credentials or create custom ones:
   - Default Username: `admin`
   - Default Password: `admin123`
3. **Click "Create SuperAdmin"**: This will create the user in MongoDB
4. **Login**: Go to `/admin/login` and use your credentials

### Method 2: Command Line Script

1. **Run the setup script**:
   ```bash
   npm run setup-admin
   ```
2. **Follow the prompts**: The script will create a SuperAdmin user
3. **Use the credentials**: Login with the created username and password

### Method 3: Manual Database Setup

If you prefer to create the user directly in MongoDB:

1. **Connect to your MongoDB database**
2. **Create a SuperAdmin role** (if it doesn't exist):
   ```javascript
   db.roles.insertOne({
     name: "SuperAdmin",
     description: "Super Administrator with all permissions",
     permissions: ["view_admin_dashboard", "manage_articles", "manage_users", "manage_roles", "manage_layout_gadgets", "manage_seo_global", "manage_settings"],
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. **Create the SuperAdmin user**:
   ```javascript
   db.users.insertOne({
     username: "admin",
     email: "admin@admin.local",
     passwordHash: "bcrypt_hashed_password_here", // Use bcrypt with 12 salt rounds
     roles: ["role_id_here"], // Use the SuperAdmin role ID
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## How It Works

### Authentication Priority

1. **Database Users First**: The system checks MongoDB for user credentials
2. **Environment Variables Fallback**: If no database user is found, it falls back to `.env` credentials (if set)

### Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
- **Session Management**: Secure HTTP-only cookies with proper expiration
- **Role-Based Access**: Granular permissions system
- **Activity Logging**: All admin actions are logged for audit purposes

## Environment Variables (Optional)

You can still set these environment variables as a fallback:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
MONGODB_URI=your_mongodb_connection_string
```

## Database Collections

The system uses these MongoDB collections:

- **`users`**: User accounts with hashed passwords
- **`roles`**: Role definitions with permissions
- **`permissions`**: Available system permissions
- **`activity_logs`**: Audit trail of admin actions

## Troubleshooting

### Common Issues

1. **"SuperAdmin already exists"**: The user was already created
2. **"MongoDB connection failed"**: Check your `MONGODB_URI` environment variable
3. **"Permission denied"**: Ensure the user has the SuperAdmin role

### Reset Admin User

If you need to reset the admin user:

1. **Delete from database**:
   ```javascript
   db.users.deleteOne({ username: "admin" })
   ```
2. **Re-run setup**: Use the setup page or script again

## Best Practices

1. **Change Default Password**: Always change the default `admin123` password
2. **Use Strong Passwords**: Minimum 8 characters with mixed case and symbols
3. **Regular Updates**: Update admin passwords periodically
4. **Monitor Activity**: Check activity logs for suspicious activity
5. **Backup Users**: Export user data before major changes

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify MongoDB connection and permissions
3. Ensure all required collections exist
4. Check the server logs for detailed error information
