import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export async function ensureProfile(user: User) {
  const payload = {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email ?? "User",
    role: "user" as const
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id"
  });

  if (error) {
    throw error;
  }
}
