import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

// Anonymous per-browser case ownership. A httpOnly cookie marks which browser
// created a case. No account, no login, nothing identifying: the value is a
// random UUID. Cases list and detail are scoped to it; sample cases are
// visible to everyone.

const COOKIE_NAME = "dfr_owner";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Read-only. Safe anywhere on the server.
export async function getOwnerId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

// Creates the cookie when missing. Only callable where cookies are mutable
// (server actions and route handlers), not during page render.
export async function getOrCreateOwnerId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return id;
}
