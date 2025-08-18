
"use client";

// Force dynamic rendering to avoid build-time data collection issues
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2, Loader2, BarChartBig, FileText, Zap, Users, CalendarClock, Eye, AlertTriangle, Activity } from "lucide-react";
import { formatInTimeZone } from 'date-fns-tz';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { NewsArticle, DashboardAnalytics, UserActivity } from "@/lib/types";
import {
  getAllNewsArticles,
  deleteNewsArticle,
  getDashboardAnalytics,
  addActivityLogEntry,
  // getTopUserPostActivity, // This needs to be created if desired
} from "@/lib/data"; 
import { useToast } from "@/hooks/use-toast";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getSession } from "@/app/admin/auth/actions";
import Link from "next/link";

const DHAKA_TIMEZONE = 'Asia/Dhaka';

export default function DashboardPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [topUsersActivity, setTopUsersActivity] = useState<UserActivity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);

  const { toast } = useToast();

  const ErrorExplanationCard = () => (
     <Card className="mb-6 border-gray-200 bg-white shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg text-black font-medium">Important: Resolving Dashboard Access Issues</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-black space-y-2">
            {pageError && (
              <p className="font-semibold border-b pb-2 mb-2">Specific Error: {pageError}</p>
            )}
            <p>
                If the dashboard is blank or not loading correctly, please check the following:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Environment Variables:</strong> Ensure <code>MONGODB_URI</code>, <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code>, and <code>GEMINI_API_KEY</code> (if AI features used) are correctly set. For local development, ensure they are correct in your <code>.env</code> file. For Vercel, set them in project settings.</li>
                <li><strong>Database Connectivity:</strong> Verify your MongoDB Atlas IP allowlist. Check if your MongoDB cluster is running.</li>
                <li><strong>API Keys:</strong> Confirm your <code>GEMINI_API_KEY</code> is valid.</li>
                <li><strong>Server Logs:</strong> Check Vercel deployment logs or local terminal for detailed error messages.</li>
            </ul>
             <p>
                If issues persist, the server logs are crucial for diagnosing the problem.
            </p>
        </CardContent>
     </Card>
  );

  const fetchDashboardData = useCallback(async () => {
    console.log("DashboardPage: Attempting to fetch dashboard analytics...");
    setIsAnalyticsLoading(true);
    setPageError(null);
    try {
      // const topUsersData = await getTopUserPostActivity(); // Uncomment when function is ready
      const analyticsData = await getDashboardAnalytics();
      
      setAnalytics(analyticsData ?? { totalArticles: 0, articlesToday: 0, totalUsers:0, activeGadgets: 0, visitorStats: { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, activeNow: 0 } });
      // setTopUsersActivity(Array.isArray(topUsersData) ? topUsersData : []); // Uncomment when function is ready
      setTopUsersActivity([]); // Placeholder
      console.log("DashboardPage: Analytics data fetched successfully.");

    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("DashboardPage: Failed to fetch dashboard analytics:", error);
      toast({ title: "Error", description: `Failed to fetch dashboard analytics: ${msg}`, variant: "destructive" });
      setPageError(msg);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [toast]);

  const fetchArticles = useCallback(async () => {
    console.log("DashboardPage: Attempting to fetch articles...");
    setIsLoading(true);
    setPageError(null);
    try {
      const articlesData = await getAllNewsArticles();
      setArticles(articlesData);
      console.log("DashboardPage: Articles fetched successfully.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("DashboardPage: Failed to fetch articles:", error);
      toast({ title: "Error", description: `Failed to fetch articles: ${msg}`, variant: "destructive" });
      setPageError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    fetchArticles();
  }, [fetchDashboardData, fetchArticles]);

  const handleDeleteArticle = (article: NewsArticle) => {
    setArticleToDelete(article);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteNewsArticle(articleToDelete.id);
      
      // Log the activity
      await addActivityLogEntry({ 
        userId: 'admin', // You might want to get this from session
        username: 'Admin User', 
        action: 'article_deleted', 
        targetType: 'article', 
        targetId: articleToDelete.id,
        details: { deletedTitle: articleToDelete.title }
      });

      setArticles(prev => prev.filter(article => article.id !== articleToDelete.id));
      toast({ title: "Success", description: "Article deleted successfully." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: "Error", description: `Failed to delete article: ${msg}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const DashboardContent = () => {
    if (pageError || isLoading || isAnalyticsLoading) {
      return (
        <div className="container mx-auto py-8 bg-white">
          {pageError && <ErrorExplanationCard />}
          {(isLoading || isAnalyticsLoading) && !pageError && (
            <div className="flex items-center justify-center min-h-[calc(100vh-20rem)] bg-white">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-lg text-black">Loading dashboard data...</p>
              </div>
            </div>
          )}
           {pageError && !isLoading && !isAnalyticsLoading && (
             <p className="text-center text-red-600 mt-8">
               Dashboard could not be fully loaded due to the error mentioned above.
             </p>
           )}
        </div>
      );
    }
    return (
      <div className="container mx-auto py-8 bg-white">
        {/* Site Overview section removed and will be moved to a new Overview page */}
        <Card className="shadow-sm rounded-lg border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-semibold text-black">Manage News Articles</CardTitle>
              <CardDescription className="text-black mt-1">Add, edit, or delete news articles.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/admin/articles/add">
                <PlusCircle className="h-4 w-4" />
                Add New Article
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {articles.length === 0 && !isLoading ? ( 
              <p className="text-center text-black py-10">No articles found. Add one to get started!</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[40%] text-black font-medium">Title</TableHead>
                    <TableHead className="text-black font-medium">Category</TableHead>
                    <TableHead className="text-black font-medium">Published Date</TableHead>
                    <TableHead className="text-right w-[150px] text-black font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium text-black">{article.title}</TableCell>
                      <TableCell className="text-black">{article.category}</TableCell>
                      <TableCell className="text-black">{article.publishedDate ? formatInTimeZone(new Date(article.publishedDate), DHAKA_TIMEZONE, "MMM d, yyyy, h:mm a zzz") : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild className="mr-2 hover:text-blue-600 hover:bg-blue-50">
                          <Link href={`/admin/articles/edit/${article.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article)} className="hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ErrorBoundary 
      fallback={
        <div className="container mx-auto p-4 py-8 text-center bg-white">
          <Card className="w-full max-w-md mx-auto shadow-sm border-gray-200 bg-white">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-xl text-red-800 flex items-center justify-center font-medium">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Dashboard Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-black">
                The dashboard encountered an error and could not be loaded. Please try reloading the page.
                If the problem persists, check the browser console for more details or contact support.
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.reload()}>Reload Page</Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <DashboardContent />
    </ErrorBoundary>
  );
}
