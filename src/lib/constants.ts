
import type { NewsArticle, Category, Permission, PlacementConfig, UnifiedPlacement, PlacementSize } from './types';

export const defaultLanguage: string = 'en'; 

export const uiTexts: Record<string, Record<string, string>> = {
  en: {
    appName: "Clypio",
    appSubtitle: "Global Stories in a Snap",
    searchPlaceholder: "Search news...",
    allCategories: "All",
    technologyCategory: "Technology",
    sportsCategory: "Sports",
    businessCategory: "Business",
    worldCategory: "World",
    entertainmentCategory: "Entertainment",
    seeMore: "See More",
    backToNews: "Back to News",
    articleNotFound: "Article not found.",

    footerReserved: "All rights reserved.",
    footerPoweredBy: "Powered by Clypio",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",

    faq: "FAQ",
    termsAndConditions: "Terms & Conditions",
    faqTitle: "Frequently Asked Questions",
    termsTitle: "Terms and Conditions",
    loading: "Loading...",
    noArticlesFound: "No news articles found matching your criteria.",
    articleTitleLabel: "Title",
    articleContentLabel: "Content",
    publishedDateLabel: "Published",
    error: "Error",
    seoSiteTitleLabel: "Site Title",
    seoMetaDescriptionLabel: "Meta Description",
    seoMetaKeywordsLabel: "Meta Keywords (comma-separated)",
    seoFaviconUrlLabel: "Favicon URL",
    seoOgSiteNameLabel: "Open Graph Site Name",
    seoOgLocaleLabel: "Open Graph Locale (e.g., en_US)",
    seoOgTypeLabel: "Open Graph Type (e.g., website)",
    seoTwitterCardLabel: "Twitter Card Type",
    seoTwitterSiteLabel: "Twitter Site Handle (e.g., @username)",
    seoTwitterCreatorLabel: "Twitter Creator Handle (Optional)",
    seoSettingsSaved: "SEO settings saved successfully.",
    seoSettingsError: "Error saving SEO settings.",
    articleMetaTitleLabel: "Meta Title (SEO)",
    articleMetaDescriptionLabel: "Meta Description (SEO)",
    articleMetaKeywordsLabel: "Meta Keywords (SEO, comma-separated)",
    articleOgTitleLabel: "Open Graph Title (Social)",
    articleOgDescriptionLabel: "Open Graph Description (Social)",
    articleOgImageLabel: "Open Graph Image URL (Social)",
    articleCanonicalUrlLabel: "Canonical URL (Advanced)",
    // User Roles related texts
    manageUsers: "Manage Users & Roles",
    username: "Username",
    email: "Email",
    password: "Password",
    roles: "Roles",
    userActive: "User Active",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    userCreated: "User created successfully.",
    userUpdated: "User updated successfully.",
    userDeleted: "User deleted successfully.",
    manageRoles: "Manage Roles",
    roleName: "Role Name",
    roleDescription: "Description (Optional)",
    permissions: "Permissions",
    addRole: "Add Role",
    editRole: "Edit Role",
    deleteRole: "Delete Role",
    confirmDeleteRole: "Are you sure you want to delete this role? This will unassign it from all users.",
    roleCreated: "Role created successfully.",
    roleUpdated: "Role updated successfully.",
    roleDeleted: "Role deleted successfully.",
    cancel: "Cancel",
    save: "Save",
    viewAdminDashboardPermission: "View Admin Dashboard",
    manageArticlesPermission: "Manage Articles",
    publishArticlesPermission: "Publish Articles",
    manageUsersPermission: "Manage Users",
    manageRolesPermission: "Manage Roles",
    manageLayoutGadgetsPermission: "Manage Layout/Gadgets",
    manageSeoGlobalPermission: "Manage Global SEO",
    manageSettingsPermission: "Manage Site Settings",
    userAndRoleManagement: "User & Role Mgmt",
    activityLog: "Activity Log",
  },

};

export const categories: Category[] = ["Technology", "Sports", "Business", "World", "Entertainment"];

