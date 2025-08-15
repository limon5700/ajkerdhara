
import type { ReactNode } from 'react';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Home, Newspaper, Layout as LayoutIcon, BarChart3, LogOut, Users, ShieldCheck, Activity } from 'lucide-react';
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
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      {showAdminNav && (
        <aside className="sticky top-0 h-screen w-64 bg-background border-r flex flex-col p-4 z-30">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-primary mb-8 hover:opacity-80 transition-opacity" prefetch={false}>
            Clypio - Admin {session?.username ? `(${session.username})` : ''}
          </Link>
          <nav className="flex flex-col gap-2 flex-1">
            <Button variant="outline" size="sm" asChild className="justify-start">
              <Link href="/admin/overview" prefetch={false}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="justify-start">
              <Link href="/" prefetch={false}>
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            {(session?.isSuperAdmin || hasPermission('view_admin_dashboard', userPermissions)) && (
              <Button variant="default" size="sm" asChild className="justify-start">
                <Link href="/admin/dashboard" prefetch={false}>
                  <Newspaper className="h-4 w-4 mr-2" />
                  Manage Articles
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_layout_gadgets', userPermissions)) && (
              <Button variant="secondary" size="sm" asChild className="justify-start">
                <Link href="/admin/layout-editor" prefetch={false}>
                  <LayoutIcon className="h-4 w-4 mr-2" />
                  Layout Editor
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_users', userPermissions) || hasPermission('manage_roles', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/admin/users" prefetch={false}>
                  <Users className="h-4 w-4 mr-2" />
                  User & Role Mgmt
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_roles', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/admin/roles" prefetch={false}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Manage Roles
                </Link>
              </Button>
            )}
            {(session?.isSuperAdmin || hasPermission('manage_seo_global', userPermissions)) && (
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/admin/seo" prefetch={false}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  SEO Management
                </Link>
              </Button>
            )}
            {/* Add more links as needed */}
          </nav>
          <form action={logoutAction} className="mt-8">
            <Button type="submit" variant="destructive" size="sm" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </aside>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
        <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground mt-auto">
          © {new Date().getFullYear()} Clypio Admin Panel
        </footer>
      </div>
    </div>
  );
}
