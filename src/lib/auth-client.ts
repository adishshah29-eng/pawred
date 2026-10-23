import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Browser-side auth calls: signIn, signUp, signOut, useSession.
// Same origin as the app, so no baseURL is needed.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
