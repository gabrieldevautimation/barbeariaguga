import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySimpleToken } from "./simpleAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const { req, res } = opts;

  try {
    // 1. Check for Barber Session (Standard Cookie)
    const barberCookie = req.cookies?.barber_session;
    if (barberCookie) {
      try {
        const parsed = JSON.parse(barberCookie);
        // Adapt barber to User interface if needed, or better, keep them separate
        // For now, let's keep user null if it's a barber, the routers handle 'me' separately
      } catch { }
    }

    // 2. Check for Client Session (Our new Simple JWT)
    const token = req.cookies?.session_token;
    if (token) {
      const payload = await verifySimpleToken(token);
      if (payload) {
        // Hydrate simplified user object from token (No DB call!)
        user = {
          id: payload.id,
          openId: payload.openId,
          name: payload.name,
          role: payload.role as any,
          email: null,        // Not in token to save space
          loginMethod: null,  // Not critical for context
          createdAt: new Date(),
          updatedAt: new Date(), // Added
          lastSignedIn: new Date(), // Added
          isBlocked: false,
          noShowCount: 0
        };
      }
    }
  } catch (error) {
    user = null;
  }

  return {
    req,
    res,
    user,
  };
}
