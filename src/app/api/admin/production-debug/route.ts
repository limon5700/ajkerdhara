import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      ADMIN_USERNAME_SET: !!process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
      GEMINI_API_KEY_SET: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    };

    // Get request info
    const requestInfo = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
    };

    // Get server info
    const serverInfo = {
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
    };

    return NextResponse.json({
      success: true,
      environment: envInfo,
      request: requestInfo,
      server: serverInfo,
      message: 'Production debug information'
    });

  } catch (error) {
    console.error('Error in production debug:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
