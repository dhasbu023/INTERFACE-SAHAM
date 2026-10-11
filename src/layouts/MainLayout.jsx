import { useState } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

function MainLayout() {

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${collapsed ? "ml-[72px]" : "ml-64"}
        `}
      >

        <Header />

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default MainLayout