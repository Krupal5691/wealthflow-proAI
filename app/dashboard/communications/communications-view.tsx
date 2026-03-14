"use client"

import { useMemo, useState, useTransition } from "react"
import {
  MailIcon,
  PhoneIcon,
  MessageCircleIcon,
  UsersIcon,
  SmartphoneIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  InboxIcon,
  CalendarIcon,
  HashIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { deleteCommunicationLog } from "./actions"
import { CommunicationForm } from "./communication-form"

type HouseholdOption = {
  id: string
  name: string
}

type ClientOption = {
  id: string
  first_name: string
  last_name: string
}

type CommunicationRow = {
  id: string
  household_id: string | null
  client_id: string | null
  channel: string
  subject: string | null
  summary: string
  logged_at: string
  households: { name: string } | null
  clients: { first_name: string; last_name: string } | null
}

const channelFilters = ["all", "email", "phone", "whatsapp", "meeting", "sms"] as const

const channelConfig: Record<string, { icon: typeof MailIcon; label: string; tone: string; bg: string; iconColor: string }> = {
  email: { icon: MailIcon, label: "Email", tone: "bg-blue-50 text-blue-700 border-blue-200", bg: "bg-blue-50", iconColor: "text-blue-600" },
  phone: { icon: PhoneIcon, label: "Phone", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  whatsapp: { icon: MessageCircleIcon, label: "WhatsApp", tone: "bg-green-50 text-green-700 border-green-200", bg: "bg-green-50", iconColor: "text-green-600" },
  meeting: { icon: UsersIcon, label: "Meeting", tone: "bg-violet-50 text-violet-700 border-violet-200", bg: "bg-violet-50", iconColor: "text-violet-600" },
  sms: { icon: SmartphoneIcon, label: "SMS", tone: "bg-amber-50 text-amber-700 border-amber-200", bg: "bg-amber-50", iconColor: "text-amber-600" },
}

const channelBorder: Record<string, string> = {
  email: "border-l-blue-500",
  phone: "border-l-emerald-500",
  whatsapp: "border-l-green-500",
  meeting: "border-l-violet-500",
  sms: "border-l-amber-500",
}

function getClientName(client: CommunicationRow["clients"]) {
  if (!client) {
    return null
  }

  return `${client.first_name} ${client.last_name}`.trim()
}

export function CommunicationsView({
  communications,
  households,
  clients,
}: {
  communications: CommunicationRow[]
  households: HouseholdOption[]
  clients: ClientOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editCommunication, setEditCommunication] = useState<CommunicationRow | null>(null)
  const [filter, setFilter] = useState<(typeof channelFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredCommunications =
    filter === "all"
      ? communications
      : communications.filter((communication) => communication.channel === filter)

  const summary = useMemo(() => {
    const today = new Date()
    const todayCount = communications.filter((communication) => {
      const loggedDate = new Date(communication.logged_at)

      return (
        loggedDate.getFullYear() === today.getFullYear() &&
        loggedDate.getMonth() === today.getMonth() &&
        loggedDate.getDate() === today.getDate()
      )
    }).length

    return {
      todayCount,
      emailCount: communications.filter((communication) => communication.channel === "email").length,
      whatsappCount: communications.filter((communication) => communication.channel === "whatsapp").length,
    }
  }, [communications])

  function handleDelete(id: string) {
    if (!confirm("Delete this communication log?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteCommunicationLog(id)

      if (result.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  const statCards = [
    { label: "Total Logs", count: communications.length, icon: MessageSquareIcon, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-l-blue-500" },
    { label: "Today", count: summary.todayCount, icon: CalendarIcon, bg: "bg-amber-50", iconColor: "text-amber-600", border: "border-l-amber-500" },
    { label: "Email", count: summary.emailCount, icon: MailIcon, bg: "bg-violet-50", iconColor: "text-violet-600", border: "border-l-violet-500" },
    { label: "WhatsApp", count: summary.whatsappCount, icon: MessageCircleIcon, bg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-l-emerald-500" },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Communications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log advisor interactions across email, calls, WhatsApp, meetings, and SMS.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Communication Log</DialogTitle>
              <DialogDescription>
                Capture a client touchpoint or follow-up.
              </DialogDescription>
            </DialogHeader>
            <CommunicationForm
              households={households}
              clients={clients}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editCommunication)}
        onOpenChange={(open) => !open && setEditCommunication(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Communication Log</DialogTitle>
            <DialogDescription>
              Update the channel, timestamp, or conversation notes.
            </DialogDescription>
          </DialogHeader>
          {editCommunication ? (
            <CommunicationForm
              households={households}
              clients={clients}
              communication={editCommunication}
              onClose={() => setEditCommunication(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Summary Stat Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`group flex items-center gap-4 rounded-xl border border-gray-200 border-l-4 ${card.border} bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
            >
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Channel Filter Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {channelFilters.map((channel) => {
          const cfg = channel !== "all" ? channelConfig[channel] : null
          const FilterIcon = cfg?.icon ?? HashIcon
          return (
            <button
              key={channel}
              type="button"
              onClick={() => setFilter(channel)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === channel
                  ? channel === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : `${cfg?.tone ?? ""} shadow-sm ring-1 ring-inset ring-current/10`
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FilterIcon className="size-3.5" />
              {channel === "all" ? "All" : cfg?.label ?? channel}
              <span className={`ml-0.5 text-xs ${filter === channel ? "opacity-80" : "opacity-60"}`}>
                {channel === "all"
                  ? communications.length
                  : communications.filter((communication) => communication.channel === channel).length}
              </span>
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Communication Log Cards */}
      {filteredCommunications.length > 0 ? (
        <div className="space-y-3">
          {filteredCommunications.map((communication) => {
            const cfg = channelConfig[communication.channel]
            const ChannelIcon = cfg?.icon ?? MessageSquareIcon

            return (
              <div
                key={communication.id}
                className={`group rounded-xl border border-l-4 ${channelBorder[communication.channel] ?? "border-l-gray-300"} border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cfg?.bg ?? "bg-gray-50"}`}>
                      <ChannelIcon className={`size-5 ${cfg?.iconColor ?? "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {communication.subject ? (
                          <p className="font-medium text-gray-900">{communication.subject}</p>
                        ) : (
                          <p className="font-medium text-gray-900">Communication log</p>
                        )}
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1 text-xs capitalize ${cfg?.tone ?? ""}`}
                        >
                          <ChannelIcon className="size-3" />
                          {cfg?.label ?? communication.channel}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {communication.households?.name ? (
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="size-3.5 text-gray-400" />
                            {communication.households.name}
                          </span>
                        ) : null}
                        {getClientName(communication.clients) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {getClientName(communication.clients)}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="size-3.5 text-gray-400" />
                          {new Date(communication.logged_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-2">
                        {communication.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditCommunication(communication)}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(communication.id)}
                      disabled={deletingId === communication.id}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
              <InboxIcon className="size-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">No communication logs found</p>
              <p className="mt-1 text-sm text-gray-500">Add one to build your client interaction history.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
