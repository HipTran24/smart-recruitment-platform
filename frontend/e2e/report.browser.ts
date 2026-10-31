import { test, expect, type Page } from "@playwright/test"
import { signedIn } from "./fixtures"

function application(
  id: number,
  createdAt: string,
  status: string,
  score: number | null,
  history: string[],
) {
  return {
    id,
    jobId: 10,
    jobTitle: "QA Reporting Job",
    candidateName: `Synthetic Candidate ${id}`,
    candidateEmail: `candidate${id}@example.test`,
    status,
    createdAt,
    screeningScore: score,
    screeningRecommendation: null,
    screeningSummary: null,
    matchedCriteria: null,
    missingCriteria: null,
    histories: history.map((stage) => ({
      fromStatus: null,
      toStatus: stage,
      createdAt,
    })),
  }
}

async function openReport(
  page: Page,
  role = "ROLE_RECRUITER",
) {
  const items = [
    application(
      1, "2026-09-30T17:00:00Z", "IN_REVIEW", 0,
      ["SUBMITTED", "IN_REVIEW", "IN_REVIEW"],
    ),
    application(
      2, "2026-10-01T16:59:59Z", "INTERVIEW", 100,
      ["SUBMITTED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW"],
    ),
    // Đúng endExclusive theo Asia/Bangkok: phải bị loại.
    application(
      3, "2026-10-01T17:00:00Z", "OFFERED", 90,
      ["SUBMITTED", "OFFERED"],
    ),
  ]
  const calls: string[] = []

  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    calls.push(path)

    if (path === "/api/v1/auth/me") {
      return route.fulfill({
        status: 200,
        json: {
          id: 83,
          email: "report@example.test",
          fullName: "Reporting Fixture",
          roles: [role],
        },
      })
    }

    if (path === "/api/v1/recruiter/applications") {
      return route.fulfill({
        status: 200,
        json: {
          items,
          page: 0,
          size: 100,
          totalElements: items.length,
          totalPages: 1,
        },
      })
    }

    return route.fulfill({
      status: 404,
      json: { code: "UNIMPLEMENTED_TEST_ROUTE", message: path },
    })
  })

  await signedIn(page)
  await page.goto(
    "/recruiter/analytics?job=10&from=2026-10-01&to=2026-10-01",
  )
  return calls
}

test("dashboard filters local-day boundaries and deduplicates stages", async ({
  page,
}) => {
  await openReport(page)

  const current = page.locator("#current-title").locator("..")
  const funnel = page.locator("#funnel-title").locator("..")

  await expect(current.getByRole("table")).toBeVisible()

  for (const stage of ["IN_REVIEW", "INTERVIEW"]) {
    const row = current.getByRole("row").filter({
      has: page.getByRole("rowheader", { name: stage, exact: true }),
    })
    await expect(row.getByRole("cell").nth(0)).toHaveText("1")
    await expect(row.getByRole("cell").nth(1)).toHaveText("50.0%")
  }

  const offered = current.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "OFFERED", exact: true }),
  })
  await expect(offered.getByRole("cell").nth(0)).toHaveText("0")

  const reviewed = funnel.getByRole("row").filter({
    has: page.getByRole("rowheader", {
      name: "IN_REVIEW", exact: true,
    }),
  })
  await expect(reviewed.getByRole("cell").nth(0)).toHaveText("2")
  await expect(reviewed.getByRole("cell").nth(1)).toHaveText("100.0%")

  await page.reload()
  await expect(current.getByRole("table")).toBeVisible()
  await expect(reviewed.getByRole("cell").nth(0)).toHaveText("2")
})

for (const role of ["ROLE_CANDIDATE", "ROLE_PLATFORM_ADMIN"]) {
  test(`${role} cannot open recruiter analytics`, async ({ page }) => {
    const calls = await openReport(page, role)

    await expect(page.getByRole("heading", {
      name: /Yêu Cầu Quyền Hạn/,
    })).toBeVisible()
    await expect(page.getByRole("table")).toHaveCount(0)

    expect(calls).not.toContain("/api/v1/recruiter/applications")
  })
}