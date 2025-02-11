import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Tek seferde hem protokol hem www kontrolü
  if (url.protocol === 'http:' || url.hostname.startsWith('www.')) {
    const newUrl = new URL(request.url)
    newUrl.protocol = 'https:'
    if (newUrl.hostname.startsWith('www.')) {
      newUrl.hostname = newUrl.hostname.replace('www.', '')
    }
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  // Korumalı rotalar
  const protectedPaths = ['/dashboard', '/hastalar', '/islemler', '/uyeler']
  const path = request.nextUrl.pathname

  // Login sayfasındayken auth kontrolü yapmayı atla
  if (path === '/login') {
    return NextResponse.next()
  }

  // Eğer korumalı bir sayfaya erişilmeye çalışılıyorsa
  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    const isAuthenticated = request.cookies.has('auth')

    if (!isAuthenticated) {
      // Giriş sayfasına yönlendir
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 