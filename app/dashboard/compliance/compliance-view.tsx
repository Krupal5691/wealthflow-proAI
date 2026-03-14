"use client"

import { useState, useTransition } from "react"
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, EyeIcon, FlagIcon, PlusIcon, ShieldCheckIcon, Trash2Icon, XCircleIcon, ListChecksIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createComplianceRecord, updateComplianceStatus, deleteComplianceRecord } from "./actions"

type ComplianceRow = {
  id: string
  record_type: string
  status: string
  due_at: string | null
  completed_at: string | null
  finding: string | null
  household_id: string | null
  households: { name: string } | null
}

type Household = { id: string; name: string }

const statusConfig: Record<string, { icon: typeof ClockIcon; label: string; badgeClass: string }> = {
  pending: { icon: ClockIcon, label: "Pending", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  in_review: { icon: EyeIcon, label: "In Review", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { icon: CheckCircleIcon, label: "Approved", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  flagged: { icon: FlagIcon, label: "Flagged", badgeClass: "bg-red-50 text-red-700 border-red-200" },
  closed: { icon: XCircleIcon, label: "Closed", badgeClass: "bg-gray-50 text-gray-600 border-gray-200" },
}

export function ComplianceView({ records, households }: { records: ComplianceRow[]; households: Household[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter)

  // Compliance health score
  const total = records.length
  const approved = records.filter(r => r.status === "approved" || r.status === "closed").length
  const flagged = records.filter(r => r.status === "flagged").length
  const healthPercent = total > 0 ? Math.round((approved / total) * 100) : 100
  const healthColor = healthPercent >= 80 ? "text-emerald-600" : healthPercent >= 60 ? "text-amber-600" : "text-red-600"
  const healthBg = healthPercent >= 80 ? "bg-emerald-50" : healthPercent >= 60 ? "bg-amber-50" : "bg-red-50"
  const healthBorder = healthPercent >= 80 ? "border-l-emerald-500" : healthPercent >= 60 ? "border-l-amber-500" : "border-l-red-500"
  const healthIconBg = healthPercent >= 80 ? "bg-emerald-100 text-emerald-600" : healthPercent >= 60 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"

  async function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createComplianceRecord(formData)
      if (result.error) setError(result.error)
      else setAddOpen(false)
    })
  }

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => { await updateComplianceStatus(id, newStatus) })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this compliance record?")) return
    startTransition(async () => { await deleteComplianceRecord(id) })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Compliance</h1>
          <p className="mt-1 text-sm text-gray-500">{records.length} compliance records</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Compliance Record</DialogTitle>
              <DialogDescription>Add a new compliance tracking record.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Record Type</label>
                <select name="record_type" required className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="SEBI Suitability Questionnaire">SEBI Suitability Questionnaire</option>
                  <option value="KYC Document Review">KYC Document Review</option>
                  <option value="Document Retention Audit">Document Retention Audit</option>
                  <option value="Fee Disclosure Confirmation">Fee Disclosure Confirmation</option>
                  <option value="Annual Risk Assessment">Annual Risk Assessment</option>
                  <option value="Anti-Money Laundering Check">Anti-Money Laundering Check</option>
                  <option value="Investment Suitability Review">Investment Suitability Review</option>
                  <option value="Regulatory Filing">Regulatory Filing</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Household</label>
                <select name="household_id" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="">None</option>
                  {households.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <Input name="due_at" type="date" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Finding / Notes</label>
                <textarea name="finding" rows={2} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Describe the compliance issue or requirement..." />
              </div>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isPending ? "Creating..." : "Create Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Score Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card className={`group border-gray-200 border-l-4 ${healthBorder} ${healthBg} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-lg ${healthIconBg}`}>
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Health Score</p>
                <p className={`text-3xl font-bold ${healthColor}`}>{healthPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-blue-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <ListChecksIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-emerald-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircleIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangleIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Flagged</p>
                <p className="text-3xl font-bold text-red-600">{flagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "in_review", "approved", "flagged", "closed"].map((key) => {
          const count = key === "all" ? records.length : records.filter(r => r.status === key).length
          const isActive = filter === key
          const pillColors: Record<string, string> = {
            all: isActive ? "bg-gray-800 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200",
            pending: isActive ? "bg-amber-600 text-white shadow-sm" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
            in_review: isActive ? "bg-blue-600 text-white shadow-sm" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
            approved: isActive ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
            flagged: isActive ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
            closed: isActive ? "bg-gray-600 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200",
          }
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${pillColors[key]}`}
            >
              {key === "all" ? "All" : statusConfig[key]?.label ?? key}
              <span className={`ml-1.5 inline-flex size-5 items-center justify-center rounded-full text-xs ${isActive ? "bg-white/20" : "bg-black/5"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Records */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((record) => {
            const cfg = statusConfig[record.status] ?? statusConfig.pending
            const StatusIcon = cfg.icon
            const overdue = record.due_at && record.status !== "approved" && record.status !== "closed" && new Date(record.due_at) < new Date()

            const cardBorderColor = overdue
              ? "border-l-red-500 border-red-200"
              : record.status === "approved"
                ? "border-l-emerald-500 border-gray-200"
                : record.status === "flagged"
                  ? "border-l-red-400 border-gray-200"
                  : record.status === "in_review"
                    ? "border-l-blue-500 border-gray-200"
                    : "border-l-amber-400 border-gray-200"

            return (
              <div key={record.id} className={`group rounded-xl border border-l-4 bg-white p-4 shadow-sm hover:shadow-md transition-all ${cardBorderColor}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${cfg.badgeClass}`}>
                      <StatusIcon className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.record_type}</p>
                      {record.finding && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{record.finding}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        {record.households?.name && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-gray-600 ring-1 ring-inset ring-gray-200">
                            {record.households.name}
                          </span>
                        )}
                        {record.due_at && (
                          <span className={`inline-flex items-center gap-1 ${overdue ? "rounded-md bg-red-50 px-2 py-0.5 font-medium text-red-600 ring-1 ring-inset ring-red-200" : "text-gray-500"}`}>
                            <ClockIcon className="size-3" />
                            Due {new Date(record.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {overdue && " (overdue)"}
                          </span>
                        )}
                        {record.completed_at && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-600 ring-1 ring-inset ring-emerald-200">
                            <CheckCircleIcon className="size-3" />
                            Completed {new Date(record.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <select
                      value={record.status}
                      onChange={(e) => handleStatusChange(record.id, e.target.value)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm ${cfg.badgeClass}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="flagged">Flagged</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => handleDelete(record.id)} className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
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
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShieldCheckIcon className="size-6" />
            </div>
            <div>
              <p className="font-medium text-gray-500">No compliance records found</p>
              <p className="mt-1 text-sm text-gray-400">Create a new record to start tracking compliance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
