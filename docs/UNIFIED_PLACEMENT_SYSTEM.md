# Unified Placement System for Articles and Ads

## Overview

The Unified Placement System provides a consistent way to position both articles and ads throughout your website, ensuring they have the same size and positioning for a professional, cohesive appearance.

## Key Features

- **Consistent Sizing**: Articles and ads in the same placement have identical dimensions
- **Unified Interface**: Same placement options for both content types
- **Responsive Design**: Automatic sizing adjustments for mobile, tablet, and desktop
- **Targeted Placement**: Place content in specific locations with precise control

## Placement Categories

### 1. Homepage Placements

| Placement | Size | Description | Use Case |
|-----------|------|-------------|----------|
| `homepage-hero` | Large | Main featured article/ad | Hero banners, featured content |
| `homepage-latest-posts` | Medium | Latest news grid | News listings, article grids |
| `homepage-more-headlines` | Small | More headlines section | Compact content, summaries |
| `homepage-sidebar-must-read` | Small | Sidebar must read | Sidebar content, highlights |

### 2. Article Page Placements

| Placement | Size | Description | Use Case |
|-----------|------|-------------|----------|
| `article-top` | Full Width | Top of article page | Header ads, announcements |
| `article-bottom` | Full Width | Bottom of article page | Footer ads, related content |
| `article-sidebar-left` | Medium | Left sidebar | Sidebar content, navigation |
| `article-sidebar-right` | Medium | Right sidebar | Related posts, ads |
| `article-inline` | Medium | Within article content | Inline ads, content breaks |
| `article-related` | Medium | Related posts section | Related content, recommendations |

### 3. Header/Footer Placements

| Placement | Size | Description | Use Case |
|-----------|------|-------------|----------|
| `header-logo-area` | Small | Header logo area | Logo, small announcements |
| `below-header` | Full Width | Below header | Navigation, banners |
| `footer` | Full Width | Footer area | Footer content, links |

### 4. Special Placements

| Placement | Size | Description | Use Case |
|-----------|------|-------------|----------|
| `homepage-article-interstitial` | Full Width | Between homepage sections | Section breaks, full-width ads |
| `homepage-content-bottom` | Full Width | Bottom of homepage content | Bottom banners, CTAs |
| `sidebar-left` | Medium | Left sidebar | Navigation, content |
| `sidebar-right` | Medium | Right sidebar | Ads, related content |

## Size Definitions

### Size Categories

- **Small**: Compact content, typically 200-300px width
- **Medium**: Standard content, typically 400-600px width  
- **Large**: Featured content, typically 600-800px width
- **Full Width**: Spans entire container width

### Responsive Behavior

Each placement automatically adjusts its size based on screen size:

```typescript
responsive: {
  mobile: 'small',      // Mobile devices
  tablet: 'medium',     // Tablet devices  
  desktop: 'large'      // Desktop devices
}
```

## How to Use

### 1. Adding Articles with Placement

When creating an article:

1. Go to **Admin → Articles → Add New Article**
2. Fill in basic article information
3. In the **Display Placements** section, select where you want the article to appear
4. Choose from the categorized placement options
5. Each placement shows its size and description
6. Save the article

### 2. Adding Ads with Placement

When creating an ad/gadget:

1. Go to **Admin → Gadgets → Add New Gadget**
2. Select the **Unified Placement** that matches your content
3. The **Placement Size** will auto-populate based on your selection
4. Optionally set **Target Article ID** or **Target Category** for specific targeting
5. Enter your ad content (HTML/JS)
6. Save the gadget

### 3. Placement Matching

To ensure consistent sizing:

- **Articles**: Use `homepage-hero` placement for featured content
- **Ads**: Use the same `homepage-hero` placement for hero ads
- **Result**: Both will have identical dimensions and positioning

## Benefits

### For Content Creators
- **Predictable Layout**: Know exactly where content will appear
- **Consistent Sizing**: No more mismatched content dimensions
- **Better Planning**: Plan content placement before creation

### For Advertisers  
- **Professional Appearance**: Ads blend seamlessly with content
- **Optimal Sizing**: Ads are sized for maximum impact
- **Targeted Placement**: Place ads in specific, relevant locations

### For Users
- **Better Experience**: Consistent, professional layout
- **Improved Readability**: Content flows naturally
- **Less Intrusive**: Ads don't disrupt content flow

## Technical Implementation

### Database Schema

Articles and gadgets now include:

```typescript
interface NewsArticle {
  displayPlacements?: UnifiedPlacement[];
  // ... other fields
}

interface Gadget {
  unifiedPlacement?: UnifiedPlacement;
  placementSize?: PlacementSize;
  targetArticleId?: string;
  targetCategory?: string;
  // ... other fields
}
```

### Frontend Rendering

The system automatically:

1. **Detects Placement**: Identifies where content should appear
2. **Applies Sizing**: Uses consistent CSS classes for dimensions
3. **Handles Responsiveness**: Adjusts for different screen sizes
4. **Manages Targeting**: Shows content only in specified locations

## Migration Guide

### Existing Articles
- Articles without placements will use default positioning
- Gradually update articles to use the new placement system
- No breaking changes to existing functionality

### Existing Ads
- Current ads continue to work with existing layout sections
- New ads can use the unified placement system
- Both systems can coexist during transition

## Best Practices

### Content Placement
1. **Hero Content**: Use `homepage-hero` for main featured articles
2. **Sidebar Content**: Use appropriate sidebar placements for navigation
3. **Related Content**: Use `article-related` for content recommendations
4. **Full-Width Content**: Use full-width placements for banners and announcements

### Ad Placement
1. **Match Content**: Place ads in the same placements as related content
2. **Consider User Experience**: Don't overload pages with too many ads
3. **Use Targeting**: Leverage article-specific and category-specific targeting
4. **Test Performance**: Monitor ad performance in different placements

### Responsive Design
1. **Mobile First**: Ensure content works well on small screens
2. **Progressive Enhancement**: Add features for larger screens
3. **Consistent Spacing**: Maintain consistent margins and padding across placements

## Troubleshooting

### Common Issues

**Content Not Appearing**
- Check if placement is correctly selected
- Verify content is active/published
- Check targeting settings for ads

**Sizing Mismatches**
- Ensure both content and ads use the same placement
- Check responsive settings
- Verify CSS classes are applied correctly

**Performance Issues**
- Limit the number of ads per page
- Use lazy loading for non-critical content
- Optimize ad content for faster loading

## Support

For technical support or questions about the Unified Placement System:

1. Check this documentation first
2. Review the admin interface for placement options
3. Contact the development team for advanced configuration
4. Check the system logs for error messages

## Future Enhancements

Planned improvements include:

- **A/B Testing**: Test different placements for optimal performance
- **Analytics Integration**: Track placement performance metrics
- **Dynamic Placement**: AI-powered placement recommendations
- **Advanced Targeting**: More sophisticated content targeting options
- **Performance Optimization**: Automatic placement optimization based on user behavior
