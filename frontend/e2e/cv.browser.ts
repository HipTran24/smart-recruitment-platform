import { test, expect } from "@playwright/test"
import { signedIn } from "./fixtures"

test("candidate CV page provides a file selection control", async ({
  page,
}) => {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname

    if (path === "/api/v1/auth/me") {
      return route.fulfill({
        status: 200,
        json: {
          id: 84,
          email: "scrum84.candidate@example.test",
          fullName: "SCRUM84 Candidate",
          roles: ["ROLE_CANDIDATE"],
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
  await page.goto("/profile-resume")

  await expect(
    page.getByRole("heading", {
      name: "My Profile & Resume",
      exact: true,
    }),
  ).toBeVisible()

  // Input có thể bị ẩn nếu giao diện dùng dropzone.
  // Kiểm tra tồn tại trong DOM, không yêu cầu visible.
  const fileInput = page.locator('input[type="file"]')

  await expect(
    fileInput,
    "Candidate phải có control chọn file CV để bắt đầu upload",
  ).toHaveCount(1)

  await expect(fileInput).toBeEnabled()
})