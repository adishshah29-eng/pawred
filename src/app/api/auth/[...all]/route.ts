// Better Auth handles every /api/auth/* request (sign-in, sign-up, OAuth callbacks, sign-out).
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
