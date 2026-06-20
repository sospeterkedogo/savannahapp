import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  if (!host.startsWith('staff.savannahbarandgrill.com')) {
    return NextResponse.next();
  }

  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/menudesigns') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (!url.pathname.startsWith('/staff')) {
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
    url.pathname = `/staff${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
