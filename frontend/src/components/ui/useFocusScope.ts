import { useEffect, useRef } from "react"

export function useFocusScope(active: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    if (!active || !ref.current) return
    const root = ref.current
    const previous = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const controls = () =>
      [
        ...root.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (element) =>
          !element.closest("[hidden],[inert]") &&
          getComputedStyle(element).display !== "none" &&
          getComputedStyle(element).visibility !== "hidden",
      )
    const first = () => (controls()[0] ?? root).focus()
    first()
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      }
      if (event.key !== "Tab") return
      const list = controls()
      const index = list.indexOf(document.activeElement as HTMLElement)
      if (!list.length) {
        event.preventDefault()
        root.focus()
      } else if (event.shiftKey && index <= 0) {
        event.preventDefault()
        list[list.length - 1].focus()
      } else if (!event.shiftKey && (index === list.length - 1 || index < 0)) {
        event.preventDefault()
        list[0].focus()
      }
    }
    function focusin(event: FocusEvent) {
      if (!root.contains(event.target as Node)) first()
    }
    document.addEventListener("keydown", keydown)
    document.addEventListener("focusin", focusin)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("focusin", focusin)
      document.body.style.overflow = oldOverflow
      if (previous?.isConnected) previous.focus()
    }
  }, [active])
  return ref
}
