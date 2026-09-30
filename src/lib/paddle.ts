import { Environment, Paddle } from "@paddle/paddle-node-sdk";

export const PADDLE_ENVIRONMENT: Environment =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
    ? Environment.production
    : Environment.sandbox;

/**
 * Lazily constructs the Paddle client inside each caller instead of at
 * module scope, matching the same reasoning as lib/stripe.ts used to: the
 * SDK isn't guaranteed to fail gracefully on a missing key, and a
 * module-scope instantiation would risk crashing every route that imports
 * this file (and the build itself) before PADDLE_API_KEY is ever set.
 */
export function getPaddle(): Paddle {
  if (!process.env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not set");
  }
  return new Paddle(process.env.PADDLE_API_KEY, {
    environment: PADDLE_ENVIRONMENT,
  });
}
