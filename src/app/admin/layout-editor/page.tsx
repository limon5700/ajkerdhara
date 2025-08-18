"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2, Loader2, LayoutPanelLeft, CornerDownRight, GripVertical, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Gadget, LayoutSection } from "@/lib/types";
import {
  getAllGadgets,
  deleteGadget,
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { formatSectionName } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Define the structure of the layout sections visible in the editor
const layoutStructure: { name: string; section: LayoutSection; description: string }[] = [
  { name: "Header Area", section: 'header-logo-area', description: "Gadgets below the site title/logo." },
  { name: "Below Header", section: 'below-header', description: "Full width area below the header." },
  { name: "Homepage Top", section: 'homepage-top', description: "Area above the main content on the homepage." },
  { name: "Homepage Article Interstitial", section: 'homepage-article-interstitial', description: "Ads displayed between articles on the homepage (e.g., after every 2 articles)." },
  { name: "Homepage Content Bottom", section: 'homepage-content-bottom', description: "Area below the main article list on the homepage (for 1-2 ads)." },
  { name: "Sidebar Left", section: 'sidebar-left', description: "Left sidebar/area on homepage and article pages." },
  { name: "Sidebar Right", section: 'sidebar-right', description: "Right sidebar/area on homepage and article pages." },
  { name: "Article Top", section: 'article-top', description: "Area above the content on article pages." },
  { name: "Article Bottom", section: 'article-bottom', description: "Area below the content on article pages." },
  { name: "Article Inline (Default)", section: 'article-inline', description: "Default ad shown for [AD_INLINE] if not set in article." },
  { name: "Footer", section: 'footer', description: "Site footer area." },
];

const validSections = new Set(layoutStructure.map(s => s.section));

export default function LayoutEditorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gadgetToDelete, setGadgetToDelete] = useState<Gadget | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'layout' | 'ads'>('layout');

  const fetchGadgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedGadgets = await getAllGadgets();
      setGadgets(Array.isArray(fetchedGadgets) ? fetchedGadgets : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch layout gadgets.", variant: "destructive" });
      setGadgets([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGadgets();
  }, [fetchGadgets]);

  const handleAddGadget = (section: LayoutSection) => {
    router.push(`/admin/layout-editor/add-edit-ad?section=${section}`);
  };

  const handleEditGadget = (gadget: Gadget) => {
    const params = new URLSearchParams();
    params.set('edit', gadget.id);
    if (gadget.section) {
      params.set('section', gadget.section);
    }
    router.push(`/admin/layout-editor/add-edit-ad?${params.toString()}`);
  };

  const handleDeleteGadget = (gadget: Gadget) => {
    setGadgetToDelete(gadget);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGadget = async () => {
    if (!gadgetToDelete) return;
    setIsSubmitting(true);
    try {
      const success = await deleteGadget(gadgetToDelete.id);
      if (success) {
        await fetchGadgets();
        toast({ title: "Success", description: "Gadget deleted successfully." });
      } else {
        toast({ title: "Error", description: "Failed to delete gadget.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while deleting the gadget.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setGadgetToDelete(null);
    }
  };

  // Group gadgets by section, safely handling invalid/missing sections
  const gadgetsBySection = gadgets.reduce((acc, gadget) => {
    if (!gadget.section || !validSections.has(gadget.section)) {
      console.warn(`Gadget ${gadget.id} has invalid or missing section: "${gadget.section}". Skipping.`);
      return acc; 
    }
    const section = gadget.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(gadget);
    acc[section].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return acc;
  }, {} as Record<LayoutSection, Gadget[]>);

  // Get placement size badge with color coding
  const getPlacementSizeBadge = (size: string) => {
    const sizeColors = {
      'small': 'bg-gray-100 text-black',
      'medium': 'bg-blue-100 text-blue-700',
      'large': 'bg-green-100 text-green-700',
      'full-width': 'bg-purple-100 text-purple-700'
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${sizeColors[size as keyof typeof sizeColors] || 'bg-gray-100 text-black'}`}>
        {size}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-20rem)] bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-black">Loading layout gadgets...</p>
        </div>
      </div>
    );
  }

  const errorExplanation = (
     <Card className="mb-6 border-yellow-400 bg-yellow-50">
        <CardHeader>
            <CardTitle className="text-lg text-yellow-800">Note on Console Errors</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 space-y-2">
            <p>
                You might see errors in your browser's developer console mentioning:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li><code>GET /admin/advertisements 404 (Not Found)</code>: This specific path is not used for gadget management. Gadget management is handled here on the "Layout Editor" page (<code>/admin/layout-editor</code>). This error can be safely ignored.</li>
                 <li><code>CORS policy</code> errors related to domains like <code>extensions.aitopia.ai</code>: These errors are likely caused by a browser extension you have installed (e.g., Aitopia) and are not related to this application's code. They can usually be ignored or resolved by managing your browser extensions.</li>
                <li><code>TypeError: Cannot read properties of undefined (reading 'replace')</code> in relation to <code>formatSectionName</code>: This issue typically occurs if a gadget in the database has an invalid or missing 'section' field. The application now includes more robust checks for this. If it persists, it might indicate corrupted gadget data.</li>
            </ul>
        </CardContent>
     </Card>
  );

  // Ads List View
  if (viewMode === 'ads') {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-lg rounded-xl mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                  <Megaphone className="h-6 w-6" /> Ads Management
                </CardTitle>
                <CardDescription className="text-black">Manage all your ads and gadgets in one place with edit and delete options.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('layout')}
                  className="gap-2"
                >
                  <LayoutPanelLeft className="h-4 w-4" />
                  Back to Layout
                </Button>
                <Button 
                  onClick={() => {
                    router.push('/admin/layout-editor/add-edit-ad');
                  }}
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New Ad
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ads List */}
        <div className="space-y-4">
          {gadgets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 text-black mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-black">No Ads Found</h3>
                <p className="text-black mb-4">Start by adding your first ad to display on your website.</p>
                <Button 
                  onClick={() => {
                    router.push('/admin/layout-editor/add-edit-ad');
                  }}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            gadgets.map((gadget) => (
              <Card key={gadget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {gadget.title || `Ad #${gadget.id.substring(0, 6)}`}
                        </h3>
                        <Badge variant={gadget.isActive ? "default" : "outline"}>
                          {gadget.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {gadget.unifiedPlacement && (
                          <Badge variant="secondary">
                            {gadget.unifiedPlacement.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </Badge>
                        )}
                        {gadget.placementSize && getPlacementSizeBadge(gadget.placementSize)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-black">
                        <div>
                          <span className="font-medium">Section:</span> {formatSectionName(gadget.section)}
                        </div>
                        <div>
                          <span className="font-medium">Order:</span> {gadget.order ?? 0}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {gadget.createdAt ? new Date(gadget.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      {gadget.targetArticleId && (
                        <div className="text-sm">
                          <span className="font-medium">Target Article:</span> {gadget.targetArticleId}
                        </div>
                      )}

                      {gadget.targetCategory && (
                        <div className="text-sm">
                          <span className="font-medium">Target Category:</span> {gadget.targetCategory}
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="font-medium">Content Preview:</span>
                        <div className="mt-1 p-2 bg-muted rounded text-xs font-mono max-w-full overflow-x-auto">
                          {gadget.content.length > 100 
                            ? `${gadget.content.substring(0, 100)}...` 
                            : gadget.content
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditGadget(gadget)}
                        className="border-gray-200 text-black hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteGadget(gadget)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) { setIsDeleteDialogOpen(false); setGadgetToDelete(null); }
            else { setIsDeleteDialogOpen(true); }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the ad titled &quot;{gadgetToDelete?.title || `Ad #${gadgetToDelete?.id.substring(0,6)}`}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setGadgetToDelete(null); }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteGadget} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Ad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Layout Editor View (Original)
  return (
    <div className="container mx-auto py-8 bg-white">
      {errorExplanation}

      <Card className="shadow-sm rounded-lg bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold text-black flex items-center gap-2">
                <LayoutPanelLeft className="text-blue-600" /> Layout Editor
              </CardTitle>
              <CardDescription className="text-black">Manage layout gadgets and content placement.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setViewMode('ads')}
                className="border-gray-200 text-black hover:bg-gray-50"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Ads Management
              </Button>
              <Button onClick={() => {
                router.push('/admin/layout-editor/add-edit-ad');
              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Gadget
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      

      <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) { setIsDeleteDialogOpen(false); setGadgetToDelete(null); }
          else { setIsDeleteDialogOpen(true); }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the gadget titled &quot;{gadgetToDelete?.title || `Gadget #${gadgetToDelete?.id.substring(0,6)}`}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setGadgetToDelete(null); }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteGadget} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Gadget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

