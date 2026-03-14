"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CalendarIcon,
  CalendarCheckIcon,
  Clock3Icon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  VideoIcon,
  UsersIcon,
  PhoneIcon,
  CalendarDaysIcon,
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

import { deleteMeeting } from "./actions"
import { MeetingForm } from "./meeting-form"

type HouseholdOption = {
  id: string
  name: string
}

type MeetingRow = {
  id: string
  household_id: string | null
  subject: string
  meeting_type: string
  location: string | null
  notes: string | null
  starts_at: string
  ends_at: string | null
  households: { name: string } | null
}

const filters = ["all", "upcoming", "today", "past"] as const

const meetingTypeConfig: Record<string, { icon: typeof VideoIcon; color: string }> = {
  video_call: { icon: VideoIcon, color: "bg-blue-50 text-blue-700 border-blue-200" },
  phone_call: { icon: PhoneIcon, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_person: { icon: UsersIcon, color: "bg-violet-50 text-violet-700 border-violet-200" },
  review: { icon: CalendarCheckIcon, color: "bg-amber-50 text-amber-700 border-amber-200" },
}

function isToday(dateValue: string) {
  const date = new Date(dateValue)
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isPastMeeting(meeting: MeetingRow) {
  const endDate = meeting.ends_at ? new Date(meeting.ends_at) : new Date(meeting.starts_at)

  return endDate < new Date()
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function MeetingsView({
  meetings,
  households,
}: {
  meetings: MeetingRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<MeetingRow | null>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredMeetings = useMemo(() => {
    if (filter === "all") {
      return meetings
    }

    if (filter === "today") {
      return meetings.filter((meeting) => isToday(meeting.starts_at))
    }

    if (filter === "past") {
      return meetings.filter((meeting) => isPastMeeting(meeting))
    }

    return meetings.filter((meeting) => !isPastMeeting(meeting))
  }, [filter, meetings])

  const summary = useMemo(() => {
    const todayCount = meetings.filter((meeting) => isToday(meeting.starts_at)).length
    const pastCount = meetings.filter((meeting) => isPastMeeting(meeting)).length
    const upcomingCount = meetings.length - pastCount

    return { todayCount, pastCount, upcomingCount }
  }, [meetings])

  function handleDelete(id: string) {
    if (!confirm("Delete this meeting?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteMeeting(id)

      if (result.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  const statCards = [
    { label: "Total Meetings", count: meetings.length, icon: CalendarIcon, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-l-blue-500" },
    { label: "Upcoming", count: summary.upcomingCount, icon: ClockIcon, bg: "bg-violet-50", iconColor: "text-violet-600", border: "border-l-violet-500" },
    { label: "Today", count: summary.todayCount, icon: CalendarDaysIcon, bg: "bg-amber-50", iconColor: "text-amber-600", border: "border-l-amber-500" },
    { label: "Completed", count: summary.pastCount, icon: CalendarCheckIcon, bg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-l-emerald-500" },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Meetings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage advisor reviews, onboarding calls, and client touchpoints.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
              <DialogDescription>
                Add a meeting to the practice calendar.
              </DialogDescription>
            </DialogHeader>
            <MeetingForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editMeeting)}
        onOpenChange={(open) => !open && setEditMeeting(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update agenda, timing, or client context.
            </DialogDescription>
          </DialogHeader>
          {editMeeting ? (
            <MeetingForm
              households={households}
              meeting={editMeeting}
              onClose={() => setEditMeeting(null)}
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

      {/* Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filterKey) => (
          <button
            key={filterKey}
            type="button"
            onClick={() => setFilter(filterKey)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${
              filter === filterKey
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {filterKey === "all" ? "All" : filterKey}
            <span className={`ml-0.5 text-xs ${filter === filterKey ? "opacity-80" : "opacity-60"}`}>
              {filterKey === "all"
                ? meetings.length
                : filterKey === "today"
                  ? summary.todayCount
                  : filterKey === "past"
                    ? summary.pastCount
                    : summary.upcomingCount}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Meeting Cards */}
      {filteredMeetings.length > 0 ? (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => {
            const past = isPastMeeting(meeting)
            const typeConfig = meetingTypeConfig[meeting.meeting_type]
            const TypeIcon = typeConfig?.icon ?? CalendarIcon

            return (
              <div
                key={meeting.id}
                className={`group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  past ? "border-gray-200" : "border-l-4 border-l-blue-500 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${past ? "bg-gray-100" : "bg-blue-50"}`}>
                      <TypeIcon className={`size-5 ${past ? "text-gray-400" : "text-blue-600"}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`font-medium ${past ? "text-gray-500" : "text-gray-900"}`}>{meeting.subject}</p>
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1 text-xs capitalize ${typeConfig?.color ?? ""}`}
                        >
                          <TypeIcon className="size-3" />
                          {meeting.meeting_type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${past ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                        >
                          {past ? "Completed" : "Upcoming"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {meeting.households?.name && (
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="size-3.5 text-gray-400" />
                            {meeting.households.name}
                          </span>
                        )}
                        {!meeting.households?.name && (
                          <span className="text-gray-400">No household</span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="size-3.5 text-gray-400" />
                          {formatDate(meeting.starts_at)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          <Clock3Icon className="size-3.5 text-gray-400" />
                          {formatTime(meeting.starts_at)}
                          {meeting.ends_at ? ` - ${formatTime(meeting.ends_at)}` : ""}
                        </span>
                        {meeting.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="size-3.5 text-gray-400" />
                            {meeting.location}
                          </span>
                        ) : null}
                      </div>
                      {meeting.notes ? (
                        <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-2">
                          {meeting.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditMeeting(meeting)}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(meeting.id)}
                      disabled={deletingId === meeting.id}
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
              <CalendarIcon className="size-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">No meetings found</p>
              <p className="mt-1 text-sm text-gray-500">Schedule one to start tracking advisor activity.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
