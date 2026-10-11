function ForwardTestCards({ data }) {
  // ==========================================
  // Helper: cek apakah Harga 09:30 tersedia
  // ==========================================

  const hasHarga0930 = (item) => {
    const value = item["Harga 09:30"]

    return (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    )
  }

  // ==========================================
  // Helper: konversi harga menjadi number
  // ==========================================

  const parseHarga = (value) => {
    if (value === undefined || value === null) {
      return NaN
    }

    return parseFloat(
      String(value)
        .replace(/,/g, "")
        .trim()
    )
  }

  // ==========================================
  // Hitung Return
  // Harga Sore → Harga 09:30
  // ==========================================

  const getReturn = (item) => {
    const hargaSore = parseHarga(item["Harga Sore"])
    const harga0930 = parseHarga(item["Harga 09:30"])

    if (
      Number.isNaN(hargaSore) ||
      Number.isNaN(harga0930) ||
      hargaSore === 0
    ) {
      return null
    }

    return ((harga0930 - hargaSore) / hargaSore) * 100
  }

  // ==========================================
  // Pisahkan data diketahui & belum diketahui
  // ==========================================

  const diketahuiData = data.filter(hasHarga0930)

  const diketahui = diketahuiData.length
  const unknown = data.length - diketahui

  // ==========================================
  // Hitung semua return sekali
  // ==========================================

  const returns = diketahuiData
    .map((item) => getReturn(item))
    .filter((value) => value !== null)

  // ==========================================
  // Helper jumlah berdasarkan kondisi
  // ==========================================

  const countReturn = (condition) => {
    return returns.filter(condition).length
  }

  // ==========================================
  // Hitung kategori return
  // ==========================================

  const profit0 = countReturn((value) => value >= 0)

  const profit1 = countReturn((value) => value >= 1)

  const profit2 = countReturn((value) => value >= 2)

  const profit5 = countReturn((value) => value >= 5)

  const loss1 = countReturn((value) => value <= -1)

  const loss2 = countReturn((value) => value <= -2)

  const loss5 = countReturn((value) => value <= -5)

  // ==========================================
  // Persentase berdasarkan data diketahui
  // ==========================================

  const percentage = (value) => {
    if (diketahui === 0) {
      return 0
    }

    return (value / diketahui) * 100
  }

  const formatPercentage = (value) => {
    return `${percentage(value).toFixed(1)}%`
  }

  // ==========================================
  // STATUS ROWS
  // ==========================================

  const statusRows = [
    {
      name: "Diketahui",
      description: "Memiliki harga pada pukul 09:30",
      value: diketahui,
      type: "known",
    },
    {
      name: "Belum Diketahui",
      description: "Belum memiliki harga pada pukul 09:30",
      value: unknown,
      type: "unknown",
    },
  ]

  // ==========================================
  // RESULT ROWS
  // ==========================================

  const resultRows = [
    {
      name: "Profit ≥ 0%",
      description: "Return sama dengan atau lebih dari 0%",
      value: profit0,
      type: "profit",
    },
    {
      name: "Profit ≥ 1%",
      description: "Return sama dengan atau lebih dari 1%",
      value: profit1,
      type: "profit",
    },
    {
      name: "Profit ≥ 2%",
      description: "Return sama dengan atau lebih dari 2%",
      value: profit2,
      type: "profit",
    },
    {
      name: "Profit ≥ 5%",
      description: "Return sama dengan atau lebih dari 5%",
      value: profit5,
      type: "profit",
    },
    {
      name: "Loss ≤ -1%",
      description: "Return sama dengan atau kurang dari -1%",
      value: loss1,
      type: "loss",
    },
    {
      name: "Loss ≤ -2%",
      description: "Return sama dengan atau kurang dari -2%",
      value: loss2,
      type: "loss",
    },
    {
      name: "Loss ≤ -5%",
      description: "Return sama dengan atau kurang dari -5%",
      value: loss5,
      type: "loss",
    },
  ]

  // ==========================================
  // STATUS ROW COMPONENT
  // ==========================================

  const StatusRow = ({ row }) => {
    const isKnown = row.type === "known"

    const percent =
      data.length > 0
        ? (row.value / data.length) * 100
        : 0

    return (
      <tr className="border-b border-zinc-800/70 last:border-0">
        {/* STATUS */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isKnown
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />

            <div>
              <p className="font-medium text-white">
                {row.name}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {row.description}
              </p>
            </div>
          </div>
        </td>

        {/* JUMLAH */}
        <td className="px-5 py-4 text-right">
          <div className="inline-flex items-baseline gap-1">
            <span
              className={`text-base font-semibold ${
                isKnown
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {row.value}
            </span>

            <span className="text-xs text-zinc-600">
              / {data.length}
            </span>
          </div>
        </td>

        {/* PERSENTASE */}
        <td className="px-5 py-4 text-right">
          <span
            className={`text-sm font-semibold ${
              isKnown
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {percent.toFixed(1)}%
          </span>
        </td>

        {/* DISTRIBUSI */}
        <td className="hidden px-5 py-4 sm:table-cell">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isKnown
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
              style={{
                width: `${Math.min(percent, 100)}%`,
              }}
            />
          </div>
        </td>
      </tr>
    )
  }

  // ==========================================
  // RESULT ROW COMPONENT
  // ==========================================

  const ResultRow = ({ row }) => {
    const isProfit = row.type === "profit"
    const percent = percentage(row.value)

    return (
      <tr className="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30">
        {/* KONDISI */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                isProfit
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isProfit ? "↑" : "↓"}
            </div>

            <div>
              <p className="font-medium text-white">
                {row.name}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {row.description}
              </p>
            </div>
          </div>
        </td>

        {/* JUMLAH */}
        <td className="px-5 py-4 text-right">
          <div className="inline-flex items-baseline gap-1">
            <span
              className={`text-base font-semibold ${
                isProfit
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {row.value}
            </span>

            <span className="text-xs text-zinc-600">
              / {diketahui}
            </span>
          </div>
        </td>

        {/* PERSENTASE */}
        <td className="px-5 py-4 text-right">
          <span
            className={`text-sm font-semibold ${
              isProfit
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {formatPercentage(row.value)}
          </span>
        </td>

        {/* DISTRIBUSI */}
        <td className="hidden px-5 py-4 sm:table-cell">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isProfit
                  ? "bg-emerald-400"
                  : "bg-rose-400"
              }`}
              style={{
                width: `${Math.min(percent, 100)}%`,
              }}
            />
          </div>
        </td>
      </tr>
    )
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">

      {/* ======================================
          STATUS DATA
      ======================================= */}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Status Data
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Ketersediaan harga pada pukul 09:30
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5">
            <span className="text-xs text-zinc-500">
              Total Signal
            </span>

            <span className="ml-2 text-sm font-semibold text-white">
              {data.length}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Jumlah
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Persentase
                </th>

                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">
                  Distribusi
                </th>
              </tr>
            </thead>

            <tbody>
              {statusRows.map((row) => (
                <StatusRow
                  key={row.name}
                  row={row}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================
          HASIL 09:30
      ======================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Hasil 09:30
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Return dari Harga Sore → Harga 09:30
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Kondisi Return
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Jumlah
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Dari Diketahui
                </th>

                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">
                  Distribusi
                </th>
              </tr>
            </thead>

            <tbody>
              {resultRows.map((row) => (
                <ResultRow
                  key={row.name}
                  row={row}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ==================================
            KETERANGAN
        ================================== */}

        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-5 py-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              i
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300">
                Cara membaca data
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Return dihitung dari perubahan Harga Sore
                ke Harga 09:30. Persentase pada tabel hasil
                dihitung berdasarkan data yang sudah memiliki
                harga 09:30.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ForwardTestCards
