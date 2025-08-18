
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Gadget } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format layout section names for display
export function formatSectionName(section: string | undefined | null): string {
  // Extra safety checks: ensure 'section' is a non-empty string before calling replace
  if (typeof section !== 'string' || !section) {
    // console.warn("formatSectionName received invalid input:", section);
    return 'N/A'; // Return 'N/A' or similar for invalid/missing sections
  }
  try {
    // Replace hyphens with spaces and capitalize each word
    return section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch (error) {
      console.error("Error in formatSectionName with input:", section, error);
      return section; // Return original value on error
  }
}

// Helper to map MongoDB document to Gadget type
export function mapMongoDocumentToGadget(doc: any): Gadget {
  if (!doc) return null as any;
  return {
    id: doc._id.toHexString(),
    section: doc.section || doc.placement || 'homepage-top',
    title: doc.title || 'Untitled Ad',
    content: doc.content || doc.codeSnippet || '',
    isActive: doc.isActive ?? true,
    order: doc.order || 0,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    unifiedPlacement: doc.unifiedPlacement || doc.placement || 'homepage-hero',
    placementSize: doc.placementSize || 'medium',
    targetArticleId: doc.targetArticleId,
    targetCategory: doc.targetCategory,
    adType: doc.adType || 'html',
    autoInjectFrequency: doc.autoInjectFrequency,
    injectPosition: doc.injectPosition || 'between',
    targetPages: doc.targetPages || [],
    deviceTargeting: doc.deviceTargeting || 'all',
    timeTargeting: doc.timeTargeting,
    clickTracking: doc.clickTracking || false,
    impressionTracking: doc.impressionTracking || false,
    priority: doc.priority || 'medium',
  };
}
