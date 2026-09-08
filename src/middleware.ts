export { default } from "next-auth/middleware";

// Bu rotalar giriş gerektirir. Giriş yoksa /giris'e yönlendirilir.
// (ADMIN rol kontrolü /admin layout'unda ayrıca yapılır.)
export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};
