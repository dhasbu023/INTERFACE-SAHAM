import { Clock3, Upload } from "lucide-react"

const dummyData = [
  {
    date: "2026-09-16",
    stock: "TLKM",
    entry: "2,780",
    exit: "2,830",
    return: "+1.80%",
    status: "Profit",
  },
  {
    date: "2026-09-16",
    stock: "ANTM",
    entry: "3,120",
    exit: "3,060",
    return: "-1.92%",
    status: "Loss",
  },
  {
    date: "2026-09-15",
    stock: "BBNI",
    entry: "5,100",
    exit: "5,250",
    return: "+2.94%",
    status: "Profit",
  },
]

function ForwardTest1000() {
  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <div className="flex items-center gap-2">

            <Clock3
              size={20}
              className="text-zinc-400"
            />

            <h1 className="text-2xl font-semibold text-white">
              Forward Test 10:00
            </h1>

          </div>

          <p className="mt-1 text-sm text-zinc-500">
            Data forward test berdasarkan entry pukul 10:00
          </p>

        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">

          <Upload size={16} />

          Import Data

        </button>

      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">

        <div className="border-b border-zinc-800 px-6 py-4">

          <p className="text-sm font-medium text-white">
            Forward Test Data
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Dummy data untuk tahap MVP
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b border-zinc-800 bg-zinc-900">

              <tr className="text-xs text-zinc-600">

                <th className="px-6 py-3 font-medium">
                  Date
                </th>

                <th className="px-6 py-3 font-medium">
                  Stock
                </th>

                <th className="px-6 py-3 font-medium">
                  Entry
                </th>

                <th className="px-6 py-3 font-medium">
                  Exit
                </th>

                <th className="px-6 py-3 font-medium">
                  Return
                </th>

                <th className="px-6 py-3 font-medium">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-zinc-800">

              {dummyData.map((item, index) => (

                <tr
                  key={index}
                  className="transition hover:bg-zinc-800/40"
                >

                  <td className="px-6 py-4 text-zinc-400">
                    {item.date}
                  </td>

                  <td className="px-6 py-4 font-medium text-white">
                    {item.stock}
                  </td>

                  <td className="px-6 py-4 text-zinc-400">
                    {item.entry}
                  </td>

                  <td className="px-6 py-4 text-zinc-400">
                    {item.exit}
                  </td>

                  <td
                    className={`px-6 py-4 font-medium ${
                      item.status === "Profit"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.return}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        item.status === "Profit"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default ForwardTest1000