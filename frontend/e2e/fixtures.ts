import { type Page } from "@playwright/test"
export const tokens = {
  accessToken: "synthetic-access",
  refreshToken: "synthetic-refresh",
  tokenType: "Bearer",
  accessTokenExpiresAt: "2099-01-01T00:00:00Z",
  refreshTokenExpiresAt: "2099-02-01T00:00:00Z",
}
export async function signedIn(page: Page) {
  await page.addInitScript(
    (value) => sessionStorage.setItem("sr_auth_session", JSON.stringify(value)),
    tokens,
  )
}
export async function fixtureApi(
  page: Page,
  options: { empty?: boolean failList?: boolean failMutation?: boolean } = {},
) {
  const applications = options.empty
    ? []
    : [
        {
          id: 1,
          jobId: 10,
          jobTitle: "Frontend Engineer",
          candidateName: "Ứng viên Tổng hợp A",
          candidateEmail: "a@example.test",
          status: "SUBMITTED",
          createdAt: "2026-10-02T12:00:00Z",
          screeningScore: null,
          screeningRecommendation: null,
          screeningSummary: null,
          matchedCriteria: null,
          missingCriteria: null,
          histories: [
            {
              fromStatus: null,
              toStatus: "SUBMITTED",
              createdAt: "2026-10-02T12:00:00Z",
            },
          ],
        },
        {
          id: 2,
          jobId: 20,
          jobTitle: "Backend Engineer",
          candidateName: "Ứng viên Tổng hợp B",
          candidateEmail: "b@example.test",
          status: "INTERVIEW",
          createdAt: "2026-10-15T12:00:00Z",
          screeningScore: 0,
          screeningRecommendation: "REVIEW",
          screeningSummary: "Cần đánh giá thủ công.",
          matchedCriteria: '["Java"]',
          missingCriteria: '["SQL"]',
          histories: [
            {
              fromStatus: "SUBMITTED",
              toStatus: "INTERVIEW",
              createdAt: "2026-10-17T12:00:00Z",
            },
          ],
        },
      ]
  let read = false
  const calls: { url: string method: string body: unknown }[] = []
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    calls.push({
      url: request.url(),
      method: request.method(),
      body: request.postData() ? request.postDataJSON() : null,
    })
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, json: body })
    if (path === "/api/v1/auth/login") return json(tokens)
    if (path === "/api/v1/auth/me")
      return json({
        id: 99,
        fullName: "Recruiter Test",
        email: "recruiter@example.test",
        roles: ["ROLE_RECRUITER"],
      })
    if (path === "/api/v1/recruiter/applications") {
      if (options.failList)
        return json(
          { message: "Synthetic unavailable", code: "UNAVAILABLE" },
          503,
        )
      const status = url.searchParams.get("status")
      const job = url.searchParams.get("jobId")
      const filtered = applications.filter(
        (item) =>
          (!status || item.status === status) &&
          (!job || item.jobId === Number(job)),
      )
      const pageIndex = Number(url.searchParams.get("page") ?? 0)
      const size = Number(url.searchParams.get("size") ?? 20)
      return json({
        items: filtered.slice(pageIndex * size, (pageIndex + 1) * size),
        page: pageIndex,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
      })
    }
    if (/\/recruiter\/applications\/\d+\/transitions$/.test(path)) {
      if (options.failMutation)
        return json({ code: "CONFLICT", message: "Synthetic conflict" }, 409)
      const id = Number(path.split("/").at(-2))
      const item = applications.find((app) => app.id === id)!
      item.status = request.postDataJSON().stage
      return json(item)
    }
    if (path === "/api/v1/notifications")
      return json({
        items: options.empty
          ? []
          : [
              {
                id: 1,
                title: "Cập nhật hồ sơ tổng hợp",
                message: "Một hồ sơ cần xem xét.",
                type: "INFO",
                read,
                createdAt: "2026-10-30T05:00:00Z",
                actionUrl: "/recruiter/candidates",
              },
            ],
        unreadCount: options.empty || read ? 0 : 1,
      })
    if (path.endsWith("/read") || path.endsWith("/read-all")) {
      if (options.failMutation)
        return json({ code: "CONFLICT", message: "Synthetic conflict" }, 409)
      read = true
      return json({ message: "OK" })
    }
    return json({ code: "UNIMPLEMENTED_TEST_ROUTE", message: path }, 404)
  })
  return calls
}
