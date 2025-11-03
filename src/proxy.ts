// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se está acessando a raiz "/"
  if (pathname === '/') {
    // Verificar se já visitou hoje via cookie
    const lastVisit = request.cookies.get('lastOverviewVisit')?.value;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Se não visitou hoje, redirecionar para overview
    if (lastVisit !== today) {
      const response = NextResponse.redirect(new URL('/overview', request.url));

      // Atualizar cookie com a data de hoje
      response.cookies.set('lastOverviewVisit', today, {
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });

      return response;
    }
  }

  return NextResponse.next();
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
};
