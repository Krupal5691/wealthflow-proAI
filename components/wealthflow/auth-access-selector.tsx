import {
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type AuthAccessMode = "advisor" | "investor"

type AuthAccessModeConfig = {
  description: string
  emailPlaceholder: string
  helper: string
  icon: LucideIcon
  landingLabel: string
  title: string
}

export const authAccessModeCopy: Record<AuthAccessMode, AuthAccessModeConfig> = {
  advisor: {
    title: "Advisor Workspace",
    description: "For advisors, relationship managers, and operations teams.",
    helper: "CRM, portfolios, compliance, and firm operations.",
    emailPlaceholder: "advisor@wealthflow.pro",
    icon: LayoutDashboardIcon,
    landingLabel: "Dashboard",
  },
  investor: {
    title: "Investor Portal",
    description: "For investors and household members reviewing plans and updates.",
    helper: "Documents, meetings, portfolio snapshots, and requests.",
    emailPlaceholder: "investor@example.com",
    icon: UsersIcon,
    landingLabel: "Portal",
  },
}

const authAccessModes: AuthAccessMode[] = ["advisor", "investor"]

export function getDefaultAuthAccessMode(redirect: string | null): AuthAccessMode {
  return redirect?.startsWith("/client") ? "investor" : "advisor"
}

export function getAuthRedirectTarget(
  redirect: string | null,
  accessMode: AuthAccessMode,
) {
  if (redirect && redirect.startsWith("/")) {
    return redirect
  }

  return accessMode === "investor" ? "/client" : "/dashboard"
}

export function AuthAccessSelector({
  accessMode,
  intent,
  onChange,
  requestedRedirect,
}: {
  accessMode: AuthAccessMode
  intent: "sign-in" | "sign-up"
  onChange: (mode: AuthAccessMode) => void
  requestedRedirect?: string | null
}) {
  const bodyCopy =
    intent === "sign-up"
      ? "Start with the access path that matches this account."
      : "Continue to the workspace that matches this account."
  const noteCopy = requestedRedirect
    ? "After authentication, you'll return to the page you originally requested."
    : intent === "sign-up"
      ? "You can switch between advisor and investor views after signing in."
      : "You can switch between the advisor workspace and investor portal after signing in."

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(145deg,rgba(248,250,252,0.98),rgba(239,246,255,0.92))] p-3 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
      <div className="mb-3 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-[rgb(22,36,54)]">
            {intent === "sign-up" ? "Create access" : "Choose access"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{bodyCopy}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          <ShieldCheckIcon className="size-3.5" />
          {intent === "sign-up" ? "New Access" : "Returning Access"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {authAccessModes.map((mode) => {
          const option = authAccessModeCopy[mode]
          const Icon = option.icon
          const isSelected = accessMode === mode

          return (
            <button
              key={mode}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(mode)}
              className={`group rounded-[1.35rem] border p-4 text-left transition-all ${
                isSelected
                  ? "border-[rgb(22,36,54)] bg-[linear-gradient(155deg,rgb(22,36,54),rgb(34,61,97))] text-white shadow-[0_24px_45px_-30px_rgba(15,23,42,0.85)]"
                  : "border-slate-200 bg-white/85 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-2xl ${
                    isSelected
                      ? "bg-white/15 text-white"
                      : "bg-slate-900/5 text-slate-700"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                    isSelected
                      ? "bg-white/12 text-blue-100"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {option.landingLabel}
                </span>
              </div>

              <p
                className={`mt-4 text-sm font-semibold ${
                  isSelected ? "text-white" : "text-[rgb(22,36,54)]"
                }`}
              >
                {option.title}
              </p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  isSelected ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {option.description}
              </p>
              <p
                className={`mt-3 text-xs font-medium ${
                  isSelected ? "text-blue-100" : "text-blue-700"
                }`}
              >
                {option.helper}
              </p>
            </button>
          )
        })}
      </div>

      <p className="mt-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm text-slate-600">
        {noteCopy}
      </p>
    </div>
  )
}
