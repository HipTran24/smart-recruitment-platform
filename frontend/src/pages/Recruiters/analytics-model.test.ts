import { describe, it, expect } from "vitest"
import {
  cohort,
  reachedCounts,
  statusCounts,
  validDay,
} from "./analytics-model"
import type { PipelineApplication } from "../../services/recruiter-pipeline.service"
const items = [
  {
    id: 1,
    jobId: 1,
    status: "INTERVIEW",
    createdAt: "2026-10-02T12:00:00Z",
    histories: [
      { fromStatus: "SUBMITTED", toStatus: "IN_REVIEW" },
      { fromStatus: "IN_REVIEW", toStatus: "INTERVIEW" },
    ],
  },
  {
    id: 2,
    jobId: 2,
    status: "SUBMITTED",
    createdAt: "2026-10-10T12:00:00Z",
    histories: [],
  },
] as unknown as PipelineApplication[]
describe("analytics cohort definitions", () => {
  it("filters by submitted date and job together", () => {
    expect(
      cohort(items, "1", "2026-10-01", "2026-10-03").map((item) => item.id),
    ).toEqual([1])
  })
  it("returns empty cohorts without substituting fixtures", () => {
    expect(cohort(items, "3", "", "")).toEqual([])
  })
  it("counts current status separately from recorded historical steps", () => {
    expect(
      statusCounts(items).find((item) => item.status === "IN_REVIEW")?.count,
    ).toBe(0)
    expect(
      reachedCounts(items).find((item) => item.status === "IN_REVIEW")?.count,
    ).toBe(1)
    expect(
      reachedCounts(items).find((item) => item.status === "SHORTLISTED")?.count,
    ).toBe(0)
  })
  it("rejects malformed and impossible dates", () => {
    expect(validDay("2026-02-31")).toBe(false)
    expect(validDay("invalid")).toBe(false)
    expect(validDay("2026-10-30")).toBe(true)
    expect(validDay("")).toBe(true)
  })
})
