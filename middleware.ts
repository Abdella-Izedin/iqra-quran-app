import {NextRequest, NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  // For static export, middleware is not used
  // Language switching is handled client-side via localStorage
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
