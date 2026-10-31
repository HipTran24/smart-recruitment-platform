import { test, expect, type Page } from "@playwright/test"
import { signedIn } from "./fixtures"

function application(id: number) {
  return {
    id,
    jobId: 3,
    jobTitle: "Java",
    candidateName: `Ứng viên ${id}`,
    candidateEmail: `cv${id}@example.test`,
    status: "SUBMITTED",
    createdAt: "2026-10-31T12:00:00Z",
    screeningScore: null,
    histories: [],
  }
}

async function api(
  page: Page,
  count: number,
  options: {
    failPoll?: boolean
    quota?: boolean
    withdrawnLast?: boolean
  } = {},
) {
  const items = Array.from({ length: count }, (_, index) =>
    application(index + 1),
  )
  if (options.withdrawnLast) items[items.length - 1].status = "WITHDRAWN"
  const posted: number[] = []
  let polls = 0
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname
    const json = (body: unknown, status = 200) =>
      route.fulfill({ json: body, status })
    if (path === "/api/v1/auth/me")
      return json({
        id: 1,
        email: "hr@example.test",
        fullName: "Nhà tuyển dụng",
        roles: ["ROLE_RECRUITER"],
      })
    if (path === "/api/v1/recruiter/applications") {
      const pageIndex = Number(url.searchParams.get("page") ?? 0),
        size = Number(url.searchParams.get("size") ?? 100)
      return json({
        items: items.slice(pageIndex * size, (pageIndex + 1) * size),
        page: pageIndex,
        size,
        totalElements: count,
        totalPages: Math.ceil(count / size),
      })
    }
    if (path === "/api/v1/recruiter/screening-statuses") {
      polls++
      if (options.failPoll && polls === 1)
        return json(
          { message: "Mất kết nối tạm thời", code: "UNAVAILABLE" },
          503,
        )
      const ids = (url.searchParams.get("ids") ?? "").split(",").map(Number)
      expect(ids.length).toBeLessThanOrEqual(100)
      return json(
        Object.fromEntries(
          ids.map((id) => [
            id,
            {
              id,
              status:
                options.quota && id === count
                  ? "WAITING_QUOTA"
                  : options.failPoll || posted.includes(id) || options.quota
                    ? "COMPLETED"
                    : "NOT_STARTED",
              score: options.quota && id === count ? null : id === 1 ? 0 : 60,
              summary: null,
              failureCode:
                options.quota && id === count
                  ? "PROVIDER_QUOTA_EXHAUSTED"
                  : null,
              nextAttemptAt:
                options.quota && id === count ? "2026-11-01T07:00:05Z" : null,
            },
          ]),
        ),
      )
    }
    if (
      /\/applications\/\d+\/screening$/.test(path) &&
      request.method() === "POST"
    ) {
      const id = Number(path.split("/").at(-2))
      posted.push(id)
      return json(
        {
          id,
          status: "PENDING",
          score: null,
          summary: null,
          failureCode: null,
        },
        202,
      )
    }
    return json({ message: path }, 404)
  })
  await signedIn(page)
  return posted
}

test("screening title, completion count and persisted quota states survive reload", async ({
  page,
}) => {
  await api(page, 3, { quota: true })
  await page.goto("/recruiter/candidates/screening")
  await expect(
    page.getByRole("heading", { name: "Sàng lọc CV", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Đã hoàn tất 2/3 hồ sơ (67%)" }),
  ).toBeVisible()
  await expect(
    page.getByText("Đã hoàn tất · 0%", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Đang chờ hạn mức AI", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("main")).not.toContainText("Gemini")
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Đã hoàn tất 2/3 hồ sơ (67%)" }),
  ).toBeVisible()
  await expect(
    page.getByText("Đang chờ hạn mức AI", { exact: true }),
  ).toBeVisible()
})

test("progress polling recovers automatically after a transient failure", async ({
  page,
}) => {
  await api(page, 1, { failPoll: true })
  await page.goto("/recruiter/candidates/screening")
  await expect(page.getByRole("alert")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Đã hoàn tất 1/1 hồ sơ (100%)" }),
  ).toBeVisible({ timeout: 12000 })
  await expect(page.getByRole("alert")).toHaveCount(0)
})

test("select all submits every application across API and display pages", async ({
  page,
}) => {
  const posted = await api(page, 101)
  await page.goto("/recruiter/candidates/screening")
  await page.getByRole("button", { name: "Chọn tất cả", exact: true }).click()
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(50)
  await page
    .getByRole("button", { name: "Phân tích 101 hồ sơ", exact: true })
    .click()
  await expect.poll(() => posted.length).toBe(101)
  expect(new Set(posted).size).toBe(101)
  await expect(
    page.getByRole("heading", { name: "Đã hoàn tất 101/101 hồ sơ (100%)" }),
  ).toBeVisible({ timeout: 12000 })
  await page.getByRole("button", { name: "Trang sau", exact: true }).click()
  await page.getByRole("button", { name: "Trang sau", exact: true }).click()
  await expect(page.getByText("Ứng viên 101", { exact: true })).toBeVisible()
})

test("withdrawn applications have a clear label and are excluded from screening", async ({ page }) => {
  await api(page, 3, { withdrawnLast: true })
  await page.goto("/recruiter/candidates/screening")
  await expect(page.getByText("Đã rút hồ sơ", { exact: true })).toBeVisible()
  await expect(page.getByRole("checkbox", { name: /Ứng viên 3/ })).toBeDisabled()
  await expect(page.getByRole("heading", { name: "Đã hoàn tất 0/2 hồ sơ (0%)", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Chọn tất cả", exact: true }).click()
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(2)
  await expect(page.getByRole("button", { name: "Phân tích 2 hồ sơ", exact: true })).toBeEnabled()
})
