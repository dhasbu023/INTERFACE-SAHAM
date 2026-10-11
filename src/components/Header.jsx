import { Activity } from "lucide-react"

function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 backdrop-blur">

      <div>
        <p className="text-sm font-medium text-zinc-300">
          Forward Test Analyzer
        </p>

        <p className="text-xs text-zinc-600">
          Stock screening & forward testing
        </p>
      </div>

      <div className="flex items-center gap-2">

        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">

          <Activity
            size={14}
            className="text-emerald-500"
          />

          <span className="text-xs text-zinc-400">
            System Ready
          </span>

        </div>

      </div>

    </header>
  )
}

export default Header