import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/profile'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Проверяем, является ли маршрут защищённым
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!isProtectedRoute && !isPublicRoute) {
        return NextResponse.next();
    }

    // Проверяем сессию через cookie
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;

    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicRoute && sessionToken && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
};
