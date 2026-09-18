import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const officerToken = request.cookies.get('landstack_officer_token')?.value;

  const response = NextResponse.next();

  // We no longer automatically inject a fake token.
  // The client-side OfficerProtectedGuard component handles redirecting unauthenticated users to the login page.

  return response;
}

export const config = {
  matcher: [
    '/',
    '/officer/:path*',
    '/registry/:path*',
    '/analytics/:path*',
    '/dashboard/:path*',
    '/cases/:path*',
    '/gis/:path*',
    '/map/:path*'
  ]
};
