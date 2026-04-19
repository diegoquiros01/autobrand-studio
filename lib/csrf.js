// Simple CSRF protection using double-submit cookie pattern
// The client sends a token in both a cookie and a header — server verifies they match.

import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate and set a CSRF token cookie. Call from GET routes or page loads.
 */
export async function setCsrfToken() {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // Client needs to read it
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return token;
}

/**
 * Verify CSRF token from request. Returns true if valid.
 */
export async function verifyCsrfToken(request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
