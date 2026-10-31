import { test, expect, type Page } from "@playwright/test"
import { signedIn } from "./fixtures"

function application(
  id: number,
  name: string,
  score: number | null,
) {
  return {
    id,
    jobId: 10,
    jobTitle: "QA Backend Intern",
    candidateName: name,
    candidateEmail: `candidate${id}@example.test`,
    status: "SUBMITTED",
    createdAt: "2026-10-01T00:00:00Z",
    screeningScore: score,
    screeningRecommendation: score === null ? null : "REVIEW",
    screeningSummary:
      score === null ? null : "Synthetic analysis for Candidate Alpha.",
    matchedCriteria: score === null ? null : JSON.stringify(["Java", "Git"]),
    missingCriteria: score === null ? null : JSON.stringify(["SQL"]),
    histories: [],
  }
}

async function mockPipeline(
  page: Page,
  items: ReturnType<typeof application>[],
  options: { failFirst?: boolean } = {},
) {
  let listCalls = 0

  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname

    if (path === "/api/v1/auth/me") {
      return route.fulfill({
        status: 200,
        json: {
          id: 84,
          email: "scrum84.recruiter@example.test",
          fullName: "SCRUM84 Recruiter",
          roles: ["ROLE_RECRUITER"],
        },
      })
    }

    if (
      path === "/api/v1/recruiter/applications" &&
      route.request().method() === "GET"
    ) {
      listCalls++

      if (options.failFirst && listCalls === 1) {
        return route.fulfill({
          status: 503,
          json: {
            code: "UNAVAILABLE",
            message: "Synthetic API failure",
          },
        })
      }

      return route.fulfill({
        status: 200,
        json: {
          items,
          page: 0,
          size: 100,
          totalElements: items.length,
          totalPages: items.length ? 1 : 0,
        },
      })
    }

    return route.fulfill({
      status: 404,
      json: {
        code: "UNIMPLEMENTED_TEST_ROUTE",
        message: path,
      },
    })
  })

  await signedIn(page)
  await page.goto("/recruiter/candidates")
}

test("matching result belongs to the selected application", async ({
  page,
}) => {
  await mockPipeline(page, [
    application(1, "Candidate Alpha", 85),
    application(2, "Candidate Beta", null),
  ])

  const row = page.getByRole("row").filter({ hasText: "Candidate Alpha" })
  await expect(row.getByRole("cell", { name: "85%", exact: true }))
    .toBeVisible()
  await expect(row.getByRole("cell", { name: "Java, Git", exact: true }))
    .toBeVisible()

  await row.getByRole("button", {
    name: "Xem / cập nhật Candidate Alpha",
  }).click()

  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("heading", {
    name: "Hồ sơ: Candidate Alpha",
  })).toBeVisible()
  await expect(dialog.getByText(
    "Synthetic analysis for Candidate Alpha.",
    { exact: true },
  )).toBeVisible()
  await expect(dialog.getByText("Khuyến nghị: REVIEW", {
    exact: true,
  })).toBeVisible()
  await expect(dialog.getByText("Tiêu chí còn thiếu: SQL", {
    exact: true,
  })).toBeVisible()
})

test("zero score is distinct from missing analysis", async ({ page }) => {
  await mockPipeline(page, [
    application(1, "Candidate Zero", 0),
    application(2, "Candidate Missing", null),
  ])

  const zeroRow = page.getByRole("row").filter({
    hasText: "Candidate Zero",
  })
  const missingRow = page.getByRole("row").filter({
    hasText: "Candidate Missing",
  })

  await expect(zeroRow.getByRole("cell", {
    name: "0%",
    exact: true,
  })).toBeVisible()
  await expect(missingRow.getByRole("cell", {
    name: "Chưa có điểm",
    exact: true,
  })).toBeVisible()

  await missingRow.getByRole("button", {
    name: "Xem / cập nhật Candidate Missing",
  }).click()

  await expect(page.getByRole("dialog").getByText(
    "Chưa có kết quả phân tích.",
    { exact: true },
  )).toBeVisible()
})

test("API failure shows an error and retry loads the result", async ({
  page,
}) => {
  await mockPipeline(
    page,
    [application(1, "Candidate Alpha", 85)],
    { failFirst: true },
  )

  await expect(page.getByRole("alert")).toContainText(
    "Không tải được hồ sơ",
  )
  await expect(page.getByRole("table")).toHaveCount(0)

  await page.getByRole("button", {
    name: "Thử lại",
    exact: true,
  }).click()

  await expect(page.getByRole("cell", {
    name: "85%",
    exact: true,
  })).toBeVisible()
  await expect(page.getByRole("alert")).toHaveCount(0)
})

for (const score of [-1, 101]) {
  test(`invalid matching score ${score} is rejected`, async ({ page }) => {
    await mockPipeline(page, [
      application(1, "Candidate Invalid", score),
    ])

    await expect(page.getByRole("alert")).toContainText(
      "Không tải được hồ sơ",
    )
    await expect(page.getByRole("table")).toHaveCount(0)
    await expect(page.getByRole("button", {
      name: "Xem / cập nhật Candidate Invalid",
    })).toHaveCount(0)
  })
}