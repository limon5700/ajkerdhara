
import type { ReactNode } from 'react';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Home, Newspaper, Layout as LayoutIcon, BarChart3, LogOut, Users, ShieldCheck, Activity, Settings } from 'lucide-react';
import { logoutAction, getSession } from '@/app/admin/auth/actions';
import type { UserSession, Permission } from '@/lib/types';
import { availablePermissions } from '@/lib/constants'; // Ensure this is available if used for SuperAdmin

// Helper function to check permissions
function hasPermission(requiredPermission: Permission, userPermissions: Permission[] = []): boolean {
  return userPermissions.includes(requiredPermission);
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session: UserSession | null = null;
  try {
    session = await getSession();
  } catch (error) {}

  let actualPathname = '';
  let headersAvailable = false;
  try {
    const headersList = await nextHeaders();
    const xInvokePath = headersList.get('x-invoke-path');
    const nextUrlPath = headersList.get('next-url');
    if (xInvokePath && xInvokePath !== 'null' && xInvokePath.trim() !== '') {
      actualPathname = xInvokePath.trim();
      headersAvailable = true;
    } else if (nextUrlPath && nextUrlPath !== 'null' && nextUrlPath.trim() !== '') {
      try {
        const base = nextUrlPath.startsWith('/') ? 'http://localhost' : undefined;
        const url = new URL(nextUrlPath, base);
        actualPathname = url.pathname.trim();
        headersAvailable = true;
      } catch (e) {}
    }
  } catch (error: any) {}

  const showAdminNav = session?.isAuthenticated && actualPathname !== '/admin/login';
  const userPermissions = session?.isSuperAdmin ? availablePermissions : (session?.permissions || []);

  return (
    <div className="flex min-h-screen bg-white admin-page" data-admin="true">
      {/* Sidebar */}
      {showAdminNav && (
        <aside className="sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col p-6 z-30 shadow-sm">
          <Link href="/admin/dashboard" className="text-xl font-semibold text-black mb-8 hover:text-blue-600 transition-colors" prefetch={false}>
            Clypio Admin
          </Link>
          <nav className="flex flex-col gap-1 flex-1">
            <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
              <Link href="/admin/overview" prefetch={false}>
                <BarChart3 className="h-4 w-4 mr-3" />
                Overview
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
              <Link href="/" prefetch={false}>
                <Home className="h-4 w-4 mr-3" />
                View Site
              </Link>
            </Button>
            {(session?.isSuperAdmin || hasPermission('view_admin_dashboard', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/dashboard" prefetch={false}>
                  <Newspaper className="h-4 w-4 mr-3" />
                  Manage Articles
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_layout_gadgets', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/layout-editor" prefetch={false}>
                  <LayoutIcon className="h-4 w-4 mr-3" />
                  Layout Editor
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_users', userPermissions) || hasPermission('manage_roles', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/users" prefetch={false}>
                  <Users className="h-4 w-4 mr-3" />
                  User & Role Mgmt
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_roles', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/roles" prefetch={false}>
                  <ShieldCheck className="h-4 w-4 mr-3" />
                  Manage Roles
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_seo_global', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/seo" prefetch={false}>
                  <BarChart3 className="h-4 w-4 mr-3" />
                  SEO Management
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_layout_gadgets', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/alternating-patterns" prefetch={false}>
                  <Settings className="h-4 w-4 mr-3" />
                  Post-Ad Patterns
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_layout_gadgets', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start h-10 text-black hover:text-blue-600 hover:bg-blue-50">
                <Link href="/admin/ads-management" prefetch={false}>
                  <Activity className="h-4 w-4 mr-3" />
                  Ads Management
                </Link>
              </Button>
            )}
            {/* Add more links as needed */}
          </nav>
          <form action={logoutAction} className="mt-6">
            <Button type="submit" variant="outline" size="sm" className="w-full h-10 text-black border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </aside>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <main className="flex-1 p-6 sm:px-8 sm:py-6 md:gap-8 bg-white min-h-full">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-black mt-auto">
          © {new Date().getFullYear()} Clypio Admin Panel
        </footer>
      </div>
    </div>
  );
}
