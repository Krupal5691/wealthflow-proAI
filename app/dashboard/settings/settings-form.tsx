"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { updateProfileSettings } from "./actions"

type SettingsFormData = {
  city: string | null
  email: string | null
  full_name: string
  organization_name: string | null
  phone: string | null
  role: string
}

export function SettingsForm({
  profile,
}: {
  profile: SettingsFormData
}) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await updateProfileSettings(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Profile updated.")
      }
    })
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-gray-900">Advisor Profile</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input
                name="full_name"
                required
                defaultValue={profile.full_name}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={profile.email ?? ""} readOnly disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Organization</label>
              <Input
                name="organization_name"
                defaultValue={profile.organization_name ?? ""}
                placeholder="Practice name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                name="phone"
                defaultValue={profile.phone ?? ""}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">City</label>
              <Input
                name="city"
                defaultValue={profile.city ?? ""}
                placeholder="Mumbai"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Input
                value={profile.role.replaceAll("_", " ")}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Account Status</label>
              <Input value="Active" readOnly disabled />
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
