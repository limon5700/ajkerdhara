"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Settings, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AlternatingPatternConfig {
  section: string;
  enabled: boolean;
  pattern: 'post-ad' | 'ad-post' | 'post-post-ad' | 'custom' | 'custom-advanced';
  maxItems: number;
  adFrequency: number; // After how many posts to show an ad
  customPattern?: string; // For custom patterns like "P,A,P,P,A,P"
  startWith?: 'post' | 'ad'; // For advanced custom patterns
  postsBeforeAd?: number; // For advanced custom patterns
}

interface AlternatingPatternManagerProps {
  onSave?: (configs: AlternatingPatternConfig[]) => void;
}

const DEFAULT_SECTIONS = [
  'homepage-latest-posts',
  'homepage-more-headlines', 
  'article-related',
  'sidebar-right',
  'article-sidebar',
  'article-details-page',
  'article-details-sidebar'
];

const PATTERN_OPTIONS = [
  { value: 'post-ad', label: 'Post → Ad → Post → Ad', description: 'Alternate between posts and ads' },
  { value: 'ad-post', label: 'Ad → Post → Ad → Post', description: 'Start with ad, then alternate' },
  { value: 'post-post-ad', label: 'Post → Post → Ad → Post → Post → Ad', description: 'Show 2 posts, then 1 ad' },
  { value: 'custom', label: 'Custom Pattern', description: 'Define your own pattern' },
  { value: 'custom-advanced', label: 'Advanced Custom', description: 'Control starting point and frequency' }
];

