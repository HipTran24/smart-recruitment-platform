import { test, expect, type Page } from "@playwright/test"

const syntheticTokens = {
  accessToken: "scrum84-synthetic-access",
  refreshToken: "scrum84-synthetic-refresh",
  tokenType: "Bearer",
  accessTokenExpiresAt: "2099-01-01T00:00:00Z",
  refreshTokenExpiresAt: "2099-02-01T00:00:00Z",
}

async function mockAuthentication(
  page: Page,
  role: string,
  rejectLogin = false,
) {
  const calls: { path: string; method: string; body: unknown }[] = []

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname

    calls.push({
      path,
      method: request.method(),
      body: request.postData() ? request.postDataJSON() : null,
    })

    if (path === "/api/v1/auth/login" && request.method() === "POST") {
      if (rejectLogin) {
        return route.fulfill({
          status: 401,
          json: {
            code: "INVALID_CREDENTIALS",
            message: "Email hoặc mật khẩu không chính xác.",
            fieldErrors: {},
          },
        })
      }

      return route.fulfill({ status: 200, json: syntheticTokens })
    }

    if (path === "/api/v1/auth/me" && request.method() === "GET") {
      if (
        rejectLogin ||
        request.headers().authorization !==
          `Bearer ${syntheticTokens.accessToken}`
      ) {
        return route.fulfill({
          status: 401,
          json: {
            code: "INVALID_ACCESS_TOKEN",
            message: "Authentication required",
          },
        })
      }

      return route.fulfill({
        status: 200,
        json: {
          id: 84,
          email: "scrum84@example.test",
          fullName: "SCRUM84 Test User",
          roles: [role],
        },
      })
    }

    // Các API ngoài phạm vi auth không được trả thành công giả.
    return route.fulfill({
      status: 404,
      json: {
        code: "UNIMPLEMENTED_TEST_ROUTE",
        message: path,
      },
    })
  })

  return calls
}

async function submitLogin(page: Page, password: string) {
  await page.getByLabel("Địa chỉ Email", { exact: true })
    .fill("scrum84@example.test")
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Đăng Nhập", exact: true }).click()
}

const roleCases = [
  { role: "ROLE_CANDIDATE", destination: "/my-applications" },
  { role: "ROLE_RECRUITER", destination: "/recruiter/console" },
  { role: "ROLE_PLATFORM_ADMIN", destination: "/admin-console" },
]

for (const { role, destination } of roleCases) {
  test(`valid login routes ${role} to its workspace`, async ({ page }) => {
    const calls = await mockAuthentication(page, role)

    await page.goto("/login")
    await submitLogin(page, "SyntheticPassword84!")

    await expect(page).toHaveURL(
      new URL(destination, page.url()).href,
    )

    const loginCalls = calls.filter(
      (call) => call.path === "/api/v1/auth/login",
    )
    expect(loginCalls).toHaveLength(1)
    expect(loginCalls[0].method).toBe("POST")
    expect(loginCalls[0].body).toEqual({
      email: "scrum84@example.test",
      password: "SyntheticPassword84!",
    })
    expect(
      calls.some((call) => call.path === "/api/v1/auth/me"),
    ).toBe(true)

    await expect.poll(
      () => page.evaluate(
        () => sessionStorage.getItem("sr_auth_session"),
      ),
    ).not.toBeNull()
  })
}

test("invalid password shows error and creates no session", async ({ page }) => {
  const calls = await mockAuthentication(page, "ROLE_CANDIDATE", true)

  await page.goto("/login")
  await submitLogin(page, "WrongSyntheticPassword!")

  await expect(page.getByRole("alert"))
    .toContainText("Email hoặc mật khẩu không chính xác.")
  await expect(page).toHaveURL(/\/login$/)

  expect(
    await page.evaluate(
      () => sessionStorage.getItem("sr_auth_session"),
    ),
  ).toBeNull()

  expect(
    calls.filter((call) => call.path === "/api/v1/auth/login"),
  ).toHaveLength(1)
  expect(
    calls.some((call) => call.path === "/api/v1/auth/me"),
  ).toBe(false)

  // Kiểm tra không thể vào trang riêng tư sau login thất bại.
  await page.goto("/my-applications")
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
})

test("candidate cannot access the admin workspace", async ({ page }) => {
  const calls = await mockAuthentication(page, "ROLE_CANDIDATE")

  await page.goto("/login")
  await submitLogin(page, "SyntheticPassword84!")
  await expect(page).toHaveURL(/\/my-applications$/)

  await page.goto("/admin-console")

  await expect(
    page.getByRole("heading", {
      name: /Yêu Cầu Quyền Hạn/,
    }),
  ).toBeVisible()
  await expect(page.getByText("scrum84@example.test", { exact: true }))
    .toBeVisible()

  expect(
    calls.some((call) => call.path.startsWith("/api/v1/admin/")),
  ).toBe(false)
})