export const initialSampleNewsArticles: NewsArticle[] = [
    {
    id: '1', 
    title: 'Groundbreaking AI Model Released by Tech Giant',
    content: 'A major technology corporation today unveiled a new artificial intelligence model that promises to revolutionize natural language processing. The model, named "Phoenix-7B", boasts an unprecedented number_of_parameters and has demonstrated superior performance in a variety of benchmarks, including text generation, translation, and question answering. Experts believe this could pave the way for more sophisticated AI applications in the near future. The company plans to offer API access to developers starting next quarter.',
    excerpt: 'A new AI model, Phoenix-7B, has been released, promising to revolutionize natural language processing with its advanced capabilities.',
    category: 'Technology',
    publishedDate: '2024-07-28T10:00:00Z',
    imageUrl: 'https://picsum.photos/seed/tech1/800/400',
    dataAiHint: 'circuit board',
    authorId: 'env_superadmin',
    metaTitle: 'Tech Giant Unveils Phoenix-7B AI Model',
    metaDescription: 'Explore the groundbreaking Phoenix-7B AI model, set to redefine natural language processing. Learn about its features and future applications.',
    metaKeywords: ['AI', 'Artificial Intelligence', 'Phoenix-7B', 'Tech Giant', 'NLP'],
  },
  {
    id: '2',
    title: 'National Team Secures Victory in World Championship',
    content: 'The national football team clinched a historic victory in the World Championship finals last night after a thrilling match that went into extra time. The winning goal, scored in the 115th minute, sent fans into a frenzy. This marks the team\'s first championship title in over two decades. Celebrations are expected to continue throughout the week across the country. The team captain dedicated the win to their passionate supporters.',
    excerpt: 'The national football team won the World Championship in a thrilling final match, marking their first title in decades.',
    category: 'Sports',
    publishedDate: '2024-07-27T22:30:00Z',
    imageUrl: 'https://picsum.photos/seed/sports1/800/400',
    dataAiHint: 'stadium lights',
    authorId: 'env_superadmin',
  },
  {
    id: '3',
    title: 'Global Markets React to New Economic Policy',
    content: 'Financial markets worldwide showed significant volatility today as governments announced a coordinated economic policy aimed at stabilizing inflation rates. Major stock indices experienced both gains and losses throughout the trading session, with technology stocks leading the recovery. Analysts predict this policy could have long-term positive effects on global economic growth. The policy includes measures to support small businesses and reduce trade barriers between participating nations.',
    excerpt: 'Global markets experienced volatility as new coordinated economic policies were announced to address inflation concerns.',
    category: 'Business',
    publishedDate: '2024-07-26T15:45:00Z',
    imageUrl: 'https://picsum.photos/seed/business1/800/400',
    dataAiHint: 'stock market',
    authorId: 'env_superadmin',
  },
  {
    id: '4',
    title: 'Climate Summit Reaches Historic Agreement',
    content: 'World leaders at the International Climate Summit have reached a historic agreement to reduce carbon emissions by 50% by 2030. The landmark deal includes commitments from over 150 countries and establishes a new framework for climate action. Environmental groups have praised the agreement as a significant step forward in addressing climate change. Implementation plans are expected to be finalized within the next six months.',
    excerpt: 'World leaders reached a historic climate agreement to reduce carbon emissions by 50% by 2030.',
    category: 'World',
    publishedDate: '2024-07-25T18:20:00Z',
    imageUrl: 'https://picsum.photos/seed/world1/800/400',
    dataAiHint: 'climate change',
    authorId: 'env_superadmin',
  },
  {
    id: '5',
    title: 'Award-Winning Film Director Announces New Project',
    content: 'Acclaimed filmmaker Sarah Johnson has announced her next major project, a biographical drama about a pioneering scientist. The film, which will begin production next year, has already attracted A-list talent and secured significant funding. Johnson\'s previous works have won multiple international awards and critical acclaim. The project is expected to be released in theaters worldwide in late 2025.',
    excerpt: 'Award-winning director Sarah Johnson announces new biographical drama project with A-list cast.',
    category: 'Entertainment',
    publishedDate: '2024-07-24T12:15:00Z',
    imageUrl: 'https://picsum.photos/seed/entertainment1/800/400',
    dataAiHint: 'film production',
    authorId: 'env_superadmin',
  },
  {
    id: '6',
    title: 'Revolutionary Electric Vehicle Technology Unveiled',
    content: 'A leading automotive manufacturer has unveiled breakthrough battery technology that promises to double the range of electric vehicles while reducing charging time by 70%. The new technology, developed over five years, uses advanced materials and innovative engineering to achieve these improvements. Industry experts believe this could accelerate the adoption of electric vehicles globally. Production is expected to begin within the next two years.',
    excerpt: 'New battery technology doubles electric vehicle range and reduces charging time by 70%.',
    category: 'Technology',
    publishedDate: '2024-07-23T09:30:00Z',
    imageUrl: 'https://picsum.photos/seed/tech2/800/400',
    dataAiHint: 'electric car',
    authorId: 'env_superadmin',
  },
  {
    id: '7',
    title: 'Olympic Athlete Breaks World Record',
    content: 'Olympic champion Maria Rodriguez shattered the world record in the 100-meter sprint during today\'s international athletics meet. Her time of 10.45 seconds beat the previous record by 0.12 seconds, marking one of the most significant improvements in track and field history. Rodriguez dedicated her achievement to her late coach and mentor. The record-breaking performance has sparked celebrations in her home country.',
    excerpt: 'Olympic champion Maria Rodriguez breaks world record in 100-meter sprint with historic time.',
    category: 'Sports',
    publishedDate: '2024-07-22T16:45:00Z',
    imageUrl: 'https://picsum.photos/seed/sports2/800/400',
    dataAiHint: 'athletics track',
    authorId: 'env_superadmin',
  },
  {
    id: '8',
    title: 'Major Tech Company Reports Record Profits',
    content: 'Technology giant TechCorp has reported record-breaking quarterly profits, exceeding analyst expectations by 25%. The company\'s success is attributed to strong performance in cloud services and artificial intelligence products. CEO Jennifer Chen announced plans to invest heavily in research and development, with a focus on sustainable technology solutions. The company also announced a new initiative to support startups in emerging markets.',
    excerpt: 'TechCorp reports record quarterly profits, exceeding expectations by 25% due to cloud and AI growth.',
    category: 'Business',
    publishedDate: '2024-07-21T14:20:00Z',
    imageUrl: 'https://picsum.photos/seed/business2/800/400',
    dataAiHint: 'corporate success',
    authorId: 'env_superadmin',
  },
];

