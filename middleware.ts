import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Перенаправляем запросы с /app/api на /api
  if (request.nextUrl.pathname.startsWith('/app/api/')) {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = newUrl.pathname.replace('/app/api/', '/api/')
    return NextResponse.rewrite(newUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/app/api/:path*'],
} 