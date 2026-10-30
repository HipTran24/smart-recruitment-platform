import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../lib/api"
import {
  criteriaList,
  recruiterPipelineService,
  type PipelineApplication,
} from "./recruiter-pipeline.service"
vi.mock("../lib/api", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }))
const item = (id: number) =>
  ({
    id,
    jobId: 1,
    status: "SUBMITTED",
    createdAt: "2026-10-02T00:00:00Z",
    screeningScore: null,
  }) as PipelineApplication
beforeEach(() => vi.clearAllMocks())
describe("recruiter wire contract", () => {
  it("passes status and canonical paging to the list endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      items: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    })
    await recruiterPipelineService.list({ status: "IN_REVIEW", page: 0 })
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/recruiter/applications",
      expect.objectContaining({
        auth: true,
        params: { status: "IN_REVIEW", page: 0 },
      }),
    )
  })
  it("posts the actual transition contract", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 7, status: "IN_REVIEW" })
    await recruiterPipelineService.transition(7, "IN_REVIEW", "Reviewed")
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/recruiter/applications/7/transitions",
      { stage: "IN_REVIEW", note: "Reviewed" },
      { auth: true },
    )
  })
  it("loads all pages rather than using the first page as a total", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        items: [item(1)],
        totalPages: 2,
        totalElements: 2,
      })
      .mockResolvedValueOnce({
        items: [item(2)],
        totalPages: 2,
        totalElements: 2,
      })
    const result = await recruiterPipelineService.all(
      new AbortController().signal,
    )
    expect(result.map((app) => app.id)).toEqual([1, 2])
  })
  it("rejects a changing dataset instead of showing partial KPIs", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        items: [item(1)],
        totalPages: 2,
        totalElements: 2,
      })
      .mockResolvedValueOnce({
        items: [item(2)],
        totalPages: 2,
        totalElements: 3,
      })
    await expect(
      recruiterPipelineService.all(new AbortController().signal),
    ).rejects.toThrow("đã thay đổi")
  })
  it("rejects duplicate/partial pages", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        items: [item(1)],
        totalPages: 2,
        totalElements: 2,
      })
      .mockResolvedValueOnce({
        items: [item(1)],
        totalPages: 2,
        totalElements: 2,
      })
    await expect(
      recruiterPipelineService.all(new AbortController().signal),
    ).rejects.toThrow("chưa đầy đủ")
  })
  it("does not fetch unbounded datasets", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      items: [],
      totalPages: 101,
      totalElements: 10001,
    })
    await expect(
      recruiterPipelineService.all(new AbortController().signal),
    ).rejects.toThrow("quá nhiều")
    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })
  it("handles JSON and legacy criteria without HTML interpretation", () => {
    expect(criteriaList('["React","<script>text</script>"]')).toEqual([
      "React",
      "<script>text</script>",
    ])
    expect(criteriaList("Legacy criterion")).toEqual(["Legacy criterion"])
    expect(criteriaList(null)).toEqual([])
  })
  it("rejects out-of-range scores instead of displaying a misleading ranking", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      items: [{ ...item(1), screeningScore: 999 }],
      totalPages: 1,
      totalElements: 1,
    })
    await expect(recruiterPipelineService.list()).rejects.toThrow(
      "không hợp lệ",
    )
  })
})
