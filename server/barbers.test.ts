import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createMockContext(): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];
  const requestCookies: Record<string, string> = {};

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: requestCookies,
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
        requestCookies[name] = value;
      },
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("barbers router", () => {
  it("should list all active barbers", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const barbers = await caller.barbers.list();

    expect(Array.isArray(barbers)).toBe(true);
    expect(barbers.length).toBeGreaterThan(0);
    expect(barbers[0]).toHaveProperty("name");
    expect(barbers[0]).toHaveProperty("description");
  });

  it("should login barber with valid credentials", async () => {
    const { ctx, cookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.barbers.login({
      name: "Carlos Silva",
      password: "barber123",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result.name).toBe("Carlos Silva");
    expect(cookies.length).toBe(1);
    expect(cookies[0]?.name).toBe("barber_session");
  });

  it("should reject barber login with invalid credentials", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.barbers.login({
        name: "Carlos Silva",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Nome ou senha inválidos");
  });

  it("should return barber info from session cookie", async () => {
    const { ctx } = createMockContext();
    
    // Simulate logged-in barber
    ctx.req.cookies = {
      barber_session: JSON.stringify({ id: 1, name: "Carlos Silva" }),
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.barbers.me();

    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe("Carlos Silva");
  });
});

describe("services router", () => {
  it("should list all services", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const services = await caller.services.list();

    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    expect(services[0]).toHaveProperty("name");
    expect(services[0]).toHaveProperty("price");
  });
});
