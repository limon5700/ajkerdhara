"use client";

// Force dynamic rendering to avoid build-time data collection issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Target, 
  Zap, 
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  BarChart3,
  Settings,
  Megaphone
} from "lucide-react";
import type { Gadget } from "@/lib/types";
import GadgetForm from "@/components/admin/GadgetForm";
import { useRouter } from 'next/navigation';

export default function AdsManagementPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Gadget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'auto-inject' | 'high-priority'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAd, setEditingAd] = useState<Gadget | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads');
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAd = async (adData: any) => {
    try {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });
      
      if (response.ok) {
        await fetchAds();
      }
    } catch (error) {
      console.error('Error creating ad:', error);
    }
  };

  const handleUpdateAd = async (adData: any) => {
    try {
      const response = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAd?.id, ...adData }),
      });
      
      if (response.ok) {
        await fetchAds();
        setEditingAd(null);
      }
    } catch (error) {
      console.error('Error updating ad:', error);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    
    try {
      const response = await fetch(`/api/ads?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchAds();
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const handleToggleActive = async (ad: Gadget) => {
    try {
      const response = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      
      if (response.ok) {
        await fetchAds();
      }
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
  };

  const getFilteredAds = () => {
    switch (filter) {
      case 'active':
        return ads.filter(ad => ad.isActive);
      case 'inactive':
        return ads.filter(ad => !ad.isActive);
      case 'auto-inject':
        return ads.filter(ad => ad.autoInjectFrequency);
      case 'high-priority':
        return ads.filter(ad => ad.priority === 'high' || ad.priority === 'urgent');
      default:
        return ads;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-black border-gray-200';
      default: return 'bg-gray-100 text-black border-gray-200';
    }
  };

  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case 'html': return <Monitor className="h-4 w-4" />;
      case 'javascript': return <Zap className="h-4 w-4" />;
      case 'image-link': return <Target className="h-4 w-4" />;
      case 'banner': return <Megaphone className="h-4 w-4" />;
      case 'popup': return <Eye className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-20rem)] bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-black">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-white">
      <Card className="shadow-sm rounded-lg bg-white border-gray-200">
        <CardHeader>
          <div>
            <CardTitle className="text-3xl font-semibold text-black">Ads Management</CardTitle>
            <CardDescription className="text-black">Manage advertisements and promotional content across your website.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Total Ads</p>
                    <p className="text-2xl font-bold text-black">{ads.length}</p>
                  </div>
                  <Megaphone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Active Ads</p>
                    <p className="text-2xl font-bold text-green-600">
                      {ads.filter(ad => ad.isActive).length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Auto-Inject</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {ads.filter(ad => ad.autoInjectFrequency).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">High Priority</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {ads.filter(ad => ad.priority === 'high' || ad.priority === 'urgent').length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-black'}
              >
                All ({ads.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                className={filter === 'active' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-black'}
              >
                Active ({ads.filter(ad => ad.isActive).length})
              </Button>
              <Button
                variant={filter === 'auto-inject' ? 'default' : 'outline'}
                onClick={() => setFilter('auto-inject')}
                className={filter === 'auto-inject' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-black'}
              >
                Auto-Inject ({ads.filter(ad => ad.autoInjectFrequency).length})
              </Button>
              <Button
                variant={filter === 'high-priority' ? 'default' : 'outline'}
                onClick={() => setFilter('high-priority')}
                className={filter === 'high-priority' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-black'}
              >
                High Priority ({ads.filter(ad => ad.priority === 'high' || ad.priority === 'urgent').length})
              </Button>
            </div>
            
            <Button onClick={() => {
              router.push('/admin/layout-editor/add-edit-ad');
            }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Ad
            </Button>
          </div>

          {/* Ads List */}
          <div className="space-y-4">
            {getFilteredAds().map((ad) => (
              <Card key={ad.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        {getAdTypeIcon(ad.adType || 'html')}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-black mb-1">
                            {ad.title || 'Untitled Ad'}
                          </h3>
                          <p className="text-sm text-black mb-2">
                            {ad.unifiedPlacement} • {ad.placementSize} • {ad.section}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className={getPriorityColor(ad.priority || 'medium')}>
                              {ad.priority || 'medium'}
                            </Badge>
                            
                            {ad.autoInjectFrequency && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                                <Zap className="h-3 w-3 mr-1" />
                                Every {ad.autoInjectFrequency} posts
                              </Badge>
                            )}
                            
                            {ad.deviceTargeting && ad.deviceTargeting !== 'all' && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                {getDeviceIcon(ad.deviceTargeting)}
                                {ad.deviceTargeting}
                              </Badge>
                            )}
                            
                            {ad.clickTracking && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Click Tracking
                              </Badge>
                            )}
                            
                            {ad.impressionTracking && (
                              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                <Eye className="h-3 w-3 mr-1" />
                                Impression Tracking
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-black">
                            Created: {new Date(ad.createdAt || '').toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={() => handleToggleActive(ad)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set('edit', ad.id);
                          if (ad.section) {
                            params.set('section', ad.section);
                          }
                          router.push(`/admin/layout-editor/add-edit-ad?${params.toString()}`);
                        }}
                        className="border-gray-200 text-black hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getFilteredAds().length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Megaphone className="h-12 w-12 text-black mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">No ads found</h3>
                  <p className="text-black mb-4">
                    {filter === 'all' 
                      ? "You haven't created any advertisements yet."
                      : `No ads match the "${filter}" filter.`
                    }
                  </p>
                  <Button onClick={() => {
                    router.push('/admin/layout-editor/add-edit-ad');
                  }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ad
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ad Form Modal */}
          {/* This section is removed as per the edit hint to navigate to a new page */}
        </CardContent>
      </Card>
    </div>
  );
}
