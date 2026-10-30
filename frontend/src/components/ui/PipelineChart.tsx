import { useEffect, useRef } from "react"

export function PipelineChart({
  counts,
}: {
  counts: { status: string; count: number }[]
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false
    let chart: { destroy(): void } | undefined
    import("chart.js/auto")
      .then(({ default: Chart }) => {
        if (cancelled || !canvas.current) return
        chart = new Chart(canvas.current, {
          type: "bar",
          data: {
            labels: counts.map((item) => item.status),
            datasets: [
              {
                label: "Số hồ sơ",
                data: counts.map((item) => item.count),
                backgroundColor: "#2563eb",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        })
      })
      .catch(() => {
        /* The accessible data table remains available if canvas cannot load. */
      })
    return () => {
      cancelled = true
      chart?.destroy()
    }
  }, [counts])
  return (
    <div className="relative h-64 min-w-0">
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  )
}
