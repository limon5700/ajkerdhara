
export interface NewsArticle {
  id: string; 
  title: string;
  content: string; 
  excerpt: string; 
  category: Category;
  publishedDate: string; 
  imageUrl?: string;
  dataAiHint?: string; 
  inlineAdSnippets?: string[]; 
  textLinks?: Array<{text: string, url: string}>; // Clickable text links for the article
  authorId?: string; // Can be .env admin or a DB user ID
  displayPlacements?: UnifiedPlacement[]; // Updated to use unified placement system
  detailsPageCategories?: string[]; // Categories that should trigger this article to show in details pages
  detailsPageSpecificPosts?: string[]; // Specific post IDs that should show this article in their details pages

  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[]; 
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string; 
  canonicalUrl?: string;

  articleYoutubeUrl?: string;
  articleFacebookUrl?: string;
  articleMoreLinksUrl?: string; 
}

export type Category = "Technology" | "Sports" | "Business" | "World" | "Entertainment" | string; 

export type LayoutSection =
  | 'homepage-top'
  | 'homepage-content-bottom'
  | 'homepage-article-interstitial'
  | 'homepage-latest-posts'
  | 'homepage-more-headlines'
  | 'article-top'
  | 'article-bottom'
  | 'article-related'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'footer'
  | 'article-inline' 
  | 'header-logo-area'
  | 'below-header'
  | 'article-details-page'
  | 'article-details-sidebar'
  ;

// New type for defining article display locations
export type ArticleDisplayLocation =
  | 'homepage-hero'
  | 'homepage-latest-posts'
  | 'homepage-more-headlines'
  | 'sidebar-must-read'
  | 'article-related'
  | 'article-sidebar'
  ;

// New unified placement system for both articles and ads
export type UnifiedPlacement =
  // Homepage placements
  | 'homepage-hero'           // Main featured article/ad (large size)
  | 'homepage-top'            // At the very top of homepage
  | 'homepage-latest-posts'   // Latest posts grid (medium size)
  | 'homepage-more-headlines' // More headlines section (medium size)
  | 'homepage-sidebar-must-read' // Sidebar must read (small size)
  | 'homepage-content-bottom' // Bottom of homepage content
  | 'homepage-article-interstitial' // Between homepage sections
  | 'homepage-sidebar-top'    // Top of homepage sidebar
  | 'homepage-sidebar-middle' // Middle of homepage sidebar
  | 'homepage-sidebar-bottom' // Bottom of homepage sidebar
  | 'homepage-category-banner' // Category-specific banner area
  | 'homepage-breaking-news'  // Breaking news ticker area
  
  // Article page placements
  | 'article-top'              // Top of article page (full width)
  | 'article-bottom'           // Bottom of article page (full width)
  | 'article-sidebar-left'     // Left sidebar (small size)
  | 'article-sidebar-right'    // Right sidebar (small size)
  | 'article-inline'           // Inline within article content
  | 'article-related'          // Related posts section (medium size)
  | 'article-details-page'     // Article details page main content area
  | 'article-details-sidebar'  // Article details page sidebar
  | 'article-comments-top'     // Above comments section
  | 'article-comments-bottom'  // Below comments section
  | 'article-social-share'     // Social sharing buttons area
  | 'article-author-bio'       // Author biography section
  
  // Category page placements
  | 'category-header'          // Category page header area
  | 'category-top'             // Top of category listing
  | 'category-middle'          // Middle of category posts
  | 'category-bottom'          // Bottom of category listing
  | 'category-sidebar'         // Category page sidebar
  | 'category-pagination'      // Above pagination controls
  
  // Search results placements
  | 'search-results-top'       // Above search results
  | 'search-results-bottom'    // Below search results
  | 'search-results-sidebar'   // Search results sidebar
  | 'search-no-results'        // When no results found
  
  // Header/Footer placements
  | 'header-logo-area'         // Header logo area (small size)
  | 'below-header'             // Below header (full width)
  | 'header-top-banner'        // Top banner above header
  | 'header-announcement'      // Announcement bar area
  | 'footer'                   // Footer area (full width)
  | 'footer-top'               // Top of footer area
  | 'footer-middle'            // Middle of footer content
  | 'footer-bottom'            // Bottom of footer
  | 'footer-newsletter'        // Newsletter signup area
  
  // Sidebar placements
  | 'sidebar-left'             // Left sidebar general
  | 'sidebar-right'            // Right sidebar general
  | 'sidebar-must-read'        // Must-read section
  | 'sidebar-popular'          // Popular posts section
  | 'sidebar-trending'         // Trending topics section
  | 'sidebar-category-list'    // Category listing section
  | 'sidebar-tag-cloud'        // Tag cloud section
  | 'sidebar-about'            // About section
  | 'sidebar-contact'          // Contact information
  
  // Special content placements
  | 'content-break'            // Content break points
  | 'content-interstitial'     // Between content blocks
  | 'content-highlight'        // Highlighted content area
  | 'content-summary'          // Content summary section
  
  // Mobile-specific placements
  | 'mobile-sticky-bottom'     // Sticky bottom on mobile
  | 'mobile-interstitial'      // Mobile interstitial ads
  | 'mobile-notification'      // Mobile notification area
  
  // Video/Media placements
  | 'video-player-top'         // Above video player
  | 'video-player-bottom'      // Below video player
  | 'video-player-sidebar'     // Video player sidebar
  | 'gallery-top'              // Above image gallery
  | 'gallery-bottom'           // Below image gallery
  | 'gallery-interstitial'     // Between gallery images
  
  // Newsletter/Subscription placements
  | 'newsletter-signup'        // Newsletter signup form
  | 'subscription-popup'       // Subscription popup trigger
  | 'subscription-banner'      // Subscription banner
  
  // Error page placements
  | 'error-404'                // 404 error page
  | 'error-500'                // 500 error page
  | 'error-maintenance'        // Maintenance page
  
  // Loading/Transition placements
  | 'loading-screen'           // Loading screen overlay
  | 'page-transition'          // Page transition area
  | 'skeleton-loading'         // Skeleton loading area
  
  // Legacy placements (keeping for backward compatibility)
  | 'category-listing'         // Category page listing
  | 'post-content-middle'      // Middle of post content
  | 'post-content-bottom'      // Bottom of post content
  | 'image-gallery'            // Image gallery overlay
  | 'post-image-overlay'       // Post image overlay
  | 'related-posts-between'    // Between related posts
  | 'must-read-between'        // Between must-read posts
  | 'auto-inject-5'            // Auto inject every 5 posts
  | 'auto-inject-10';          // Auto inject every 10 posts

