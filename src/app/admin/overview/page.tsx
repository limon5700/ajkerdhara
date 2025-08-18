"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChartBig, FileText, Zap, Users, CalendarClock, Eye, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import { getDashboardAnalytics } from "@/lib/data";
import type { DashboardAnalytics } from "@/lib/types";

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const analyticsData = await getDashboardAnalytics();
      setAnalytics(analyticsData ?? { totalArticles: 0, articlesToday: 0, totalUsers:0, activeGadgets: 0, visitorStats: { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, activeNow: 0 } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      setAnalytics({ totalArticles: 0, articlesToday: 0, totalUsers: 0, activeGadgets: 0, visitorStats: { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, activeNow: 0 } });
      setPageError(`Analytics fetch failed: ${msg}. Check server logs for details.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-20rem)] bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-black">Loading overview data...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="container mx-auto py-8 bg-white">
        <Card className="mb-6 border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-red-800 font-medium">Error Loading Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700 space-y-2">
            <p>{pageError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-white">
      <Card className="shadow-sm rounded-lg mb-8 border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-black flex items-center gap-2">
            <BarChartBig className="text-blue-600" /> Site Overview
          </CardTitle>
          <CardDescription className="text-black">A quick look at your site's key metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard title="Total Articles" value={analytics.totalArticles.toString()} icon={FileText} />
              <AnalyticsCard title="Articles Today" value={analytics.articlesToday.toString()} icon={CalendarClock} />
              <AnalyticsCard title="Total Users" value={analytics.totalUsers.toString()} icon={Users} />
              <AnalyticsCard title="Active Gadgets" value={analytics.activeGadgets.toString()} icon={Zap} />
              <AnalyticsCard title="Visitors Today" value={analytics.visitorStats?.today?.toString() ?? "N/A"} icon={Eye} description="Requires tracking setup" />
              <AnalyticsCard title="Active Visitors Now" value={analytics.visitorStats?.activeNow?.toString() ?? "N/A"} icon={Activity} description="Requires tracking setup" />
              <AnalyticsCard title="Visitors This Week" value={analytics.visitorStats?.thisWeek?.toString() ?? "N/A"} icon={Eye} description="Requires tracking setup" />
              <AnalyticsCard title="Visitors This Month" value={analytics.visitorStats?.thisMonth?.toString() ?? "N/A"} icon={Eye} description="Requires tracking setup" />
            </div>
          ) : (
            <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 