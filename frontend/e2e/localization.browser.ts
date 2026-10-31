import { test, expect } from "@playwright/test"
import { fixtureApi, signedIn } from "./fixtures"

test("Vietnamese dossier labels preserve API recommendation codes", async ({
  page,
}) => {
  const notes = "Đã kiểm chứng kinh nghiệm Java trong CV."
  const evaluations: {
    id: number
    score: number
    recommendation: string
    technicalNotes: string
  }[] = []
  const writes: unknown[] = []
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, json: body })
    if (path === "/api/v1/auth/me")
      return json({
        id: 99,
        fullName: "Nhà tuyển dụng",
        email: "test@example.test",
        roles: ["ROLE_RECRUITER"],
      })
    if (path === "/api/v1/recruiter/applications/71")
      return json({
        id: 71,
        jobId: 3,
        jobTitle: "Kỹ sư Java",
        candidateName: "Ứng viên kiểm thử",
        candidateEmail: "uv@example.test",
        status: "SUBMITTED",
        createdAt: "2026-10-31T08:00:00Z",
        screeningScore: 65,
        screeningSummary: "Ứng viên có kinh nghiệm Java và Spring Boot.",
        matchedCriteria: '["Java"]',
        missingCriteria: '["SQL"]',
        histories: [],
      })
    if (path === "/api/v1/recruiter/applications/71/screening")
      return json({
        id: 1,
        status: "COMPLETED",
        score: 65,
        summary: "Ứng viên có kinh nghiệm Java và Spring Boot.",
        failureCode: null,
      })
    if (path === "/api/v1/recruiter/applications/71/evaluations") {
      if (request.method() === "POST") {
        const value = request.postDataJSON()
        writes.push(value)
        const evaluation = { id: 1, ...value }
        evaluations.push(evaluation)
        return json(evaluation, 201)
      }
      return json(evaluations)
    }
    return json({ message: path }, 404)
  })
  await signedIn(page)
  await page.goto("/recruiter/candidates/71")
  await expect(
    page.getByRole("heading", { name: "Hồ sơ ứng viên", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Trạng thái: Đã hoàn tất", { exact: true }),
  ).toBeVisible()
  const recommendation = page.getByLabel("Khuyến nghị của người đánh giá", {
    exact: true,
  })
  await expect(recommendation).toHaveValue("NEUTRAL")
  await expect(recommendation.locator("option:checked")).toHaveText("Trung lập")
  await recommendation.selectOption({ label: "Chưa phù hợp" })
  await page.getByLabel("Nhận xét chuyên môn", { exact: true }).fill(notes)
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(
    page.getByText("Đã lưu đánh giá.", { exact: true }),
  ).toBeVisible()
  expect(writes).toEqual([
    { score: 50, recommendation: "NO", technicalNotes: notes },
  ])
})

test("bulk screening can select and clear all eligible applications", async ({
  page,
}) => {
  await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/candidates/screening")
  await page.getByRole("button", { name: "Chọn tất cả", exact: true }).click()
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(2)
  await expect(
    page.getByRole("button", { name: "Phân tích 2 hồ sơ", exact: true }),
  ).toBeEnabled()
  await page
    .getByRole("button", { name: "Bỏ chọn tất cả", exact: true })
    .click()
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0)
})
