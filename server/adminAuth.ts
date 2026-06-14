/**
 * Simple single-admin password gate.
 * POST /api/admin/login  { password }  -> sets a signed session cookie
 * POST /api/admin/logout                -> clears it
 * The tRPC context reads the cookie and exposes a synthetic admin user.
 */
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../drizzle/schema";

const COOKIE = "tm_admin";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  // Tokens are signed with the admin password, so changing the password
  // invalidates existing sessions. Falls back to a dev value locally.
  return new TextEncoder().encode(
    process.env.ADMIN_PASSWORD || "dev-admin-secret-change-me"
  );
}

async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

const ADMIN_USER: User = {
  id: 0,
  openId: "admin",
  name: "Admin",
  email: process.env.ADMIN_EMAIL ?? "",
  loginMethod: "password",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

/** Returns the synthetic admin user if the request has a valid session cookie. */
export async function getAdminUser(req: Request): Promise<User | null> {
  try {
    const token = readCookie(req.headers.cookie, COOKIE);
    if (!token) return null;
    await jwtVerify(token, secret());
    return ADMIN_USER;
  } catch {
    return null;
  }
}

export function registerAdminAuthRoutes(app: Express) {
  const secureCookie =
    process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const password = (req.body?.password ?? "") as string;
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected) {
      res.status(500).json({ ok: false, error: "ADMIN_PASSWORD not configured" });
      return;
    }
    if (password !== expected) {
      res.status(401).json({ ok: false, error: "Špatné heslo" });
      return;
    }
    const token = await signToken();
    res.cookie(COOKIE, token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_MS,
    });
    res.json({ ok: true });
  });

  app.post("/api/admin/logout", (_req: Request, res: Response) => {
    res.clearCookie(COOKIE, { path: "/" });
    res.json({ ok: true });
  });
}
