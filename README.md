# Samay-Barta - Advanced News Website

A comprehensive news website built with Next.js, featuring advanced ad management, alternating post-ad patterns, and modern UI components.

## 🚀 **New Advanced Ad Management System**

### **Key Features:**

#### **🎯 Dynamic Ad Placement**
- **Homepage Sections**: Hero, Latest Posts, More Headlines, Sidebar Must-Read
- **Article Pages**: Top, Bottom, Inline, Related Posts, Sidebar
- **Special Sections**: Category Listing, Post Content Middle/Bottom
- **Media Integration**: Image Gallery Overlay, Post Image Overlay
- **Auto-Injection**: Every 5 or 10 posts automatically

#### **🔧 Advanced Controls**
- **Ad Types**: HTML, JavaScript, Image Links, Banners, Popups
- **Device Targeting**: Mobile, Tablet, Desktop, All Devices
- **Priority System**: Low, Medium, High, Urgent
- **Time Targeting**: Start/End times, Days of week
- **Performance Tracking**: Click and impression tracking

#### **📱 Smart Placement Logic**
- **Auto-Injection**: Set frequency (every N posts)
- **Position Control**: Before, After, Between posts
- **Category Targeting**: Specific article categories
- **Page Targeting**: Homepage, Category, Article, Sidebar

### **🔄 Auto-Injection System**
- **Every 5 Posts**: Automatic ad placement every 5 articles
- **Every 10 Posts**: Automatic ad placement every 10 articles
- **Smart Positioning**: Between, before, or after post sections
- **Priority-Based**: Higher priority ads shown first

### **🎨 Content Integration**
- **Post Content**: Middle and bottom placement
- **Related Posts**: Between related article sections
- **Must-Read**: Between must-read post blocks
- **Image Overlays**: Direct link integration with Adsterra

## 🏗️ **Architecture**

### **Core Components:**
- `AlternatingPostsAndAds`: Smart content mixing component
- `GadgetForm`: Advanced ad creation/editing form
- `AdsManagementPage`: Comprehensive ad management dashboard
- `AlternatingPatternManager`: Pattern configuration interface

### **API Endpoints:**
- `/api/ads`: Full CRUD operations for ads
- `/api/articles`: Article management with placement support
- Advanced filtering by placement, device, category, and priority

### **Data Types:**
- **UnifiedPlacement**: 25+ placement options
- **Gadget**: Advanced ad configuration with targeting
- **LayoutSection**: Section-based content organization

## 🛠️ **Setup & Installation**

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## 📊 **Admin Dashboard**

### **New Pages:**
1. **Ads Management** (`/admin/ads-management`)
   - Create, edit, delete advertisements
   - Advanced targeting and placement controls
   - Performance tracking and analytics
   - Auto-injection configuration

2. **Post-Ad Patterns** (`/admin/alternating-patterns`)
   - Configure alternating patterns
   - Section-specific settings
   - Live preview and testing

3. **Layout Editor** (`/admin/layout-editor`)
   - Manage content placement
   - Gadget and section configuration

## 🎯 **Usage Examples**

### **Creating Auto-Inject Ads:**
```typescript
// Ad that appears every 5 posts
{
  unifiedPlacement: 'auto-inject-5',
  adType: 'banner',
  autoInjectFrequency: 5,
  injectPosition: 'between',
  priority: 'high',
  deviceTargeting: 'all'
}
```

### **Image Link Ads:**
```typescript
// Adsterra direct link integration
{
  unifiedPlacement: 'post-image-overlay',
  adType: 'image-link',
  content: '<img src="adsterra-link" alt="Advertisement" />',
  deviceTargeting: 'mobile'
}
```

### **Category-Specific Ads:**
```typescript
// Technology category targeting
{
  unifiedPlacement: 'category-listing',
  targetCategory: 'Technology',
  priority: 'medium',
  clickTracking: true
}
```

## 🔧 **Configuration**

### **Environment Variables:**
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Admin Access
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# API Keys (for future integrations)
ADSTERRA_API_KEY=your_adsterra_api_key
```

### **Placement Categories:**
- **homepage**: Main page sections
- **details**: Article page areas
- **sidebar**: Sidebar placements
- **header**: Header and navigation
- **footer**: Footer areas
- **category**: Category page listings
- **content**: Post content integration
- **media**: Image and gallery overlays
- **auto**: Automatic injection

## 📱 **Responsive Design**

- **Mobile-First**: Optimized for all screen sizes
- **Device Targeting**: Specific ad experiences per device
- **Performance**: Lightweight and fast loading
- **Accessibility**: WCAG compliant components

## 🚀 **Future Enhancements**

- **Real-time Analytics**: Live performance tracking
- **A/B Testing**: Ad performance optimization
- **Machine Learning**: Smart placement recommendations
- **Multi-language**: International ad support
- **Advanced Targeting**: Behavioral and contextual targeting

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
