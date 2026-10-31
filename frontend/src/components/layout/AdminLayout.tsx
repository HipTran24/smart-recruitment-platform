import { useState } from "react"
import { useFocusScope } from "../ui/useFocusScope"
import { useDesktop } from "../ui/useDesktop"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const desktop = useDesktop()
  const drawerOpen = mobileMenuOpen && !desktop
  const drawer = useFocusScope(drawerOpen, () => setMobileMenuOpen(false))

  return (
    <div className="theme-admin dark min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex">
      {/* Mobile Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with responsive drawer */}
      <div ref={drawer} tabIndex={-1} className="lg:flex lg:shrink-0">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        inert={drawerOpen}
        className="flex-1 min-w-0 lg:ml-[220px] flex flex-col min-h-screen"
      >
        <Header onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 pt-12 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
