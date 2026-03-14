"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { seedDemoWorkspaceForUser } from "@/lib/demo/seed-demo-workspace"
import { createClient } from "@/lib/supabase/server"

const dashboardPaths = [
  "/dashboard",
  "/dashboard/clients",
  "/dashboard/communications",
  "/dashboard/compliance",
  "/dashboard/documents",
  "/dashboard/fees",
  "/dashboard/goals",
  "/dashboard/households",
  "/dashboard/leads",
  "/dashboard/meetings",
  "/dashboard/pipeline",
  "/dashboard/portfolios",
  "/dashboard/reports",
  "/dashboard/settings",
  "/dashboard/tasks",
]

function revalidateDashboardPaths() {
  dashboardPaths.forEach((path) => revalidatePath(path))
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/sign-in")
}

export async function loadDemoWorkspace() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Please sign in again to load demo data." }
  }

  const result = await seedDemoWorkspaceForUser({
    email: user.email ?? null,
    fullName: (user.user_metadata.full_name as string | undefined) ?? null,
    userId: user.id,
  })

  if (result.error) {
    return result
  }

  revalidateDashboardPaths()

  return { success: true, message: "Demo data loaded. Refreshing your workspace now." }
}
