"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

export async function updateProfileSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Please sign in again to update your profile." }
  }

  const fullName = ((formData.get("full_name") as string) || "").trim()

  if (!fullName) {
    return { error: "Full name is required." }
  }

  const updates = {
    city: ((formData.get("city") as string) || "").trim() || null,
    full_name: fullName,
    organization_name:
      ((formData.get("organization_name") as string) || "").trim() || null,
    phone: ((formData.get("phone") as string) || "").trim() || null,
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (profileError) {
    return { error: formatSupabaseActionError(profileError) }
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")

  return { success: true }
}
