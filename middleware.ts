import { NextRequest, NextResponse } from 'next/server';

// DISABLED FOR NOW - Fix login issues
// Uncomment to re-enable admin authentication
/*
// This middleware will ONLY run on admin routes
export function middleware(request: NextRequest) {
  // Double-check this is an admin route
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  // Check if the authorization header exists and is valid
  if (!authHeader || !isValidAuthHeader(authHeader)) {
    // Return a response requesting authentication
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Warning System Admin"'
      }
    });
  }
  
  // If authentication is valid, continue with the request
  return NextResponse.next();
}

// Helper function to validate the auth header
function isValidAuthHeader(authHeader: string): boolean {
  // The auth header should start with 'Basic '
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Get the base64 encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  
  // Decode the credentials
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  
  // Split the username and password
  const [username, password] = credentials.split(':');
  
  // You should store these securely in environment variables
  // For demo purposes, we'll use a simple hardcoded comparison
  // In production, use environment variables and a more secure method
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'password';
  
  return username === validUsername && password === validPassword;
}

// Configure which paths this middleware will run on
// This is VERY important - it must be exact
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
*/

// Middleware function to protect admin routes
export function middleware(request: NextRequest) {
  // Get the full URL to examine
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // ONLY proceed with auth if the path is exactly /admin or starts with /admin/
  // This is a very strict check to ensure we don't affect other routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    console.log("Admin route detected, applying authentication:", pathname);
    
    // Check both standard and NEXT_PUBLIC prefixed environment variables
    const username = process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    console.log("Auth configured:", !!username && !!password);
    
    // For development convenience, allow default credentials if none are configured
    if (!username || !password) {
      console.warn("No admin credentials found in environment variables, using default ones");
      // For development only - use hardcoded credentials
      if (process.env.NODE_ENV === 'development') {
        // Return the actual page during development without auth for simplicity
        return NextResponse.next();
      } else {
        return new NextResponse('Authentication not configured', { status: 403 });
      }
    }
    
    // Check for auth header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      // Verify credentials using Buffer.from instead of atob for better compatibility
      try {
        const authValue = authHeader.split(' ')[1];
        const decodedAuth = Buffer.from(authValue, 'base64').toString('utf-8');
        const [authUser, authPass] = decodedAuth.split(':');
        
        if (authUser === username && authPass === password) {
          // Authorized, continue to admin page
          return NextResponse.next();
        }
      } catch (error) {
        console.error("Error parsing auth header:", error);
      }
    }
    
    // Not authorized, request authentication
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Warning System Admin"',
      },
    });
  }
  
  // For any other route, immediately pass through without auth
  console.log("Non-admin route, skipping authentication:", pathname);
  return NextResponse.next();
}

// CRITICAL: Configure middleware to ONLY run on these exact paths
export const config = {
  matcher: [
    // Match ONLY these specific admin paths and nothing else
    '/admin',
    '/admin/:path*',
  ],
}; 