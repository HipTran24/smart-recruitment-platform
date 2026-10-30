import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { fixtureApi, signedIn } from "./fixtures"

for (const width of [360, 768, 1440]) {
  for (const [path, heading] of [
    ["candidates", "Xếp hạng ứng viên"],
    ["analytics", "Phân tích tuyển dụng"],
    ["notifications", "Thông báo"],
  ]) {
    test(`${path}: viewport ${width}, layout and WCAG scan`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 960 })
      await fixtureApi(page)
      await signedIn(page)
      await page.goto(`/recruiter/${path}`)
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible()
      await expect(page.getByText(/Đang tải/)).toHaveCount(0)
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll("*")]
          .map((element) => ({
            tag: element.tagName,
            cls: element.className,
            right: element.getBoundingClientRect().right,
          }))
          .filter((box) => box.right > innerWidth),
      }))
      if (layout.scroll > layout.width) console.log(JSON.stringify(layout))
      expect(layout.scroll <= layout.width).toBe(true)
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
      await testInfo.attach("axe-results", {
        body: JSON.stringify(scan.violations, null, 2),
        contentType: "application/json",
      })
      expect(scan.violations).toEqual([])
      await page.screenshot({
        path: testInfo.outputPath(`${path}-${width}.png`),
        fullPage: true,
      })
    })
  }
}
test("ranking preserves null and zero scores and persists a valid status transition", async ({
  page,
}) => {
  const calls = await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/candidates")
  await expect(
    page.getByRole("cell", { name: "Chưa có điểm", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "0%", exact: true }),
  ).toBeVisible()
  const trigger = page.getByRole("button", {
    name: "Xem / cập nhật Ứng viên Tổng hợp A",
  })
  await trigger.click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  await page.getByLabel("Trạng thái mới").selectOption("IN_REVIEW")
  await page.getByLabel("Ghi chú thay đổi").fill("Reviewed synthetic fixture")
  await page.getByRole("button", { name: "Lưu trạng thái" }).click()
  await expect(dialog).toHaveCount(0)
  await expect(
    page.getByRole("cell", { name: "IN_REVIEW", exact: true }),
  ).toBeVisible()
  expect(
    calls.some(
      (call) =>
        call.method === "POST" &&
        call.url.endsWith("/applications/1/transitions") &&
        (call.body as { stage: string }).stage === "IN_REVIEW",
    ),
  ).toBe(true)
})
test("dialog traps Tab and restores keyboard focus", async ({ page }) => {
  await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/candidates")
  const trigger = page.getByRole("button", {
    name: "Xem / cập nhật Ứng viên Tổng hợp A",
  })
  await trigger.click()
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(scan.violations).toEqual([])
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab")
    expect(
      await page
        .getByRole("dialog")
        .evaluate((element) => element.contains(document.activeElement)),
    ).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
test("mobile navigation closes with Escape and stays out of tab order while hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 })
  await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/candidates")
  const toggle = page.getByRole("button", { name: "Toggle navigation menu" })
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-expanded", "true")
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(scan.violations).toEqual([])
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab")
    expect(
      await page
        .locator("#recruiter-navigation")
        .evaluate((element) => element.contains(document.activeElement)),
    ).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(toggle).toBeFocused()
  await expect(page.locator("#recruiter-navigation")).toHaveAttribute(
    "inert",
    "",
  )
})
test("analytics filters survive reload and back navigation without made-up source data", async ({
  page,
}) => {
  await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/analytics")
  await page.getByLabel("Vị trí tuyển dụng").selectOption("10")
  await page.getByLabel("Từ ngày nộp").fill("2026-10-01")
  await page.getByLabel("Đến ngày nộp").fill("2026-10-03")
  await expect(page.getByLabel("Nguồn ứng tuyển")).toBeDisabled()
  await page.reload()
  await expect(page.getByLabel("Vị trí tuyển dụng")).toHaveValue("10")
  await expect(page.getByLabel("Từ ngày nộp")).toHaveValue("2026-10-01")
  await page.getByLabel("Vị trí tuyển dụng").selectOption("20")
  await expect(
    page.getByText("Không có hồ sơ trong khoảng đã chọn."),
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel("Vị trí tuyển dụng")).toHaveValue("10")
  await expect(page.getByRole("table").first()).toBeVisible()
})
for (const path of ["candidates", "analytics"]) {
  test(`${path} shows empty state`, async ({ page }) => {
    await fixtureApi(page, { empty: true })
    await signedIn(page)
    await page.goto(`/recruiter/${path}`)
    await expect(page.getByText(/Không có hồ sơ/)).toBeVisible()
  })
  test(`${path} shows API failure without fixtures`, async ({ page }) => {
    await fixtureApi(page, { failList: true })
    await signedIn(page)
    await page.goto(`/recruiter/${path}`)
    await expect(page.getByRole("alert")).toContainText("Không tải được")
    await expect(page.getByText("Harriet Lawrence")).toHaveCount(0)
  })
}
test("failed transition stays visible as an error, not a success", async ({
  page,
}) => {
  await fixtureApi(page, { failMutation: true })
  await signedIn(page)
  await page.goto("/recruiter/candidates")
  await page
    .getByRole("button", { name: "Xem / cập nhật Ứng viên Tổng hợp A" })
    .click()
  await page.getByLabel("Trạng thái mới").selectOption("IN_REVIEW")
  await page.getByRole("button", { name: "Lưu trạng thái" }).click()
  await expect(page.getByRole("alert")).toContainText("Chưa xác nhận")
  await expect(page.getByRole("dialog")).toBeVisible()
})
test("notification read updates from server response", async ({ page }) => {
  const calls = await fixtureApi(page)
  await signedIn(page)
  await page.goto("/recruiter/notifications")
  await page
    .getByRole("button", { name: /Đánh dấu đã đọc.*Cập nhật hồ sơ tổng hợp/ })
    .click()
  await expect(page.getByText("0 thông báo chưa đọc")).toBeVisible()
  expect(
    calls.some(
      (call) =>
        call.method === "PUT" && call.url.endsWith("/notifications/1/read"),
    ),
  ).toBe(true)
})
for (const path of [
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
]) {
  test(`auth ${path}: labels, contrast and mobile width`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 960 })
    await page.goto(`/${path}`)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    await testInfo.attach("axe-results", {
      body: JSON.stringify(scan.violations, null, 2),
      contentType: "application/json",
    })
    expect(scan.violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  })
}
