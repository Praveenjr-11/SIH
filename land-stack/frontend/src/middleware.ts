import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const officerToken = request.cookies.get('landstack_officer_token')?.value;

  const response = NextResponse.next();

  // If no officer token cookie is present, set default demo token (District Collector Thiru K. Muthusamy, IAS)
  // so the officer dashboard and officer routes load immediately without redirection loops
  if (!officerToken) {
    response.cookies.set('landstack_officer_token', 'DEMO_OFFICER_TOKEN_DISTRICT_COLLECTOR', {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
    });
  }

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
