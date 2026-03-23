import { z } from 'zod';

const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default('http://localhost:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('placeholder-service-role-key'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional().default(''),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional().default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default('whsec_placeholder'),
  STRIPE_PRICE_SOLO: z.string().optional().default('price_placeholder_solo'),
  STRIPE_PRICE_TEAM: z.string().optional().default('price_placeholder_team'),
  STRIPE_PRICE_AGENCY: z.string().optional().default('price_placeholder_agency'),

  // Resend
  RESEND_API_KEY: z.string().optional().default('re_placeholder'),
  RESEND_FROM_EMAIL: z.string().email().optional().default('noreply@example.com'),

  // Vercel KV
  KV_REST_API_URL: z.string().url().optional().default('http://localhost'),
  KV_REST_API_TOKEN: z.string().optional().default('placeholder-kv-token'),

  // Tracking
  TRACKING_HASH_SALT: z.string().optional().default('default-dev-salt-change-in-prod'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default('http://localhost:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default('placeholder-anon-key'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
});

// Client-side only gets public vars
export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
});

// Server-side gets all vars — lazily evaluated to avoid client-side access
function parseServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'],
    ANTHROPIC_API_KEY: process.env['ANTHROPIC_API_KEY'],
    STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'],
    STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'],
    STRIPE_PRICE_SOLO: process.env['STRIPE_PRICE_SOLO'],
    STRIPE_PRICE_TEAM: process.env['STRIPE_PRICE_TEAM'],
    STRIPE_PRICE_AGENCY: process.env['STRIPE_PRICE_AGENCY'],
    RESEND_API_KEY: process.env['RESEND_API_KEY'],
    RESEND_FROM_EMAIL: process.env['RESEND_FROM_EMAIL'],
    KV_REST_API_URL: process.env['KV_REST_API_URL'],
    KV_REST_API_TOKEN: process.env['KV_REST_API_TOKEN'],
    TRACKING_HASH_SALT: process.env['TRACKING_HASH_SALT'],
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
  });
}

type ServerEnv = ReturnType<typeof parseServerEnv>;

let _serverEnv: ServerEnv | undefined;

function getServerEnv(): ServerEnv {
  _serverEnv ??= parseServerEnv();
  return _serverEnv;
}

// Lazy proxy — only parsed when first accessed (safe for build-time)
export const env: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});

// Named alias for explicit server-only usage
export const serverEnv = env;
