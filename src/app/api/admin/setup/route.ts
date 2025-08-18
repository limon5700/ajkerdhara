import { NextRequest, NextResponse } from 'next/server';
import { createSuperAdmin } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create the super admin user
    const user = await createSuperAdmin(username, password);

    if (user) {
      return NextResponse.json({
        success: true,
        message: 'SuperAdmin user created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create SuperAdmin user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in admin setup:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'SuperAdmin user already exists in the database' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error during admin setup' },
      { status: 500 }
    );
  }
}