export const availablePermissions: Permission[] = [
  'view_admin_dashboard',
  'manage_articles',
  'publish_articles',
  'manage_users',
  'manage_roles',
  'manage_layout_gadgets',
  'manage_seo_global',
  'manage_settings',
];

// Unified placement configurations for consistent sizing between articles and ads
export const UNIFIED_PLACEMENTS: PlacementConfig[] = [
  // Homepage Placements
  {
    placement: 'homepage-hero',
    category: 'homepage',
    description: 'Above the main hero section',
    size: 'full-width',
    responsive: {
      mobile: 'medium',
      tablet: 'large',
      desktop: 'full-width'
    }
  },
  {
    placement: 'homepage-top',
    category: 'homepage',
    description: 'At the very top of homepage',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'homepage-latest-posts',
    category: 'homepage',
    description: 'Between latest posts section',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'homepage-more-headlines',
    category: 'homepage',
    description: 'Between more headlines section',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'homepage-content-bottom',
    category: 'homepage',
    description: 'Below main content area',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'homepage-article-interstitial',
    category: 'homepage',
    description: 'Between article blocks',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'homepage-sidebar-top',
    category: 'homepage',
    description: 'Top of homepage sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'homepage-sidebar-middle',
    category: 'homepage',
    description: 'Middle of homepage sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'homepage-sidebar-bottom',
    category: 'homepage',
    description: 'Bottom of homepage sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'homepage-category-banner',
    category: 'homepage',
    description: 'Category-specific banner area',
    size: 'large',
    responsive: {
      mobile: 'medium',
      tablet: 'large',
      desktop: 'large'
    }
  },
  {
    placement: 'homepage-breaking-news',
    category: 'homepage',
    description: 'Breaking news ticker area',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },

  // Article Details Page Placements
  {
    placement: 'article-top',
    category: 'details',
    description: 'Above article content',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'article-bottom',
    category: 'details',
    description: 'Below article content',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'article-related',
    category: 'details',
    description: 'Between related articles',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'article-sidebar-left',
    category: 'details',
    description: 'Left sidebar of article',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'article-sidebar-right',
    category: 'details',
    description: 'Right sidebar of article',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'article-details-page',
    category: 'details',
    description: 'Main article content area',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'article-details-sidebar',
    category: 'details',
    description: 'Article details sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'article-inline',
    category: 'details',
    description: 'Inline within article text',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'article-comments-top',
    category: 'details',
    description: 'Above comments section',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'article-comments-bottom',
    category: 'details',
    description: 'Below comments section',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'article-social-share',
    category: 'details',
    description: 'Social sharing buttons area',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'article-author-bio',
    category: 'details',
    description: 'Author biography section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },

  // Category Page Placements
  {
    placement: 'category-header',
    category: 'category',
    description: 'Category page header area',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'category-top',
    category: 'category',
    description: 'Top of category listing',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'category-middle',
    category: 'category',
    description: 'Middle of category posts',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'category-bottom',
    category: 'category',
    description: 'Bottom of category listing',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'category-sidebar',
    category: 'category',
    description: 'Category page sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'category-pagination',
    category: 'category',
    description: 'Above pagination controls',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },

  // Search Results Placements
  {
    placement: 'search-results-top',
    category: 'search',
    description: 'Above search results',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'search-results-bottom',
    category: 'search',
    description: 'Below search results',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'search-results-sidebar',
    category: 'search',
    description: 'Search results sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'search-no-results',
    category: 'search',
    description: 'When no results found',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },

  // Header/Footer Placements
  {
    placement: 'header-logo-area',
    category: 'header',
    description: 'Logo area in header',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'below-header',
    category: 'header',
    description: 'Below header navigation',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'header-top-banner',
    category: 'header',
    description: 'Top banner above header',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'header-announcement',
    category: 'header',
    description: 'Announcement bar area',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'footer-top',
    category: 'footer',
    description: 'Top of footer area',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'footer-middle',
    category: 'footer',
    description: 'Middle of footer content',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'footer-bottom',
    category: 'footer',
    description: 'Bottom of footer',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'footer-newsletter',
    category: 'footer',
    description: 'Newsletter signup area',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },

  // Sidebar Placements
  {
    placement: 'sidebar-left',
    category: 'sidebar',
    description: 'Left sidebar general',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-right',
    category: 'sidebar',
    description: 'Right sidebar general',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-must-read',
    category: 'sidebar',
    description: 'Must-read section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-popular',
    category: 'sidebar',
    description: 'Popular posts section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-trending',
    category: 'sidebar',
    description: 'Trending topics section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-category-list',
    category: 'sidebar',
    description: 'Category listing section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-tag-cloud',
    category: 'sidebar',
    description: 'Tag cloud section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-about',
    category: 'sidebar',
    description: 'About section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'sidebar-contact',
    category: 'sidebar',
    description: 'Contact information',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },

  // Special Content Placements
  {
    placement: 'content-break',
    category: 'content',
    description: 'Content break points',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'content-interstitial',
    category: 'content',
    description: 'Between content blocks',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'content-highlight',
    category: 'content',
    description: 'Highlighted content area',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'content-summary',
    category: 'content',
    description: 'Content summary section',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },

  // Mobile-Specific Placements
  {
    placement: 'mobile-sticky-bottom',
    category: 'mobile',
    description: 'Sticky bottom on mobile',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'mobile-interstitial',
    category: 'mobile',
    description: 'Mobile interstitial ads',
    size: 'medium',
    responsive: {
      mobile: 'medium',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'mobile-notification',
    category: 'mobile',
    description: 'Mobile notification area',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },

  // Video/Media Placements
  {
    placement: 'video-player-top',
    category: 'media',
    description: 'Above video player',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'video-player-bottom',
    category: 'media',
    description: 'Below video player',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'video-player-sidebar',
    category: 'media',
    description: 'Video player sidebar',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'gallery-top',
    category: 'media',
    description: 'Above image gallery',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'gallery-bottom',
    category: 'media',
    description: 'Below image gallery',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'gallery-interstitial',
    category: 'media',
    description: 'Between gallery images',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },

  // Newsletter/Subscription Placements
  {
    placement: 'newsletter-signup',
    category: 'subscription',
    description: 'Newsletter signup form',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'subscription-popup',
    category: 'subscription',
    description: 'Subscription popup trigger',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  },
  {
    placement: 'subscription-banner',
    category: 'subscription',
    description: 'Subscription banner',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },

  // Error Page Placements
  {
    placement: 'error-404',
    category: 'error',
    description: '404 error page',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'error-500',
    category: 'error',
    description: '500 error page',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'error-maintenance',
    category: 'error',
    description: 'Maintenance page',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },

  // Loading/Transition Placements
  {
    placement: 'loading-screen',
    category: 'transition',
    description: 'Loading screen overlay',
    size: 'full-width',
    responsive: {
      mobile: 'full-width',
      tablet: 'full-width',
      desktop: 'full-width'
    }
  },
  {
    placement: 'page-transition',
    category: 'transition',
    description: 'Page transition area',
    size: 'medium',
    responsive: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'medium'
    }
  },
  {
    placement: 'skeleton-loading',
    category: 'transition',
    description: 'Skeleton loading area',
    size: 'small',
    responsive: {
      mobile: 'small',
      tablet: 'small',
      desktop: 'small'
    }
  }
];

// Helper function to get placement config by placement name
export const getPlacementConfig = (placement: UnifiedPlacement): PlacementConfig | undefined => {
  return UNIFIED_PLACEMENTS.find(config => config.placement === placement);
};

// Helper function to get placements by category
export const getPlacementsByCategory = (category: PlacementConfig['category']): PlacementConfig[] => {
  return UNIFIED_PLACEMENTS.filter(config => config.category === category);
};

// Helper function to get placements by size
export const getPlacementsBySize = (size: PlacementSize): PlacementConfig[] => {
  return UNIFIED_PLACEMENTS.filter(config => config.size === size);
};
