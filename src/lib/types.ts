import type { SupabaseClient } from "@supabase/supabase-js";

// We don't generate types from the live schema, so query builders are typed
// per-call via .returns<T>(); the client itself stays untyped here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySupabaseClient = SupabaseClient<any>;

export type VerificationStatus = "pending" | "approved" | "rejected";
export type Role = "performer" | "venue" | "admin";
export type BookingStatus =
  | "requested"
  | "accepted"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled";

export type LinkItem = { url: string };

export type PerformerProfile = {
  user_id: string;
  display_name: string;
  act_type: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  portfolio_links: LinkItem[];
  first_time_flag: boolean | null;
  proof_of_work_links: LinkItem[];
  profile_picture_url: string | null;
  // General area only, for distance-based matching — never a physical
  // destination, so unlike a venue's address this is always public.
  locality: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueProfile = {
  user_id: string;
  venue_name: string;
  // Lives in venue_private_details, not the venue_profiles table — merged
  // in for the owner (requireProfile) or via get_booking_reveal once a
  // booking is confirmed. Never present for a public/other-party view.
  address?: string;
  state: string | null;
  city: string | null;
  locality: string | null;
  lat: number | null;
  lng: number | null;
  act_types_wanted: string[];
  photos: LinkItem[];
  video_link: string | null;
  social_links: Record<string, string>;
  proof_of_business_links: LinkItem[];
  profile_picture_url: string | null;
  first_time_hosting: boolean | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};
