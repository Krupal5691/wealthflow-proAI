import "server-only"

import { buildDemoWorkspace } from "@/lib/demo/demo-workspace"
import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

export async function seedDemoWorkspaceForUser({
  email,
  fullName,
  userId,
}: {
  email: string | null
  fullName: string | null
  userId: string
}) {
  const supabase = await createClient()
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("city, email, full_name, organization_name, phone, role")
    .eq("id", userId)
    .maybeSingle()

  if (profileLookupError) {
    return { error: formatSupabaseActionError(profileLookupError) }
  }

  const effectiveEmail = email ?? existingProfile?.email ?? null
  const effectiveFullName = fullName?.trim() || existingProfile?.full_name || null
  const demoWorkspace = buildDemoWorkspace(userId, effectiveEmail, effectiveFullName, {
    city: existingProfile?.city ?? null,
    phone: existingProfile?.phone ?? null,
  })
  demoWorkspace.profile = {
    ...demoWorkspace.profile,
    city: existingProfile?.city ?? demoWorkspace.profile.city,
    email: effectiveEmail ?? demoWorkspace.profile.email,
    full_name: effectiveFullName ?? demoWorkspace.profile.full_name,
    organization_name:
      existingProfile?.organization_name ?? demoWorkspace.profile.organization_name,
    phone: existingProfile?.phone ?? demoWorkspace.profile.phone,
    role: existingProfile?.role ?? demoWorkspace.profile.role,
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(demoWorkspace.profile)
  if (profileError) {
    return { error: formatSupabaseActionError(profileError) }
  }

  const { error: householdsError } = await supabase
    .from("households")
    .upsert(demoWorkspace.households)
  if (householdsError) {
    return { error: formatSupabaseActionError(householdsError) }
  }

  const { error: clientsError } = await supabase
    .from("clients")
    .upsert(demoWorkspace.clients)
  if (clientsError) {
    return { error: formatSupabaseActionError(clientsError) }
  }

  const { error: portfoliosError } = await supabase
    .from("portfolios")
    .upsert(demoWorkspace.portfolios)
  if (portfoliosError) {
    return { error: formatSupabaseActionError(portfoliosError) }
  }

  const { error: accountsError } = await supabase
    .from("accounts")
    .upsert(demoWorkspace.accounts)
  if (accountsError) {
    return { error: formatSupabaseActionError(accountsError) }
  }

  const { error: holdingsError } = await supabase
    .from("holdings")
    .upsert(demoWorkspace.holdings)
  if (holdingsError) {
    return { error: formatSupabaseActionError(holdingsError) }
  }

  const { error: transactionsError } = await supabase
    .from("transactions")
    .upsert(demoWorkspace.transactions)
  if (transactionsError) {
    return { error: formatSupabaseActionError(transactionsError) }
  }

  const { error: tasksError } = await supabase.from("tasks").upsert(demoWorkspace.tasks)
  if (tasksError) {
    return { error: formatSupabaseActionError(tasksError) }
  }

  const { error: complianceError } = await supabase
    .from("compliance_records")
    .upsert(demoWorkspace.complianceRecords)
  if (complianceError) {
    return { error: formatSupabaseActionError(complianceError) }
  }

  const { error: leadsError } = await supabase.from("leads").upsert(demoWorkspace.leads)
  if (leadsError) {
    return { error: formatSupabaseActionError(leadsError) }
  }

  const { error: opportunitiesError } = await supabase
    .from("opportunities")
    .upsert(demoWorkspace.opportunities)
  if (opportunitiesError) {
    return { error: formatSupabaseActionError(opportunitiesError) }
  }

  const { error: meetingsError } = await supabase
    .from("meetings")
    .upsert(demoWorkspace.meetings)
  if (meetingsError) {
    return { error: formatSupabaseActionError(meetingsError) }
  }

  const { error: documentsError } = await supabase
    .from("documents")
    .upsert(demoWorkspace.documents)
  if (documentsError) {
    return { error: formatSupabaseActionError(documentsError) }
  }

  const { error: goalsError } = await supabase.from("goals").upsert(demoWorkspace.goals)
  if (goalsError) {
    return { error: formatSupabaseActionError(goalsError) }
  }

  const { error: feeSchedulesError } = await supabase
    .from("fee_schedules")
    .upsert(demoWorkspace.feeSchedules)
  if (feeSchedulesError) {
    return { error: formatSupabaseActionError(feeSchedulesError) }
  }

  const { error: communicationsError } = await supabase
    .from("communication_logs")
    .upsert(demoWorkspace.communicationLogs)
  if (communicationsError) {
    return { error: formatSupabaseActionError(communicationsError) }
  }

  return { success: true as const }
}
