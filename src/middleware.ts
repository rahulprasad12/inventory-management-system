import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'inventory-pro-secret-key-change-in-production-2024'
);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];
const API_PUBLIC_ROUTES = ['/api/auth/login'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname) || API_PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
        return NextResponse.next();
    }

    // Check for session cookie
    const token = request.cookies.get('auth_session')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Skip DB permission check for specific routes
        if (!pathname.startsWith('/api/') && pathname !== '/' && pathname !== '/unauthorized') {
            try {
                const origin = request.nextUrl.origin;
                // Add query params to check access
                const checkUrl = `${origin}/api/roles/check?role=${payload.role}&path=${encodeURIComponent(pathname)}`;
                const res = await fetch(checkUrl);

                if (res.ok) {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const { allowed } = await res.json();
                        if (!allowed) {
                            return NextResponse.redirect(new URL('/unauthorized', request.url));
                        }
                    } else {
                        console.error('Role check API returned non-JSON response');
                        // Safe fallback on unexpected response
                        return NextResponse.redirect(new URL('/unauthorized', request.url));
                    }
                } else {
                    console.error('Role check API failed with status:', res.status);
                    // Deny access if authority check fails
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
            } catch (err) {
                // If API fails, default to allowing or maybe let the route handle it
                console.error('Role check failed', err);
            }
        }

        // Pass pathname as header so root layout can detect login page
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    } catch {
        // Token is invalid or expired
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_session');
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
