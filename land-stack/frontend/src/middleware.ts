import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const restrictedOfficerRoutes = [
    '/officer/dashboard',
    '/officer/cases',
    '/registry',
    '/analytics',
    '/dashboard',
    '/cases'
  ];

  const isRestrictedRoute = restrictedOfficerRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isRestrictedRoute) {
    const officerToken = request.cookies.get('landstack_officer_token')?.value;

    if (!officerToken) {
      const loginUrl = new URL('/officer/login', request.url);
      loginUrl.searchParams.set('unauthorized', 'true');
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/officer/dashboard/:path*',
    '/officer/cases/:path*',
    '/registry/:path*',
    '/analytics/:path*',
    '/dashboard/:path*',
    '/cases/:path*'
  ]
};
