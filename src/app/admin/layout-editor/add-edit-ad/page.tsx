"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Save, Loader2 } from 'lucide-react';
import GadgetForm from '@/components/admin/GadgetForm';
import type { Gadget, LayoutSection } from '@/lib/types';

export default function AddEditAdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get parameters from URL
  const editId = searchParams.get('edit');
  const section = searchParams.get('section') as LayoutSection | null;
  
  const [editingGadget, setEditingGadget] = useState<Gadget | null>(null);
  const [availableSections, setAvailableSections] = useState<LayoutSection[]>([]);

  useEffect(() => {
    // Fetch available sections
    setAvailableSections(['homepage-top', 'homepage-latest-posts', 'homepage-more-headlines', 'sidebar-right', 'homepage-content-bottom', 'homepage-article-interstitial', 'sidebar-left', 'article-top', 'article-bottom', 'article-related', 'article-details-page', 'article-details-sidebar', 'article-inline', 'below-header']);

    // If editing, fetch the gadget data
    if (editId) {
      fetchGadgetData(editId);
    }
  }, [editId]);

  const fetchGadgetData = async (id: string) => {
    try {
      const response = await fetch(`/api/gadgets/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEditingGadget(data);
      } else {
        setError('Failed to fetch gadget data');
      }
    } catch (error) {
      setError('Error fetching gadget data');
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editId ? `/api/gadgets/${editId}` : '/api/gadgets';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Redirect back to layout editor
        router.push('/admin/layout-editor');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save gadget');
      }
    } catch (error) {
      setError('Error saving gadget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/layout-editor');
  };

  return (
    <div className="container mx-auto py-8 bg-white">
      <Card className="shadow-sm rounded-lg bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-200 text-black hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Layout Editor
              </Button>
              <div>
                <CardTitle className="text-2xl font-semibold text-black flex items-center gap-2">
                  <PlusCircle className="text-blue-600" />
                  {editingGadget ? 'Edit Advertisement' : 'Add New Advertisement'}
                </CardTitle>
                <CardDescription className="text-black">
                  {editingGadget
                    ? "Modify the ad's content, placement, or settings."
                    : "Add a new ad with unified placement system for consistent sizing."
                  }
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <GadgetForm
          gadget={editingGadget ?? (section ? { section, isActive: true } as Gadget : null)}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          availableSections={availableSections}
        />
      </div>
    </div>
  );
}