export default function AlternatingPatternManager({ onSave }: AlternatingPatternManagerProps) {
  const [configs, setConfigs] = useState<AlternatingPatternConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with default configurations
    const defaultConfigs = DEFAULT_SECTIONS.map(section => ({
      section,
      enabled: true,
      pattern: 'post-ad' as const,
      maxItems: 8,
      adFrequency: 1,
      customPattern: 'P,A,P,A,P,A,P,A',
      startWith: 'post' as const,
      postsBeforeAd: 1
    }));
    setConfigs(defaultConfigs);
  }, []);

  const handleConfigChange = (section: string, field: keyof AlternatingPatternConfig, value: any) => {
    setConfigs(prev => prev.map(config => 
      config.section === section 
        ? { ...config, [field]: value }
        : config
    ));
  };

  const handleCustomPatternChange = (section: string, pattern: string) => {
    // Validate custom pattern (P = Post, A = Ad)
    const validPattern = pattern.replace(/[^PA,]/g, '').toUpperCase();
    handleConfigChange(section, 'customPattern', validPattern);
  };

  const validateCustomPattern = (pattern: string): boolean => {
    const parts = pattern.split(',').filter(p => p.trim());
    return parts.every(part => ['P', 'A'].includes(part.trim()));
  };

  const getPatternDescription = (config: AlternatingPatternConfig): string => {
    if (config.pattern === 'custom' && config.customPattern) {
      const parts = config.customPattern.split(',').map(p => p.trim());
      return parts.map(part => part === 'P' ? 'Post' : 'Ad').join(' → ');
    }
    
    const option = PATTERN_OPTIONS.find(opt => opt.value === config.pattern);
    return option?.description || '';
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate all custom patterns
      const invalidConfigs = configs.filter(config => 
        config.pattern === 'custom' && !validateCustomPattern(config.customPattern || '')
      );

      if (invalidConfigs.length > 0) {
        toast({
          title: "Validation Error",
          description: "Some custom patterns are invalid. Please check and fix them.",
          variant: "destructive"
        });
        return;
      }

      // Save to localStorage for now (you can extend this to save to database)
      localStorage.setItem('alternatingPatternConfigs', JSON.stringify(configs));
      
      if (onSave) {
        onSave(configs);
      }

      toast({
        title: "Success",
        description: "Alternating pattern configurations saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configurations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultConfigs = DEFAULT_SECTIONS.map(section => ({
      section,
      enabled: true,
      pattern: 'post-ad' as const,
      maxItems: 8,
      adFrequency: 1,
      customPattern: 'P,A,P,A,P,A,P,A',
      startWith: 'post' as const,
      postsBeforeAd: 1
    }));
    setConfigs(defaultConfigs);
    toast({
      title: "Reset",
      description: "Configurations reset to defaults.",
    });
  };

  const loadSavedConfigs = () => {
    try {
      const saved = localStorage.getItem('alternatingPatternConfigs');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfigs(parsed);
        toast({
          title: "Loaded",
          description: "Saved configurations loaded successfully!",
        });
      }
    } catch (error) {
      console.error('Failed to load saved configs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alternating Pattern Manager</h2>
          <p className="text-gray-600 mt-1">
            Control how posts and ads alternate in different sections of your website
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSavedConfigs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Saved
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset Defaults
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/alternating-patterns/demo">
              <Eye className="h-4 w-4 mr-2" />
              View Demo
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {configs.map((config) => (
          <Card key={config.section} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  {config.section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => handleConfigChange(config.section, 'enabled', checked)}
                  />
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {config.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`pattern-${config.section}`}>Pattern Type</Label>
                      <Select
                        value={config.pattern}
                        onValueChange={(value: any) => handleConfigChange(config.section, 'pattern', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PATTERN_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">
                        {getPatternDescription(config)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`maxItems-${config.section}`} className="text-black">Maximum Items</Label>
                      <Input
                        id={`maxItems-${config.section}`}
                        type="number"
                        min="1"
                        max="20"
                        value={config.maxItems}
                        onChange={(e) => handleConfigChange(config.section, 'maxItems', parseInt(e.target.value))}
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="text-sm text-black mt-1">
                        Total number of items to display
                      </p>
                    </div>
                  </div>

                  {config.pattern === 'custom' && (
                    <div>
                      <Label htmlFor={`customPattern-${config.section}`} className="text-black">Custom Pattern</Label>
                      <Input
                        id={`customPattern-${config.section}`}
                        placeholder="P,A,P,A,P,A,P,A"
                        value={config.customPattern}
                        onChange={(e) => handleCustomPatternChange(config.section, e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="text-sm text-black mt-1">
                        Use P for Post, A for Ad. Separate with commas. Example: P,A,P,A
                      </p>
                      {config.customPattern && !validateCustomPattern(config.customPattern) && (
                        <p className="text-sm text-red-500 mt-1">
                          Invalid pattern. Use only P, A, and commas.
                        </p>
                      )}
                    </div>
                  )}

                  {config.pattern === 'custom-advanced' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`startWith-${config.section}`} className="text-black">Start With</Label>
                          <Select
                            value={config.startWith || 'post'}
                            onValueChange={(value: 'post' | 'ad') => handleConfigChange(config.section, 'startWith', value)}
                          >
                            <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="post">Post</SelectItem>
                              <SelectItem value="ad">Ad</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-black mt-1">
                            What to show first
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor={`postsBeforeAd-${config.section}`} className="text-black">Posts Before Ad</Label>
                          <Input
                            id={`postsBeforeAd-${config.section}`}
                            type="number"
                            min="1"
                            max="10"
                            value={config.postsBeforeAd || 1}
                            onChange={(e) => handleConfigChange(config.section, 'postsBeforeAd', parseInt(e.target.value))}
                            className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          <p className="text-sm text-black mt-1">
                            How many posts to show before each ad
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-sm text-blue-800 mb-2">Pattern Preview:</h4>
                        <div className="text-sm text-blue-700">
                          {(() => {
                            const startWith = config.startWith || 'post';
                            const postsBeforeAd = config.postsBeforeAd || 1;
                            let pattern = '';
                            
                            if (startWith === 'post') {
                              // Start with posts
                              for (let i = 0; i < Math.min(8, config.maxItems); i++) {
                                if (i % (postsBeforeAd + 1) === postsBeforeAd) {
                                  pattern += 'A';
                                } else {
                                  pattern += 'P';
                                }
                                if (i < Math.min(7, config.maxItems - 1)) pattern += ',';
                              }
                            } else {
                              // Start with ad
                              for (let i = 0; i < Math.min(8, config.maxItems); i++) {
                                if (i === 0 || i % (postsBeforeAd + 1) === postsBeforeAd) {
                                  pattern += 'A';
                                } else {
                                  pattern += 'P';
                                }
                                if (i < Math.min(7, config.maxItems - 1)) pattern += ',';
                              }
                            }
                            
                            return pattern;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {config.pattern === 'post-post-ad' && (
                    <div>
                      <Label htmlFor={`adFrequency-${config.section}`} className="text-black">Ad Frequency</Label>
                      <Input
                        id={`adFrequency-${config.section}`}
                        type="number"
                        min="1"
                        max="5"
                        value={config.adFrequency}
                        onChange={(e) => handleConfigChange(config.section, 'adFrequency', parseInt(e.target.value))}
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="text-sm text-black mt-1">
                        Show ad after every N posts
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Preview:</h4>
                    <div className="flex flex-wrap gap-2">
                                             {(() => {
                         const items: string[] = [];
                         if (config.pattern === 'custom' && config.customPattern) {
                           const parts = config.customPattern.split(',').map(p => p.trim());
                           for (let i = 0; i < Math.min(config.maxItems, parts.length); i++) {
                             items.push(parts[i] === 'P' ? '📰 Post' : '📢 Ad');
                           }
                         } else if (config.pattern === 'custom-advanced') {
                           const startWith = config.startWith || 'post';
                           const postsBeforeAd = config.postsBeforeAd || 1;
                           
                           for (let i = 0; i < config.maxItems; i++) {
                             if (startWith === 'post') {
                               // Start with posts
                               if (i % (postsBeforeAd + 1) === postsBeforeAd) {
                                 items.push('📢 Ad');
                               } else {
                                 items.push('📰 Post');
                               }
                             } else {
                               // Start with ad
                               if (i === 0 || i % (postsBeforeAd + 1) === postsBeforeAd) {
                                 items.push('📢 Ad');
                               } else {
                                 items.push('📰 Post');
                               }
                             }
                           }
                         } else if (config.pattern === 'post-post-ad') {
                           let postCount = 0;
                           for (let i = 0; i < config.maxItems; i++) {
                             if (postCount < config.adFrequency) {
                               items.push('📰 Post');
                               postCount++;
                             } else {
                               items.push('📢 Ad');
                               postCount = 0;
                             }
                           }
                         } else {
                           for (let i = 0; i < config.maxItems; i++) {
                             if (config.pattern === 'ad-post') {
                               items.push(i % 2 === 0 ? '📢 Ad' : '📰 Post');
                             } else {
                               items.push(i % 2 === 0 ? '📰 Post' : '📢 Ad');
                             }
                           }
                         }
                         return items;
                       })()}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
