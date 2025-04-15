import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

// Секретный ключ (должен совпадать с ключом в admin-debug-access/route.ts)
const SECRET_KEY = 'polimed-debug-secret-key-2024';

/**
 * Генерирует временный токен доступа к административной панели
 * Эта функция должна быть идентична функции в admin-debug-access/route.ts
 */
function generateAdminToken() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(today);
  return hmac.digest('hex').substring(0, 16);
}

/**
 * Middleware, обрабатывающее все запросы к приложению
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Не проверяем доступ к API и публичным маршрутам
  if (pathname.startsWith('/api/') || 
      pathname === '/' || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/public/') ||
      !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Проверяем доступ к административной панели
  if (pathname.startsWith('/admin')) {
    // Получаем токен из запроса
    const debugToken = request.nextUrl.searchParams.get('debug_token');
    const validToken = generateAdminToken();
    
    // Если токен отсутствует или неверный, перенаправляем на главную страницу
    if (!debugToken || debugToken !== validToken) {
      // Проверяем, есть ли в кукис валидный токен
      const storedToken = request.cookies.get('admin_debug_token')?.value;
      
      if (storedToken !== validToken) {
        // Если токен отсутствует в URL и в кукис, редиректим на API для получения токена
        return NextResponse.redirect(new URL('/api/admin-debug-access', request.url));
      }
    } else {
      // Если токен валидный, сохраняем его в куки и перенаправляем на чистый URL
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set('admin_debug_token', validToken, { 
        httpOnly: true,
        maxAge: 86400, // 1 день
        path: '/',
      });
      
      return response;
    }
  }
  
  // Для всех остальных запросов - пропускаем
  return NextResponse.next();
}

/**
 * Настройка путей, для которых будет вызываться middleware
 */
export const config = {
  matcher: ['/admin/:path*']
}; 