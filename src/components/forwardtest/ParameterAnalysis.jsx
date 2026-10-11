
import { useMemo, useState } from "react"

import {
  BarChart3,
  ChevronDown,
  Database,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react"


function ParameterAnalysis({ data }) {

  // ============================================================
  // STATE
  // ============================================================

  const [selectedParameter, setSelectedParameter] =
    useState("Candle Score")

  const [minimumSample, setMinimumSample] =
    useState(30)


  // ============================================================
  // HELPER
  // ============================================================

  const parseNumber = (value) => {

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return null
    }

    let text = String(value)
      .trim()
      .replace(/,/g, "")
      .replace(/%/g, "")

    // Contoh:
    // 3.68x -> 3.68
    if (text.toLowerCase().endsWith("x")) {
      text = text.slice(0, -1)
    }

    // Contoh:
    // 48.2B -> 48.2
    if (text.toLowerCase().endsWith("b")) {
      text = text.slice(0, -1)
    }

    const number = Number(text)

    return Number.isNaN(number)
      ? null
      : number
  }


  // ============================================================
  // RETURN 09:30
  // ============================================================

  const getReturn = (item) => {

    const hargaSore =
      parseNumber(item["Harga Sore"])

    const harga0930 =
      parseNumber(item["Harga 09:30"])

    if (
      hargaSore === null ||
      harga0930 === null ||
      hargaSore === 0
    ) {
      return null
    }

    return (
      ((harga0930 - hargaSore) / hargaSore) *
      100
    )
  }


  // ============================================================
  // PARAMETER
  // ============================================================

  const parameters = useMemo(() => {

    if (!data || data.length === 0) {
      return []
    }

    const parameterList = [
      "Volume Spike",
      "Volume Score",
      "Candle Score",
      "Trend Score",
      "Breakout Score",
      "Value Score",
      "Extension Score",
      "Total Score",
      "Rank",
    ]

    return parameterList.filter((parameter) => {

      const values = data
        .map((item) =>
          parseNumber(item[parameter])
        )
        .filter(
          (value) => value !== null
        )

      return values.length > 0
    })

  }, [data])


  // ============================================================
  // THRESHOLD
  // ============================================================

  const getThresholds = (parameter) => {

    const values = data
      .map((item) =>
        parseNumber(item[parameter])
      )
      .filter(
        (value) => value !== null
      )

    if (values.length === 0) {
      return []
    }

    const uniqueValues = [
      ...new Set(values)
    ].sort(
      (a, b) => a - b
    )


    // Jika sedikit, gunakan semuanya
    if (uniqueValues.length <= 10) {
      return uniqueValues
    }


    // Maksimal 10 threshold
    const result = []

    const step =
      (uniqueValues.length - 1) / 9

    for (let i = 0; i < 10; i++) {

      const index =
        Math.round(i * step)

      result.push(
        uniqueValues[index]
      )
    }

    return [
      ...new Set(result)
    ]
  }


  // ============================================================
  // ANALISIS SEMUA THRESHOLD
  // ============================================================

  const analysisRows = useMemo(() => {

    if (
      !data ||
      data.length === 0 ||
      parameters.length === 0
    ) {
      return []
    }

    const rows = []

    parameters.forEach((parameter) => {

      const thresholds =
        getThresholds(parameter)

      thresholds.forEach((threshold) => {

        // ------------------------------------------------------
        // FILTER SIGNAL
        // ------------------------------------------------------

        const filteredData =
          data.filter((item) => {

            const value =
              parseNumber(
                item[parameter]
              )

            if (value === null) {
              return false
            }

            return value >= threshold
          })


        // ------------------------------------------------------
        // RETURN
        // ------------------------------------------------------

        const returns =
          filteredData
            .map((item) =>
              getReturn(item)
            )
            .filter(
              (value) =>
                value !== null
            )


        // ------------------------------------------------------
        // PROFIT / LOSS / FLAT
        // ------------------------------------------------------

        const profit =
          returns.filter(
            (value) =>
              value > 0
          ).length


        const loss =
          returns.filter(
            (value) =>
              value < 0
          ).length


        const flat =
          returns.filter(
            (value) =>
              value === 0
          ).length


        // ------------------------------------------------------
        // TOTAL RETURN
        // ------------------------------------------------------

        const totalReturn =
          returns.reduce(
            (sum, value) =>
              sum + value,
            0
          )


        // ------------------------------------------------------
        // AVERAGE RETURN
        // ------------------------------------------------------

        const averageReturn =
          returns.length > 0
            ? totalReturn /
              returns.length
            : 0


        // ------------------------------------------------------
        // WIN RATE
        // Profit > 0 / semua data diketahui
        // ------------------------------------------------------

        const winRate =
          returns.length > 0
            ? (
                profit /
                returns.length
              ) * 100
            : 0


        // ------------------------------------------------------
        // KNOWN RATE
        // ------------------------------------------------------

        const knownRate =
          filteredData.length > 0
            ? (
                returns.length /
                filteredData.length
              ) * 100
            : 0


        // ------------------------------------------------------
        // MEDIAN RETURN
        // ------------------------------------------------------

        const sortedReturns =
          [...returns].sort(
            (a, b) =>
              a - b
          )

        let medianReturn = 0

        if (sortedReturns.length > 0) {

          const middle =
            Math.floor(
              sortedReturns.length / 2
            )

          if (
            sortedReturns.length % 2 === 0
          ) {

            medianReturn =
              (
                sortedReturns[middle - 1] +
                sortedReturns[middle]
              ) / 2

          } else {

            medianReturn =
              sortedReturns[middle]
          }
        }


        rows.push({

          parameter,

          condition: ">=",

          threshold,

          totalSignal:
            filteredData.length,

          diketahui:
            returns.length,

          unknown:
            filteredData.length -
            returns.length,

          knownRate,

          profit,

          loss,

          flat,

          winRate,

          averageReturn,

          medianReturn,

          totalReturn,

        })

      })

    })

    return rows

  }, [data, parameters])


  // ============================================================
  // ROW PARAMETER TERPILIH
  // ============================================================

  const selectedRows = useMemo(() => {

    return analysisRows
      .filter(
        (row) =>
          row.parameter ===
          selectedParameter
      )
      .sort(
        (a, b) =>
          a.threshold -
          b.threshold
      )

  }, [
    analysisRows,
    selectedParameter,
  ])


  // ============================================================
  // BASELINE
  // ============================================================

  const baselineRow =
    selectedRows.length > 0
      ? selectedRows[0]
      : null


  // ============================================================
  // ROW YANG MEMENUHI MINIMUM SAMPLE
  // ============================================================

  const qualifiedRows = useMemo(() => {

    return selectedRows.filter(
      (row) =>
        row.diketahui >=
        minimumSample
    )

  }, [
    selectedRows,
    minimumSample,
  ])


  // ============================================================
  // BEST AVG RETURN
  // HANYA UNTUK INFORMASI
  // ============================================================

  const highestAverageReturn =
    qualifiedRows.length > 0
      ? [...qualifiedRows].sort(
          (a, b) =>
            b.averageReturn -
            a.averageReturn
        )[0]
      : null


  // ============================================================
  // BEST WIN RATE
  // HANYA UNTUK INFORMASI
  // ============================================================

  const highestWinRate =
    qualifiedRows.length > 0
      ? [...qualifiedRows].sort(
          (a, b) =>
            b.winRate -
            a.winRate
        )[0]
      : null


  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const formatNumber = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "-"
    }

    return Number(value)
      .toLocaleString(
        "id-ID",
        {
          maximumFractionDigits: 2,
        }
      )
  }


  // ============================================================
  // FORMAT PERCENT
  // ============================================================

  const formatPercent = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "-"
    }

    return (
      `${value >= 0 ? "+" : ""}` +
      `${Number(value).toFixed(2)}%`
    )
  }


  // ============================================================
  // FORMAT THRESHOLD
  // ============================================================

  const formatThreshold = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "-"
    }

    return Number(value)
      .toLocaleString(
        "id-ID",
        {
          maximumFractionDigits: 2,
        }
      )
  }


  // ============================================================
  // STATUS RETURN
  // ============================================================

  const getReturnClass = (value) => {

    if (value > 0) {
      return "text-emerald-400"
    }

    if (value < 0) {
      return "text-red-400"
    }

    return "text-zinc-400"
  }


  // ============================================================
  // EMPTY
  // ============================================================

  if (
    !data ||
    data.length === 0
  ) {

    return (
      <section className="space-y-4">

        <div>

          <h2 className="text-lg font-semibold text-white">
            Parameter Analysis
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Belum ada data CSV yang tersedia.
          </p>

        </div>

        <div
          className="
            rounded-xl
            border
            border-dashed
            border-zinc-800
            bg-zinc-900/30
            px-5
            py-10
            text-center
          "
        >

          <p className="text-sm text-zinc-500">
            Menunggu data dari SEHEM.csv...
          </p>

        </div>

      </section>
    )
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <section className="space-y-5">


      {/* ========================================================
          HEADER
      ========================================================= */}

      <div>

        <div className="flex items-center gap-2">

          <BarChart3
            size={20}
            className="text-zinc-400"
          />

          <h2 className="text-lg font-semibold text-white">
            Parameter Analysis
          </h2>

        </div>

        <p className="mt-1 text-sm text-zinc-500">
          Lihat bagaimana perubahan threshold
          setiap parameter berhubungan dengan
          hasil harga 09:30.
        </p>

      </div>


      {/* ========================================================
          INFO DATA
      ========================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >

        {/* DATA */}

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <Database
              size={16}
              className="text-zinc-500"
            />

            <span className="text-xs text-zinc-500">
              Total Signal
            </span>

          </div>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatNumber(data.length)}
          </p>

        </div>


        {/* DIKETAHUI */}

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <TrendingUp
              size={16}
              className="text-zinc-500"
            />

            <span className="text-xs text-zinc-500">
              Harga 09:30 Diketahui
            </span>

          </div>

          <p className="mt-2 text-xl font-semibold text-white">

            {formatNumber(
              data.filter(
                (item) =>
                  getReturn(item) !== null
              ).length
            )}

          </p>

        </div>


        {/* PARAMETER */}

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <BarChart3
              size={16}
              className="text-zinc-500"
            />

            <span className="text-xs text-zinc-500">
              Parameter
            </span>

          </div>

          <p className="mt-2 text-xl font-semibold text-white">
            {parameters.length}
          </p>

        </div>

      </div>


      {/* ========================================================
          CONTROL
      ========================================================= */}

      <div
        className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          {/* PARAMETER SELECT */}

          <div className="w-full md:max-w-sm">

            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-zinc-500
              "
            >
              Parameter yang dianalisis
            </label>

            <div className="relative">

              <select
                value={selectedParameter}
                onChange={(event) =>
                  setSelectedParameter(
                    event.target.value
                  )
                }
                className="
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-950
                  px-3
                  py-2.5
                  pr-9
                  text-sm
                  text-zinc-200
                  outline-none
                  transition
                  focus:border-zinc-500
                "
              >

                {parameters.map(
                  (parameter) => (

                    <option
                      key={parameter}
                      value={parameter}
                    >
                      {parameter}
                    </option>

                  )
                )}

              </select>

              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-zinc-500
                "
              />

            </div>

          </div>


          {/* MINIMUM SAMPLE */}

          <div className="w-full md:max-w-xs">

            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-zinc-500
              "
            >
              Minimum data diketahui
            </label>

            <select
              value={minimumSample}
              onChange={(event) =>
                setMinimumSample(
                  Number(event.target.value)
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-zinc-700
                bg-zinc-950
                px-3
                py-2.5
                text-sm
                text-zinc-200
                outline-none
                focus:border-zinc-500
              "
            >

              <option value={10}>
                ≥ 10 data
              </option>

              <option value={20}>
                ≥ 20 data
              </option>

              <option value={30}>
                ≥ 30 data
              </option>

              <option value={50}>
                ≥ 50 data
              </option>

              <option value={100}>
                ≥ 100 data
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* ========================================================
          BASELINE
      ========================================================= */}

      {baselineRow && (

        <div>

          <div className="mb-3">

            <h3 className="text-sm font-semibold text-white">
              Baseline {selectedParameter}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Kondisi awal sebelum threshold diperketat.
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-3
              lg:grid-cols-5
            "
          >

            {/* SIGNAL */}

            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-4
              "
            >

              <p className="text-xs text-zinc-500">
                Signal
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(
                  baselineRow.totalSignal
                )}
              </p>

            </div>


            {/* DIKETAHUI */}

            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-4
              "
            >

              <p className="text-xs text-zinc-500">
                Diketahui
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(
                  baselineRow.diketahui
                )}
              </p>

              <p className="mt-1 text-[11px] text-zinc-600">
                {baselineRow.knownRate.toFixed(1)}%
                tersedia
              </p>

            </div>


            {/* PROFIT */}

            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-4
              "
            >

              <p className="text-xs text-zinc-500">
                Profit
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-400">
                {formatNumber(
                  baselineRow.profit
                )}
              </p>

              <p className="mt-1 text-[11px] text-zinc-600">
                Return &gt; 0%
              </p>

            </div>


            {/* WIN RATE */}

            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-4
              "
            >

              <p className="text-xs text-zinc-500">
                Win Rate
              </p>

              <p
                className={`
                  mt-1
                  text-lg
                  font-semibold
                  ${getReturnClass(
                    baselineRow.winRate
                  )}
                `}
              >
                {baselineRow.winRate.toFixed(1)}%
              </p>

              <p className="mt-1 text-[11px] text-zinc-600">
                Profit / Diketahui
              </p>

            </div>


            {/* AVG RETURN */}

            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-4
              "
            >

              <p className="text-xs text-zinc-500">
                Avg Return
              </p>

              <p
                className={`
                  mt-1
                  text-lg
                  font-semibold
                  ${getReturnClass(
                    baselineRow.averageReturn
                  )}
                `}
              >
                {formatPercent(
                  baselineRow.averageReturn
                )}
              </p>

              <p className="mt-1 text-[11px] text-zinc-600">
                Rata-rata per signal
              </p>

            </div>

          </div>

        </div>

      )}


      {/* ========================================================
          INSIGHT
      ========================================================= */}

      <div
        className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/40
          p-4
        "
      >

        <div className="flex gap-3">

          <Info
            size={18}
            className="
              mt-0.5
              shrink-0
              text-zinc-500
            "
          />

          <div>

            <p className="text-sm font-medium text-zinc-300">
              Cara membaca analisis
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">

              Threshold yang lebih tinggi tidak otomatis
              berarti lebih baik. Perhatikan perubahan
              Avg Return dan Win Rate bersamaan dengan
              jumlah data yang tersedia.

            </p>

            {highestAverageReturn && (

              <p className="mt-2 text-xs leading-5 text-zinc-500">

                Pada data dengan minimal{" "}
                <span className="font-medium text-zinc-300">
                  {minimumSample}
                </span>{" "}
                hasil diketahui, threshold{" "}
                <span className="font-medium text-zinc-300">
                  ≥ {formatThreshold(
                    highestAverageReturn.threshold
                  )}
                </span>{" "}
                memiliki Avg Return{" "}
                <span
                  className={
                    highestAverageReturn.averageReturn >= 0
                      ? "font-medium text-emerald-400"
                      : "font-medium text-red-400"
                  }
                >
                  {formatPercent(
                    highestAverageReturn.averageReturn
                  )}
                </span>
                {" "}dalam sampel yang tersedia.

              </p>

            )}

          </div>

        </div>

      </div>


      {/* ========================================================
          GRAFIK
      ========================================================= */}

      {selectedRows.length > 0 && (

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-4
          "
        >

          <div className="mb-5">

            <h3 className="text-sm font-semibold text-white">
              Perubahan Avg Return
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Melihat bagaimana rata-rata return berubah
              ketika threshold dinaikkan.
            </p>

          </div>


          <div className="space-y-3">

            {selectedRows.map(
              (row) => {

                const maxAbsReturn =
                  Math.max(
                    ...selectedRows.map(
                      (item) =>
                        Math.abs(
                          item.averageReturn
                        )
                    ),
                    1
                  )

                const width =
                  (
                    Math.abs(
                      row.averageReturn
                    ) /
                    maxAbsReturn
                  ) * 100


                return (

                  <div
                    key={`
                      chart-
                      ${row.parameter}-
                      ${row.threshold}
                    `}
                    className="
                      grid
                      grid-cols-[70px_1fr_70px]
                      items-center
                      gap-3
                    "
                  >

                    <span className="text-right text-xs text-zinc-500">
                      ≥ {formatThreshold(
                        row.threshold
                      )}
                    </span>


                    <div className="relative h-7">

                      <div
                        className="
                          absolute
                          inset-y-0
                          left-0
                          flex
                          items-center
                        "
                        style={{
                          width: `${width}%`,
                        }}
                      >

                        <div
                          className={`
                            h-3
                            w-full
                            rounded-sm
                            ${
                              row.averageReturn >= 0
                                ? "bg-emerald-500/40"
                                : "bg-red-500/40"
                            }
                          `}
                        />

                      </div>

                    </div>


                    <span
                      className={`
                        text-right
                        text-xs
                        font-medium
                        ${getReturnClass(
                          row.averageReturn
                        )}
                      `}
                    >
                      {formatPercent(
                        row.averageReturn
                      )}
                    </span>

                  </div>

                )
              }
            )}

          </div>

        </div>

      )}


      {/* ========================================================
          RINGKASAN THRESHOLD
      ========================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          md:grid-cols-2
        "
      >

        {/* AVG RETURN */}

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/50
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <TrendingUp
              size={16}
              className="text-zinc-500"
            />

            <span className="text-xs text-zinc-500">
              Avg Return Tertinggi
            </span>

          </div>

          {highestAverageReturn ? (

            <div className="mt-3">

              <p className="text-lg font-semibold text-emerald-400">
                {formatPercent(
                  highestAverageReturn.averageReturn
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Threshold ≥{" "}
                <span className="text-zinc-300">
                  {formatThreshold(
                    highestAverageReturn.threshold
                  )}
                </span>
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {formatNumber(
                  highestAverageReturn.diketahui
                )}{" "}
                data diketahui
              </p>

            </div>

          ) : (

            <p className="mt-3 text-sm text-zinc-600">
              Belum ada threshold yang memenuhi
              minimum sample.
            </p>

          )}

        </div>


        {/* WIN RATE */}

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/50
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <TrendingUp
              size={16}
              className="text-zinc-500"
            />

            <span className="text-xs text-zinc-500">
              Win Rate Tertinggi
            </span>

          </div>

          {highestWinRate ? (

            <div className="mt-3">

              <p className="text-lg font-semibold text-white">
                {highestWinRate.winRate.toFixed(1)}%
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Threshold ≥{" "}
                <span className="text-zinc-300">
                  {formatThreshold(
                    highestWinRate.threshold
                  )}
                </span>
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {formatNumber(
                  highestWinRate.diketahui
                )}{" "}
                data diketahui
              </p>

            </div>

          ) : (

            <p className="mt-3 text-sm text-zinc-600">
              Belum ada threshold yang memenuhi
              minimum sample.
            </p>

          )}

        </div>

      </div>


      {/* ========================================================
          TABLE
      ========================================================= */}

      <div>

        <div className="mb-3">

          <h3 className="text-sm font-semibold text-white">
            Detail Threshold
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Semua threshold untuk{" "}
            <span className="text-zinc-300">
              {selectedParameter}
            </span>.
          </p>

        </div>


        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/60
          "
        >

          <div className="overflow-x-auto">

            <table
              className="
                w-full
                min-w-[1000px]
                text-sm
              "
            >

              {/* HEADER */}

              <thead
                className="
                  border-b
                  border-zinc-800
                  bg-zinc-900
                "
              >

                <tr>

                  <th className="
                    px-4
                    py-3
                    text-left
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Threshold
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Signal
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Diketahui
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Profit
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Flat
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Loss
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Win Rate
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Avg Return
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-500
                  ">
                    Median
                  </th>

                </tr>

              </thead>


              {/* BODY */}

              <tbody>

                {selectedRows.map(
                  (row, index) => {

                    const isQualified =
                      row.diketahui >=
                      minimumSample


                    return (

                      <tr
                        key={`
                          ${row.parameter}-
                          ${row.threshold}-
                          ${index}
                        `}
                        className={`
                          border-b
                          border-zinc-800/70
                          last:border-0
                          transition
                          ${
                            isQualified
                              ? "hover:bg-zinc-800/30"
                              : "opacity-50"
                          }
                        `}
                      >

                        {/* THRESHOLD */}

                        <td className="
                          px-4
                          py-4
                          font-medium
                          text-zinc-200
                        ">

                          <div className="flex items-center gap-2">

                            <span>
                              ≥{" "}
                              {formatThreshold(
                                row.threshold
                              )}
                            </span>

                            {row.diketahui >= minimumSample && (

                              <span
                                className="
                                  rounded
                                  bg-zinc-800
                                  px-1.5
                                  py-0.5
                                  text-[10px]
                                  text-zinc-500
                                "
                              >
                                sample cukup
                              </span>

                            )}

                          </div>

                        </td>


                        {/* SIGNAL */}

                        <td className="
                          px-4
                          py-4
                          text-right
                          text-zinc-300
                        ">
                          {formatNumber(
                            row.totalSignal
                          )}
                        </td>


                        {/* DIKETAHUI */}

                        <td className="
                          px-4
                          py-4
                          text-right
                        ">

                          <span className="text-zinc-300">
                            {formatNumber(
                              row.diketahui
                            )}
                          </span>

                          <span className="
                            ml-1
                            text-[11px]
                            text-zinc-600
                          ">
                            ({row.knownRate.toFixed(0)}%)
                          </span>

                        </td>


                        {/* PROFIT */}

                        <td className="
                          px-4
                          py-4
                          text-right
                          font-semibold
                          text-emerald-400
                        ">
                          {formatNumber(
                            row.profit
                          )}
                        </td>


                        {/* FLAT */}

                        <td className="
                          px-4
                          py-4
                          text-right
                          text-zinc-500
                        ">
                          {formatNumber(
                            row.flat
                          )}
                        </td>


                        {/* LOSS */}

                        <td className="
                          px-4
                          py-4
                          text-right
                          font-semibold
                          text-red-400
                        ">
                          {formatNumber(
                            row.loss
                          )}
                        </td>


                        {/* WIN RATE */}

                        <td className="
                          px-4
                          py-4
                          text-right
                        ">

                          <span
                            className={`
                              font-semibold
                              ${
                                row.winRate >= 50
                                  ? "text-emerald-400"
                                  : "text-zinc-400"
                              }
                            `}
                          >
                            {row.winRate.toFixed(1)}%
                          </span>

                        </td>


                        {/* AVG RETURN */}

                        <td className="
                          px-4
                          py-4
                          text-right
                        ">

                          <span
                            className={`
                              font-semibold
                              ${getReturnClass(
                                row.averageReturn
                              )}
                            `}
                          >
                            {formatPercent(
                              row.averageReturn
                            )}
                          </span>

                        </td>


                        {/* MEDIAN */}

                        <td className="
                          px-4
                          py-4
                          text-right
                        ">

                          <span
                            className={`
                              ${getReturnClass(
                                row.medianReturn
                              )}
                            `}
                          >
                            {formatPercent(
                              row.medianReturn
                            )}
                          </span>

                        </td>

                      </tr>

                    )

                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* ========================================================
          FOOTNOTE
      ========================================================= */}

      <div
        className="
          flex
          gap-2
          rounded-lg
          border
          border-zinc-800
          bg-zinc-950/50
          px-4
          py-3
        "
      >

        <Info
          size={15}
          className="
            mt-0.5
            shrink-0
            text-zinc-600
          "
        />

        <p className="
          text-xs
          leading-5
          text-zinc-600
        ">

          Profit dihitung ketika Return &gt; 0%.
          Return = 0% dikategorikan Flat dan Return
          &lt; 0% dikategorikan Loss. Win Rate dihitung
          dari Profit dibagi seluruh data yang sudah
          memiliki harga 09:30. Threshold dengan jumlah
          data diketahui di bawah minimum sample ditampilkan
          lebih redup karena hasilnya lebih terbatas untuk
          dibandingkan.

        </p>

      </div>

    </section>
  )
}


export default ParameterAnalysis
