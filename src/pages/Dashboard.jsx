import {
  Database,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react"

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-zinc-500">
          {title}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
          <Icon size={16} />
        </div>

      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Overview hasil forward test saham
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Signal"
          value="31"
          description="Semua forward test"
          icon={Database}
        />

        <StatCard
          title="Profit"
          value="15"
          description="Signal menghasilkan profit"
          icon={TrendingUp}
        />

        <StatCard
          title="Loss"
          value="13"
          description="Signal menghasilkan loss"
          icon={TrendingDown}
        />

        <StatCard
          title="Win Rate"
          value="53.57%"
          description="Performance keseluruhan"
          icon={Target}
        />

      </div>

      {/* Empty chart area */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">

        <div>
          <h2 className="font-medium text-white">
            Performance
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            Grafik performance akan ditambahkan pada tahap berikutnya.
          </p>
        </div>

        <div className="mt-6 flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-800">

          <p className="text-sm text-zinc-600">
            Chart Area
          </p>

        </div>

      </div>

    </div>
  )
}

export default Dashboard