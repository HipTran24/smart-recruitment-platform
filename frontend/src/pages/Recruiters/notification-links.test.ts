import { expect, it } from "vitest"
import { safeNotificationPath } from "./NotifucationRecruiter"
it("only renders local recruiter actions, rejecting external and script URLs", () => {
  expect(safeNotificationPath("/recruiter/candidates?job=10")).toBe(
    "/recruiter/candidates?job=10",
  )
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "javascript:alert(1)",
    "/admin/users",
    "/recruiter\\evil",
    "/recruiter\n/evil",
    "/recruiter-evil",
  ])
    expect(safeNotificationPath(value)).toBeUndefined()
})
