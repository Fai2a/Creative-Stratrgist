import Stripe from "stripe";

/**
 * Lazily constructs the Stripe client inside each caller instead of at
 * module scope - `new Stripe(undefined)` throws synchronously, and a
 * module-scope instantiation would crash every route that imports this
 * file (and the build itself) before STRIPE_SECRET_KEY is ever set.
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
