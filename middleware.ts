import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các route cần bảo vệ
const protectedRoutes = ["/portfolio", "/profile", "/token", "/notifications", "/wallet-tracker", "/multi-chart"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Lấy token từ cookie
    const token = request.cookies.get("auth_token")?.value;
    const isAuthenticated = !!token;

    // Kiểm tra nếu là protected route và chưa login
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
        const url = new URL("/authentication", request.url);
        url.searchParams.set("redirect", pathname); // Lưu URL để redirect sau khi login
        return NextResponse.redirect(url);
    }

    // Nếu đã login và đang ở trang authentication, redirect về home
    if (isAuthenticated && pathname === "/authentication") {
        return NextResponse.redirect(new URL("/", request.url));
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
        "/((?!api|_next/static|_next/image|favicon.ico).*)"
    ]
};
