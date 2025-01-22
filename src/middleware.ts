import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // HTTP'den HTTPS'e yönlendirme
  if (url.protocol === 'http:') {
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  // www'dan www olmayan versiyona yönlendirme
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace('www.', '')
    return NextResponse.redirect(url)
  }

  // Korumalı rotalar
  const protectedPaths = ['/dashboard', '/hastalar', '/islemler', '/uyeler']
  const path = request.nextUrl.pathname

  // Eğer korumalı bir sayfaya erişilmeye çalışılıyorsa
  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    // TODO: Gerçek oturum kontrolü yapılacak
    // Şimdilik basit bir kontrol yapıyoruz
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