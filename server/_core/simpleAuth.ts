import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const SECRET = new TextEncoder().encode(ENV.cookieSecret || "default-secret-do-not-use-in-prod");
const ALG = "HS256";

export type SimpleUserPayload = {
    id: number;
    openId: string;
    name: string;
    role: string;
};

export async function signSimpleToken(payload: SimpleUserPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime("7d") // 7 days session
        .sign(SECRET);
}

export async function verifySimpleToken(token: string): Promise<SimpleUserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return {
            id: payload.id as number,
            openId: payload.openId as string,
            name: payload.name as string,
            role: payload.role as string,
        };
    } catch (err) {
        return null; // Invalid or expired token
    }
}
