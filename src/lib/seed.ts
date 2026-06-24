import type { Case } from "./types";

// Seed source for the data-access layer.
//
// This is the seam. The data layer initializes its in-memory state from here,
// and a real database (Supabase/Postgres) later replaces this source without
// any caller changing. Phase 4 populates this with clearly-fictional worked
// example cases. It is intentionally empty until then.
export const seedCases: Case[] = [];
