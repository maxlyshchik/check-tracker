import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Если пользователь не авторизован и пытается зайти на защищённые страницы
    const protectedPaths = ['/dashboard', '/settings'];
    const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (!session && isProtected) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Если авторизован, не пускаем на логин/регистрацию
    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/register'],
};