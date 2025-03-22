import { NextRequest, NextResponse } from 'next/server';

// This function will be called on all requests
export function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
  }
  
  // If no admin page or authentication is valid, continue with the request
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
export const config = {
  matcher: ['/admin/:path*'],
}; 