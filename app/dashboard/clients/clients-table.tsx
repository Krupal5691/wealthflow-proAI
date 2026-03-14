"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientForm } from "./client-form"
import { deleteClient } from "./actions"

type ClientRow = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  city: string | null
  kyc_status: string
  onboarding_stage: string
  household_id: string
  households: { name: string } | null
}

type Household = { id: string; name: string }

const kycBadgeColor: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-red-50 text-red-700 border-red-200",
}

const onboardingStageTone: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  new: "bg-gray-50 text-gray-600 border-gray-200",
}

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600",
  "from-cyan-400 to-cyan-600",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function ClientsTable({
  clients,
  households,
}: {
  clients: ClientRow[]
  households: Household[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editClient, setEditClient] = useState<ClientRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const summary = useMemo(() => {
    const verifiedKyc = clients.filter((c) => c.kyc_status === "verified").length
    const activeClients = clients.filter(
      (c) => c.onboarding_stage === "completed" || c.onboarding_stage === "active",
    ).length
    const pendingOnboarding = clients.filter(
      (c) => c.onboarding_stage === "pending" || c.onboarding_stage === "in_progress",
    ).length
    return { verifiedKyc, activeClients, pendingOnboarding }
  }, [clients])

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this client?")) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteClient(id)
      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client directory across {households.length} households.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client record in your practice.</DialogDescription>
            </DialogHeader>
            <ClientForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information.</DialogDescription>
          </DialogHeader>
          {editClient && (
            <ClientForm
              households={households}
              client={editClient}
              onClose={() => setEditClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Summary stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group border-l-4 border-l-blue-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <UsersIcon className="size-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-emerald-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified KYC</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{summary.verifiedKyc}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircleIcon className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-violet-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{summary.activeClients}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50">
                <UserIcon className="size-5 text-violet-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-amber-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Onboarding</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{summary.pendingOnboarding}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50">
                <ClockIcon className="size-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {clients.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="pl-4 font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Household</TableHead>
                <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">City</TableHead>
                <TableHead className="font-semibold text-gray-700">KYC</TableHead>
                <TableHead className="font-semibold text-gray-700">Stage</TableHead>
                <TableHead className="w-20 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const fullName = `${client.first_name} ${client.last_name}`
                return (
                  <TableRow key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(fullName)} text-xs font-semibold text-white shadow-sm`}
                        >
                          {client.first_name[0]}
                          {client.last_name[0]}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {client.households?.name ?? (
                          <span className="italic text-gray-400">--</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-sm">
                        {client.email && (
                          <div className="text-gray-600">{client.email}</div>
                        )}
                        {client.phone && (
                          <div className="text-xs text-gray-400">{client.phone}</div>
                        )}
                        {!client.email && !client.phone && (
                          <span className="italic text-gray-400">--</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {client.city ?? (
                          <span className="italic text-gray-400">--</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${kycBadgeColor[client.kyc_status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {client.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${onboardingStageTone[client.onboarding_stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {client.onboarding_stage.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditClient(client)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingId === client.id}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-50">
            <UsersIcon className="size-6 text-gray-300" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No clients yet</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            Add your first client to get started managing your practice.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-4 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-1.5 size-4" /> Add Client
          </Button>
        </div>
      )}
    </div>
  )
}
