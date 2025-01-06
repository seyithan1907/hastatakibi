import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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