// Placement size definitions for consistent sizing
export type PlacementSize = 'small' | 'medium' | 'large' | 'full-width';

// Placement configuration with size and responsive behavior
export interface PlacementConfig {
  placement: UnifiedPlacement;
  size: PlacementSize;
  responsive: {
    mobile: PlacementSize;
    tablet: PlacementSize;
    desktop: PlacementSize;
  };
  description: string;
  category: 'homepage' | 'details' | 'header' | 'footer' | 'sidebar' | 'category' | 'content' | 'media' | 'auto' | 'search' | 'mobile' | 'subscription' | 'error' | 'transition';
}

export interface Gadget {
  id: string; 
  section: LayoutSection; 
  title?: string; 
  content: string; 
  isActive: boolean;
  createdAt?: string; 
  order?: number; 
  // New unified placement system
  unifiedPlacement?: UnifiedPlacement;
  placementSize?: PlacementSize;
  targetArticleId?: string; // For article-specific ads
  targetCategory?: string;  // For category-specific ads
  
  // New advanced fields for customizable ad management
  adType: 'html' | 'javascript' | 'image-link' | 'banner' | 'popup';
  autoInjectFrequency?: number; // Every N posts (5, 10, etc.)
  injectPosition?: 'before' | 'after' | 'between';
  targetPages?: string[]; // ['homepage', 'category', 'article', 'sidebar']
  deviceTargeting?: 'all' | 'mobile' | 'desktop' | 'tablet';
  timeTargeting?: {
    startTime?: string; // HH:MM format
    endTime?: string;   // HH:MM format
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  };
  clickTracking?: boolean;
  impressionTracking?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export type CreateNewsArticleData = Omit<NewsArticle, 'id' | 'publishedDate'> & { category: Category };


export type CreateGadgetData = Omit<Gadget, 'id' | 'createdAt'>;

export interface SeoSettings {
  id: string; 
  siteTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[]; 
  faviconUrl?: string; 
  ogSiteName?: string;
  ogLocale?: string; 
  ogType?: string; 
  twitterCard?: string; 
  twitterSite?: string; 
  twitterCreator?: string; 
  updatedAt?: string;

  footerYoutubeUrl?: string;
  footerFacebookUrl?: string;
  footerMoreLinksUrl?: string;
}

export type CreateSeoSettingsData = Omit<SeoSettings, 'id' | 'updatedAt'>;

// User Role System Types
export type Permission =
  | 'manage_articles' // Create, update, delete articles
  | 'publish_articles' // Publish/unpublish articles
  | 'manage_users' // Create, update, delete users
  | 'manage_roles' // Create, update, delete roles and assign permissions
  | 'manage_layout_gadgets' // Manage layout gadgets (ads, etc.)
  | 'manage_seo_global' // Manage global SEO settings
  | 'manage_settings' // Manage other site-wide settings
  | 'view_admin_dashboard'; // Basic permission to view the dashboard

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}
export type CreateRoleData = Omit<Role, 'id' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash: string; // Hashed password
  roles: string[]; // Array of role IDs
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export type CreateUserData = Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> & { password?: string };
export type UpdateUserData = Partial<CreateUserData> & { roles?: string[], isActive?: boolean };


export interface UserSession {
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  roles?: string[]; // Role names or IDs
  permissions?: Permission[];
  isSuperAdmin?: boolean; // True if logged in via .env credentials
}

export interface LoginFormData {
  username: string;
  password?: string;
}

// Analytics Types
export interface PeriodStats {
  today: number;
  yesterday?: number;
  thisWeek?: number;
  thisMonth?: number;
  lastMonth?: number;
  thisYear?: number;
}

export interface UserActivity {
  userId: string;
  username: string;
  postCount: number;
  lastPostDate?: string;
}

export interface DashboardAnalytics {
  totalArticles: number;
  articlesToday: number;
  totalUsers: number;
  activeGadgets: number;
  visitorStats?: { 
    today: number;
    activeNow?: number; 
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  userPostActivity?: UserActivity[];
}

export interface ActivityLogEntry {
  id: string;
  userId: string; // Can be 'SUPERADMIN_ENV' or a user ID from DB
  username: string; // Username of the actor
  action: string; // e.g., 'article_created', 'user_updated', 'role_deleted'
  targetType?: string; // e.g., 'article', 'user', 'role'
  targetId?: string; // ID of the entity that was acted upon
  details?: Record<string, any>; // Additional JSON details about the action
  timestamp: string;
}

export type CreateActivityLogData = Omit<ActivityLogEntry, 'id' | 'timestamp'>;

