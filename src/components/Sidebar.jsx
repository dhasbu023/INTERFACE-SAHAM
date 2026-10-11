import { NavLink } from "react-router-dom"

import {
  LayoutDashboard,
  Clock3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Forward Test 09:30",
    path: "/forward-test-0930",
    icon: Clock3,
  },
  {
    name: "Forward Test 10:00",
    path: "/forward-test-1000",
    icon: Clock3,
  },
]

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 h-screen
        border-r border-zinc-800
        bg-zinc-950
        transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
    >

      <div className="flex h-full flex-col">

        {/* Logo */}
        <div
          className={`
            flex h-16 items-center border-b border-zinc-800
            ${collapsed ? "justify-center px-2" : "px-4"}
          `}
        >

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-950">
              <TrendingUp size={20} strokeWidth={2.2} />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold text-white">
                  ForwardTest
                </h1>

                <p className="text-[11px] text-zinc-500">
                  Stock Analyzer
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4">

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Menu
            </p>
          )}

          <div className="space-y-1">

            {menuItems.map((item) => {

              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) => `
                    group flex items-center gap-3 rounded-lg
                    px-3 py-2.5
                    text-sm font-medium
                    transition-colors

                    ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                    }

                    ${collapsed ? "justify-center" : ""}
                  `}
                >

                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}

                </NavLink>
              )
            })}

          </div>

        </nav>

        {/* Collapse */}
        <div className="border-t border-zinc-800 p-2">

          <button
            onClick={() => setCollapsed((value) => !value)}
            className="
              flex w-full items-center justify-center
              gap-2 rounded-lg
              px-3 py-2.5
              text-zinc-500
              transition-colors
              hover:bg-zinc-900
              hover:text-zinc-200
            "
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >

            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="text-xs">
                  Collapse
                </span>
              </>
            )}

          </button>

        </div>

      </div>

    </aside>
  )
}

export default Sidebar