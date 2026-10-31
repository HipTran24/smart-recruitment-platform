import { useEffect, useState } from "react"
import {
  workspaceService,
  type ScreeningStatus,
} from "../services/workspace.service"

/** Read persisted states in bounded batches, including after reload or transient network errors. */
export function useScreeningProgress(ids: number[]) {
  const key = ids.join(",")
  const [runs, setRuns] = useState<Record<number, ScreeningStatus>>({})
  const [error, setError] = useState("")
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const applicationIds = key ? key.split(",").map(Number) : []
    setRuns({})
    async function poll() {
      try {
        const next: Record<number, ScreeningStatus> = {}
        for (let offset = 0; offset < applicationIds.length; offset += 100) {
          Object.assign(
            next,
            await workspaceService.screeningStatuses(
              applicationIds.slice(offset, offset + 100),
              controller.signal,
            ),
          )
        }
        if (!controller.signal.aborted) {
          setRuns(next)
          setError("")
        }
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "Không tải được tiến trình. Hệ thống đang kết nối lại.",
          )
      } finally {
        // Reschedule even after a failed poll. A single network error must not freeze progress.
        if (!controller.signal.aborted && applicationIds.length)
          timer = setTimeout(() => void poll(), 5000)
      }
    }
    if (applicationIds.length) void poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [key])
  return { runs, setRuns, error }
}
