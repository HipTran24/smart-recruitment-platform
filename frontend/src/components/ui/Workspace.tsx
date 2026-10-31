import { cloneElement, isValidElement, useId, type ReactNode } from "react"
import { PageHeader } from "./PageHeader"
import { Button } from "./Button"

export function Workspace({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  )
}
export function Panel({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">
      {title && (
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      )}
      {children}
    </section>
  )
}
export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const generatedId = useId()
  const control = isValidElement<{ id?: string }>(children) ? children : null
  const id = control?.props.id ?? generatedId
  return (
    <div className="flex min-w-0 flex-col gap-2 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      {control ? cloneElement(control, { id }) : children}
    </div>
  )
}
export const control =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] shadow-xs focus:border-[var(--color-brand)] disabled:opacity-60"
export function ResourceState({
  resource,
}: {
  resource: {
    loading: boolean
    error: string
    reload: () => void
  }
}) {
  if (resource.loading)
    return (
      <div role="status" className="space-y-3 py-6">
        <span className="text-sm text-[var(--color-text-secondary)]">
          Đang tải dữ liệu…
        </span>
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface-hover)]" />
      </div>
    )
  if (resource.error)
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
      >
        <p>{resource.error}</p>
        <Button variant="secondary" onClick={resource.reload}>
          Thử lại
        </Button>
      </div>
    )
  return null
}
export function Notice({
  text,
  error = false,
}: {
  text: string
  error?: boolean
}) {
  if (!text) return null
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-xl border p-3 text-sm ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {text}
    </p>
  )
}
export const dateTime = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
export function Empty({ text = "Chưa có dữ liệu." }: { text?: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
      {text}
    </p>
  )
}
