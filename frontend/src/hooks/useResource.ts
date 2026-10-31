import { useEffect, useState } from "react"

export function useResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setData(undefined)
    load(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setData(value)
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Không tải được dữ liệu.",
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [...dependencies, revision])
  return {
    data,
    error,
    loading,
    reload: () => setRevision((value) => value + 1),
  }
}
