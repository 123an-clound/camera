import { z } from "zod";

// Safe to import from client components: NEXT_PUBLIC_* only.
export const publicEnv = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  })
  .parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

// Server-only: never import this file from a client component.
export const serverEnv = z
  .object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  })
  .parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
