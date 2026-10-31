import { useId } from "react"
import { useFocusScope } from "./useFocusScope"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  width?: string
  side?: "right" | "left"
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  width = "w-96 max-w-full",
  side = "right",
}: DrawerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const scope = useFocusScope(open, onClose)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      ref={scope}
      tabIndex={-1}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Panel"}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 bottom-0 ${
          side === "right" ? "right-0" : "left-0"
        } ${width} bg-[var(--color-surface)] ${
          side === "right" ? "border-l" : "border-r"
        } border-[var(--color-border)] shadow-2xl flex flex-col z-10 text-[var(--color-text-primary)]`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]/30">
          <div>
            <h2
              id={titleId}
              className="text-sm font-semibold text-[var(--color-text-primary)]"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="text-xs text-[var(--color-text-secondary)] mt-0.5"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
