import { test, expect, type Page } from "@playwright/test"
import { fixtureApi, signedIn } from "./fixtures"

async function openJobCreation(page: Page) {
  await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/jobs/create")
  await expect(
    page.getByRole("heading", {
      name: "Job Creation Studio",
      exact: true,
    }),
  ).toBeVisible()
}

// Label hiện chưa liên kết với input bằng htmlFor/id.
// Selector này bám vào nhãn thực tế của form hiện tại.
function jobTitleInput(page: Page) {
  return page
    .locator("label")
    .filter({ hasText: /^Job Title \*$/ })
    .locator("..")
    .locator('input[type="text"]')
}

test("publishing a job must send a create request", async ({ page }) => {
  await openJobCreation(page)

  const dialogs: string[] = []
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message())
    await dialog.dismiss()
  })

  await jobTitleInput(page).fill("QA SCRUM84 Backend Intern")

  const createRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/v1/recruiter/jobs",
    { timeout: 5000 },
  )

  // Chờ request và click đồng thời để không bỏ lỡ request.
  const [request] = await Promise.all([
    createRequest,
    page.getByRole("button", {
      name: "Publish Job",
      exact: true,
    }).click(),
  ])

  expect(request.postDataJSON()).toMatchObject({
    title: "QA SCRUM84 Backend Intern",
  })
})

test("empty job title must not report a successful publish", async ({
  page,
}) => {
  await openJobCreation(page)

  const dialogs: string[] = []
  const mutations: string[] = []

  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message())
    await dialog.dismiss()
  })

  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname.startsWith(
        "/api/v1/recruiter/jobs",
      )
    ) {
      mutations.push(request.url())
    }
  })

  await jobTitleInput(page).fill("")
  await page.getByRole("button", {
    name: "Publish Job",
    exact: true,
  }).click()

  // Chỉ một trong hai hành vi: validation trình duyệt
  // hoặc thông báo validation có thể truy cập được.
  await expect.poll(async () => {
    const browserValidation = await jobTitleInput(page).evaluate(
      (element: HTMLInputElement) => !element.checkValidity(),
    )
    const errorVisible = await page.getByRole("alert").count()
    return browserValidation || errorVisible > 0
  }).toBe(true)

  expect(mutations).toEqual([])
  expect(
    dialogs.some((message) => /success|published successfully/i.test(message)),
  ).toBe(false)
})