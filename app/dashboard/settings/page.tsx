import { redirect } from "next/navigation"

import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { SettingsForm } from "./settings-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const [
    { data: profile, error: profileError },
    { count: householdCount, error: householdsError },
    { count: clientCount, error: clientsError },
    { count: documentCount, error: documentsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("city, email, full_name, organization_name, phone, role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("households").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
  ])

  if (hasMissingSchemaError([profileError, householdsError, clientsError, documentsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to manage advisor and practice settings." />
    )
  }

  const displayName =
    profile?.full_name ??
    user.user_metadata.full_name ??
    user.email?.split("@")[0]?.replace(/[._-]/g, " ") ??
    "Advisor"

  const settingsProfile = {
    city: profile?.city ?? null,
    email: profile?.email ?? user.email ?? null,
    full_name: displayName,
    organization_name: profile?.organization_name ?? null,
    phone: profile?.phone ?? null,
    role: profile?.role ?? "advisor",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage advisor details and practice identity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">
              {settingsProfile.organization_name ?? "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Households Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">
              {householdCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Clients / Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">
              {clientCount ?? 0} / {documentCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SettingsForm profile={settingsProfile} />

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-gray-900">
              Workspace Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-900">Email Sign-In</p>
              <p className="mt-1">
                This workspace currently uses Supabase email/password auth.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900">Role</p>
              <p className="mt-1 capitalize">
                {settingsProfile.role.replaceAll("_", " ")}
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900">Next Recommended Step</p>
              <p className="mt-1">
                Add organization-scoped permissions before opening multi-user
                signup broadly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
