import { useEffect, useState } from "react"
export function useDesktop() {
  const [desktop, setDesktop] = useState(
    () => window.matchMedia?.("(min-width: 1024px)").matches ?? false,
  )
  useEffect(() => {
    const media = window.matchMedia?.("(min-width: 1024px)")
    if (!media) return
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return desktop
}
