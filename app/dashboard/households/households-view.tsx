"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CalendarIcon,
  HomeIcon,
  LandmarkIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
  WalletIcon,
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
import { formatCompactCurrency } from "@/lib/format"

import { deleteHousehold } from "./actions"
import { HouseholdForm } from "./household-form"

type HouseholdRow = {
  id: string
  name: string
  segment: string
  total_aum: number
  risk_profile: string | null
  status: string
  next_review_date: string | null
  notes: string | null
  advisor_id: string | null
  created_at: string
}

const statusTone: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  review_due: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
}

const segmentTone: Record<string, string> = {
  hnw: "bg-violet-50 text-violet-700 border-violet-200",
  uhnw: "bg-indigo-50 text-indigo-700 border-indigo-200",
  mass_affluent: "bg-blue-50 text-blue-700 border-blue-200",
  retail: "bg-gray-50 text-gray-600 border-gray-200",
}

function isReviewDue(nextReviewDate: string | null) {
  if (!nextReviewDate) {
    return false
  }

  const reviewDate = new Date(nextReviewDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  return reviewDate >= today && reviewDate <= thirtyDaysFromNow
}

export function HouseholdsView({ households }: { households: HouseholdRow[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editHousehold, setEditHousehold] = useState<HouseholdRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const summary = useMemo(() => {
    const totalAum = households.reduce(
      (sum, household) => sum + Number(household.total_aum),
      0,
    )
    const activeCount = households.filter(
      (household) => household.status === "active",
    ).length
    const reviewDueCount = households.filter((household) =>
      isReviewDue(household.next_review_date),
    ).length
    const averageAum =
      households.length > 0 ? Math.round(totalAum / households.length) : 0

    return { totalAum, activeCount, reviewDueCount, averageAum }
  }, [households])

  function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this household? Linked clients, portfolios, tasks, and opportunities may also be removed.",
      )
    ) {
      return
    }

    setDeletingId(id)
    startTransition(async () => {
      await deleteHousehold(id)
      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Households
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Core client groupings that power portfolios, tasks, compliance, and
            pipeline.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Household
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Household</DialogTitle>
              <DialogDescription>
                Add a new relationship group before onboarding clients or
                portfolios.
              </DialogDescription>
            </DialogHeader>
            <HouseholdForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editHousehold)}
        onOpenChange={(open) => !open && setEditHousehold(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Household</DialogTitle>
            <DialogDescription>
              Update servicing, segmentation, and review details.
            </DialogDescription>
          </DialogHeader>
          {editHousehold ? (
            <HouseholdForm
              household={editHousehold}
              onClose={() => setEditHousehold(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Summary stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group border-l-4 border-l-blue-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Households</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {households.length}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <HomeIcon className="size-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-emerald-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total AUM</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCompactCurrency(summary.totalAum)}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                <LandmarkIcon className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-violet-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Relationships</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {summary.activeCount}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50">
                <UsersIcon className="size-5 text-violet-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-l-4 border-l-amber-500 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Reviews Due in 30 Days</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {summary.reviewDueCount}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50">
                <CalendarIcon className="size-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {households.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="pl-4 font-semibold text-gray-700">Household</TableHead>
                <TableHead className="font-semibold text-gray-700">Segment</TableHead>
                <TableHead className="font-semibold text-gray-700">AUM</TableHead>
                <TableHead className="font-semibold text-gray-700">Risk</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Next Review</TableHead>
                <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                <TableHead className="w-20 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {households.map((household) => (
                <TableRow key={household.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200/50">
                        <WalletIcon className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {household.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Added{" "}
                          {new Date(household.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        segmentTone[household.segment] ?? "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {household.segment.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums text-gray-900">
                    {formatCompactCurrency(Number(household.total_aum))}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {household.risk_profile ?? (
                        <span className="italic text-gray-400">Not set</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        statusTone[household.status] ?? ""
                      }`}
                    >
                      {household.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {household.next_review_date ? (
                      <span
                        className={`text-sm ${
                          isReviewDue(household.next_review_date)
                            ? "font-medium text-amber-600"
                            : "text-gray-600"
                        }`}
                      >
                        {new Date(household.next_review_date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-gray-500">
                    {household.notes ? (
                      <span className="line-clamp-2">{household.notes}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditHousehold(household)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(household.id)}
                        disabled={deletingId === household.id}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-50">
            <HomeIcon className="size-6 text-gray-300" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No households yet</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            Create your first relationship group to unlock clients, portfolios,
            tasks, and pipeline.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-4 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-1.5 size-4" /> Add Household
          </Button>
        </div>
      )}
    </div>
  )
}
