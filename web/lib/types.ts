/**
 * Cross-cutting types shared by API routes, components, and lib modules.
 * Database row types are auto-generated into lib/supabase/database.types.ts
 * by `npm run db:types` — import from there for table-row shapes.
 */

import type { TierId } from "./pricing";

export interface UserSubscription {
  userId: string;
  tier: TierId;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}

export interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD UTC
  premiumMessages: number;
  fallbackMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

/**
 * Profile shape stored in `profiles.data` (jsonb column).
 * Mirrors the structure documented in plugin/skills/getting-started/SKILL.md.
 * Keep in sync with the plugin definition.
 */
export interface CardHackerProfile {
  schema_version: 1;
  last_updated: string;
  household: {
    player_count: 1 | 2;
    p2_present: boolean;
    state: string | null;
    income_range: "<50k" | "50-100k" | "100-200k" | "200k+" | null;
    owns_business_or_sole_prop: boolean;
  };
  credit_posture: {
    fico_band: "740+" | "700-740" | "660-700" | "<660" | null;
    mortgage_in_12_months: boolean;
    prior_shutdown: boolean;
    chex_sensitive: boolean;
  };
  cards: ProfileCard[];
  amex_history: AmexHistoryEntry[];
  gates: ProfileGates;
  earning: ProfileEarning;
  points: Record<string, number | boolean | string>;
  loyalty: ProfileLoyalty;
  goals: ProfileGoals;
}

export interface ProfileCard {
  card_id: string | null;
  issuer: string;
  name: string;
  type: "personal" | "business";
  open_date: string;
  status: "open" | "closed" | "product_changed";
  closed_date?: string;
  product_changed_to?: string;
  received_sub: boolean;
  current_credit_limit?: number;
  notes?: string;
}

export interface AmexHistoryEntry {
  card_name: string;
  received_sub_date: string | null;
  closed_date: string | null;
}

export interface ProfileGates {
  five_24_count: number;
  five_24_list: string[];
  chase_sapphire_last_sub_date: string | null;
  amex_plat_personal_received_sub: boolean;
  amex_plat_personal_received_sub_date: string | null;
  amex_gold_personal_received_sub: boolean;
  marriott_bonvoy_last_sub_date: string | null;
  hilton_last_sub_date: string | null;
  chase_apps_last_6_months: number;
  amex_apps_last_30_days: number;
  boa_apps_last_12_months: number;
  citi_last_personal_app_date: string | null;
}

export interface ProfileEarning {
  monthly_cc_spend: number | null;
  organic_categories: string[];
  rent: { pays_rent: boolean; monthly_amount: number | null; uses_bilt: boolean };
  estimated_taxes: { owes_quarterly: boolean; annual_amount: number | null };
  planned_large_spend: Array<{ description: string; amount: number; when: string }>;
}

export interface ProfileLoyalty {
  airline_status: Array<{ program: string; tier: string }>;
  hotel_status: Array<{ program: string; tier: string }>;
  lounge_memberships: string[];
  home_airport: string | null;
  frequent_destinations: string[];
}

export interface ProfileGoals {
  primary: "transferable_points" | "specific_trip" | "cashback" | "bank_bonus_heavy";
  specific_trip: string | null;
  risk_tolerance: "conservative" | "moderate" | "aggressive";
  ok_with_business_cards: boolean;
  do_not_recommend: string[];
}
