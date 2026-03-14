"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipPayloadEntry, TooltipValueType } from "recharts"

import { formatCompactCurrency } from "@/lib/format"

/* ───────────── shared ───────────── */

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316",
]

const STAGE_COLORS: Record<string, string> = {
  qualifying: "#94a3b8",
  proposal: "#3b82f6",
  diligence: "#f59e0b",
  commitment: "#10b981",
  won: "#22c55e",
  lost: "#ef4444",
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "rgba(255,255,255,0.97)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
  fontSize: 13,
}

function tooltipNumber(value: TooltipValueType | undefined) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (Array.isArray(value)) {
    const parsed = Number(value[0])
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

/* ───────────── 1. AUM & Revenue Trend ───────────── */

type TrendData = { month: string; aum: number; revenue: number }

export function AumRevenueTrendChart({ data }: { data: TrendData[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => formatCompactCurrency(v)}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              formatCompactCurrency(tooltipNumber(value)),
              name === "aum" ? "AUM" : "Revenue",
            ]}
            labelStyle={{ color: "#1e293b", fontWeight: 600, marginBottom: 4 }}
            cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs font-medium text-gray-600">
                {value === "aum" ? "Assets Under Management" : "Revenue"}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="aum"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#aumGrad)"
            dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#revGrad)"
            dot={{ r: 3, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ───────────── 2. Asset Allocation Donut ───────────── */

type AllocationItem = { name: string; value: number }

export function AssetAllocationChart({ data }: { data: AllocationItem[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [formatCompactCurrency(tooltipNumber(value)), "Value"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ───────────── 3. Portfolio YTD Performance ───────────── */

type PortfolioPerf = { name: string; ytd: number }

export function PortfolioPerformanceChart({ data }: { data: PortfolioPerf[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.04)" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#374151", fontSize: 12 }}
            width={140}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${tooltipNumber(value).toFixed(1)}%`, "YTD Return"]}
            cursor={{ fill: "rgba(59,130,246,0.04)" }}
          />
          <Bar dataKey="ytd" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.ytd >= 15 ? "#22c55e" : entry.ytd >= 10 ? "#3b82f6" : entry.ytd >= 0 ? "#06b6d4" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ───────────── 4. Pipeline by Stage ───────────── */

type PipelineStage = { stage: string; label: string; value: number; count: number }

export function PipelineStageChart({ data }: { data: PipelineStage[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => formatCompactCurrency(v)}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, _, item: TooltipPayloadEntry) => {
              const count = Number((item.payload as Partial<PipelineStage> | undefined)?.count ?? 0)
              return [
                formatCompactCurrency(tooltipNumber(value)),
                `${count} deal${count === 1 ? "" : "s"}`,
              ]
            }}
            cursor={{ fill: "rgba(59,130,246,0.06)" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
            {data.map((entry, i) => (
              <Cell key={i} fill={STAGE_COLORS[entry.stage] ?? COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ───────────── 5. Household AUM — Horizontal Bar ───────────── */

type HouseholdAum = { name: string; aum: number; fill: string }

export function HouseholdAumChart({ data }: { data: HouseholdAum[] }) {
  const max = data[0]?.aum ?? 1
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = Math.round((item.aum / max) * 100)
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-gray-700">{item.name}</span>
              <span className="shrink-0 text-sm font-semibold text-gray-900">{formatCompactCurrency(item.aum)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ───────────── 6. Task Status — Bar-style breakdown ───────────── */

type TaskStatusItem = { name: string; value: number; color: string }

export function TaskStatusChart({ data }: { data: TaskStatusItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-gray-100">
        {data.map((item) => (
          <div
            key={item.name}
            className="h-full transition-all duration-500"
            style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, backgroundColor: item.color }}
          />
        ))}
      </div>
      {/* Legend rows */}
      <div className="space-y-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              <span className="text-xs text-gray-400">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-sm font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 7. Compliance Health — Score + breakdown ───────────── */

type ComplianceGaugeData = {
  approved: number
  pending: number
  inReview: number
  flagged: number
}

export function ComplianceGaugeChart({ data }: { data: ComplianceGaugeData }) {
  const total = data.approved + data.pending + data.inReview + data.flagged
  const healthPercent = total > 0 ? Math.round((data.approved / total) * 100) : 100
  const gaugeColor = healthPercent >= 80 ? "bg-emerald-500" : healthPercent >= 50 ? "bg-amber-500" : "bg-red-500"
  const gaugeBg = healthPercent >= 80 ? "bg-emerald-50" : healthPercent >= 50 ? "bg-amber-50" : "bg-red-50"
  const gaugeText = healthPercent >= 80 ? "text-emerald-700" : healthPercent >= 50 ? "text-amber-700" : "text-red-700"

  const statusItems = [
    { label: "Approved", value: data.approved, color: "#22c55e" },
    { label: "In Review", value: data.inReview, color: "#3b82f6" },
    { label: "Pending", value: data.pending, color: "#f59e0b" },
    { label: "Flagged", value: data.flagged, color: "#ef4444" },
  ]

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className={`flex items-center justify-between rounded-xl ${gaugeBg} p-4`}>
        <div>
          <p className={`text-3xl font-bold ${gaugeText}`}>{healthPercent}%</p>
          <p className="text-xs text-gray-500">Health Score</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{data.approved}/{total}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${gaugeColor} transition-all duration-500`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      {/* Status rows */}
      <div className="space-y-2.5">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
