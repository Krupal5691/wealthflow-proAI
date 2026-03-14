"use client"

import { useMemo, useState, useTransition } from "react"
import {
  BarChart3Icon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  TargetIcon,
  Trash2Icon,
  UserPlusIcon,
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

import { convertLeadToOpportunity, deleteLead } from "./actions"
import { LeadForm } from "./lead-form"

type LeadRow = {
  id: string
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score: number
  created_at: string
  updated_at: string
  opportunity: { id: string; stage: string } | null
}

const statusTone: Record<string, string> = {
  new: "bg-gray-50 text-gray-700 border-gray-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  nurturing: "bg-amber-50 text-amber-700 border-amber-200",
  converted: "bg-violet-50 text-violet-700 border-violet-200",
  lost: "bg-red-50 text-red-700 border-red-200",
}

const filterButtonTone: Record<string, string> = {
  all: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  new: "bg-gray-100 text-gray-700 ring-1 ring-gray-300",
  contacted: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  qualified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  nurturing: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  converted: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  lost: "bg-red-50 text-red-700 ring-1 ring-red-200",
}

const leadStatusFilters = [
  "all",
  "new",
  "contacted",
  "qualified",
  "nurturing",
  "converted",
  "lost",
] as const

function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-100" }
  if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-100" }
  if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-100" }
  return { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-100" }
}

const pipelineStageTone: Record<string, string> = {
  proposal: "bg-blue-50 text-blue-700 border-blue-200",
  qualifying: "bg-amber-50 text-amber-700 border-amber-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  converted: "bg-violet-50 text-violet-700 border-violet-200",
}

export function LeadsView({ leads }: { leads: LeadRow[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editLead, setEditLead] = useState<LeadRow | null>(null)
  const [filter, setFilter] = useState<(typeof leadStatusFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredLeads =
    filter === "all" ? leads : leads.filter((lead) => lead.status === filter)

  const summary = useMemo(() => {
    const converted = leads.filter((lead) => lead.status === "converted").length
    const qualified = leads.filter((lead) => lead.status === "qualified").length
    const avgScore =
      leads.length > 0
        ? Math.round(
            leads.reduce((sum, lead) => sum + Number(lead.score), 0) / leads.length,
          )
        : 0

    return { converted, qualified, avgScore }
  }, [leads])

  function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteLead(id)

      if (result.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  function handleConvert(id: string) {
    setError(null)
    setConvertingId(id)

    startTransition(async () => {
      const result = await convertLeadToOpportunity(id)

      if (result.error) {
        setError(result.error)
      }

      setConvertingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Leads
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track prospects, qualification, and pipeline handoff.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Lead</DialogTitle>
              <DialogDescription>
                Capture a new prospect before qualification.
              </DialogDescription>
            </DialogHeader>
            <LeadForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editLead)}
        onOpenChange={(open) => !open && setEditLead(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update prospect details, source, and qualification.
            </DialogDescription>
          </DialogHeader>
          {editLead ? (
            <LeadForm lead={editLead} onClose={() => setEditLead(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Summary stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group border-l-4 border-l-blue-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <UserPlusIcon className="size-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-emerald-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Qualified</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {summary.qualified}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                <TargetIcon className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-violet-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Converted</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {summary.converted}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50">
                <CheckCircleIcon className="size-5 text-violet-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-amber-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {summary.avgScore}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50">
                <BarChart3Icon className="size-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Status filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {leadStatusFilters.map((status) => {
          const count =
            status === "all"
              ? leads.length
              : leads.filter((lead) => lead.status === status).length
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                filter === status
                  ? filterButtonTone[status] ?? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <span className="capitalize">{status === "all" ? "All" : status}</span>
              <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-white/60 text-xs font-semibold">
                {count}
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

      {filteredLeads.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="pl-4 font-semibold text-gray-700">Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">Company</TableHead>
                <TableHead className="font-semibold text-gray-700">Source</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Score</TableHead>
                <TableHead className="font-semibold text-gray-700">Pipeline</TableHead>
                <TableHead className="font-semibold text-gray-700">Updated</TableHead>
                <TableHead className="w-48 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const scoreColor = getScoreColor(lead.score)
                return (
                  <TableRow key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-semibold text-gray-600 ring-1 ring-gray-200/50">
                          {lead.contact_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {lead.contact_name}
                          </p>
                          {lead.email ? (
                            <p className="text-xs text-gray-500">{lead.email}</p>
                          ) : null}
                          {lead.phone ? (
                            <p className="text-xs text-gray-400">{lead.phone}</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {lead.company_name ?? (
                          <span className="italic text-gray-400">-</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize text-gray-600">
                        {(lead.source ?? "-").replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          statusTone[lead.status] ?? ""
                        }`}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-16 overflow-hidden rounded-full ${scoreColor.light}`}>
                          <div
                            className={`h-full rounded-full ${scoreColor.bg} transition-all`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${scoreColor.text}`}>
                          {lead.score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.opportunity ? (
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${pipelineStageTone[lead.opportunity.stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                        >
                          {lead.opportunity.stage}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(lead.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!lead.opportunity && lead.status !== "converted" ? (
                          <button
                            type="button"
                            onClick={() => handleConvert(lead.id)}
                            disabled={convertingId === lead.id}
                            className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                          >
                            {convertingId === lead.id ? "Converting..." : "Convert"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setEditLead(lead)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
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
            <UserPlusIcon className="size-6 text-gray-300" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No leads found</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            {filter !== "all"
              ? `No leads with "${filter}" status. Try a different filter or add a new lead.`
              : "Add a prospect to start filling the pipeline."}
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-4 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-1.5 size-4" /> Add Lead
          </Button>
        </div>
      )}
    </div>
  )
}
