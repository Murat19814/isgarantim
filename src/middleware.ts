export { default } from "next-auth/middleware";

// Bu rotalar giriş gerektirir. Giriş yoksa /giris'e yönlendirilir.
export const config = {
  matcher: ["/panel/:path*"],
};
