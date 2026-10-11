
import { useState } from "react";

function ForwardTestTable({
  data = [],
  loading,
  error,
  calculateReturn,
  formatReturn,
  getReturnColor,
  getStatus,
  getScoreColor,
  getTotalScoreStyle,
}) {
  // ============================================================
  // MODAL MAKSIMAL PER TRADE
  // ============================================================

  const DEFAULT_MAX_TRADE_CAPITAL = 10_000_000;
  const LOT_SIZE = 100;

  const [maxTradeCapital, setMaxTradeCapital] = useState(
    DEFAULT_MAX_TRADE_CAPITAL,
  );

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================

  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "-";
    }

    return `Rp${Number(value).toLocaleString("id-ID")}`;
  };

  // ============================================================
  // HANDLE INPUT MODAL
  // ============================================================

  const handleCapitalChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    setMaxTradeCapital(
      rawValue === "" ? 0 : Number(rawValue),
    );
  };

  // ============================================================
  // HITUNG POSISI BERDASARKAN HARGA SORE
  // ============================================================

  const calculatePosition = (hargaSore) => {
    if (!hargaSore || maxTradeCapital <= 0) {
      return {
        lots: 0,
        shares: 0,
        actualCapital: 0,
      };
    }

    const price = Number(
      String(hargaSore).replace(/[^\d]/g, ""),
    );

    if (!price || price <= 0) {
      return {
        lots: 0,
        shares: 0,
        actualCapital: 0,
      };
    }

    const hargaPerLot = price * LOT_SIZE;

    const lots = Math.floor(
      maxTradeCapital / hargaPerLot,
    );

    const shares = lots * LOT_SIZE;

    const actualCapital =
      lots * hargaPerLot;

    return {
      lots,
      shares,
      actualCapital,
    };
  };

  // ============================================================
  // HITUNG P&L
  // ============================================================

  const calculatePnL = (
    hargaSore,
    hargaExit,
    returnValue,
  ) => {
    const position =
      calculatePosition(hargaSore);

    if (
      position.lots < 1 ||
      hargaExit === null ||
      hargaExit === undefined ||
      hargaExit === "" ||
      returnValue === null ||
      returnValue === undefined ||
      isNaN(returnValue)
    ) {
      return null;
    }

    return (
      position.actualCapital *
      (Number(returnValue) / 100)
    );
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border border-zinc-800
        bg-zinc-900/60
        shadow-2xl
        shadow-black/20
      "
    >
      {/* ========================================================
          TABLE HEADER
      ======================================================== */}

      <div
        className="
          border-b border-zinc-800
          bg-zinc-900/80
          px-6 py-4
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* TITLE */}

          <div>
            <p className="text-sm font-semibold text-white">
              Forward Test Data
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Data screening dan pergerakan harga sampai 09:30
            </p>
          </div>

          {/* CONTROL */}

          <div className="flex flex-wrap items-center gap-3">

            {/* MODAL MAKSIMAL */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-md
                border border-zinc-800
                bg-zinc-950
                px-3
                py-1.5
              "
            >
              <span className="text-xs text-zinc-500">
                Modal Maks / Trade
              </span>

              <div className="flex items-center">
                <span className="mr-1 text-xs text-zinc-500">
                  Rp
                </span>

                <input
                  type="text"
                  value={
                    maxTradeCapital
                      ? maxTradeCapital.toLocaleString("id-ID")
                      : ""
                  }
                  onChange={handleCapitalChange}
                  className="
                    w-28
                    bg-transparent
                    text-right
                    text-xs
                    font-semibold
                    text-white
                    outline-none
                  "
                  placeholder="10.000.000"
                />
              </div>
            </div>

            {/* LOT RULE */}

            <div
              className="
                rounded-md
                border border-zinc-800
                bg-zinc-950
                px-3
                py-1.5
                text-xs
                text-zinc-500
              "
            >
              1 Lot = 100 Saham
            </div>

            {/* SIGNAL COUNT */}

            <div
              className="
                rounded-md
                border border-zinc-800
                bg-zinc-950
                px-3
                py-1.5
                text-xs
                text-zinc-500
              "
            >
              {data.length} Signal
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          INFO MODAL
      ======================================================== */}

      <div
        className="
          border-b
          border-zinc-800
          bg-zinc-950/50
          px-6
          py-3
        "
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">

          <span>
            Maksimal modal:
            <strong className="ml-1 text-zinc-300">
              {formatRupiah(maxTradeCapital)}
            </strong>
          </span>

          <span>
            Lot dihitung otomatis berdasarkan Harga Sore
          </span>

          <span>
            Modal aktual =
            <strong className="ml-1 text-zinc-300">
              Harga Sore × Lot × 100
            </strong>
          </span>

          <span>
            Jika tidak cukup untuk 1 lot:
            <strong className="ml-1 text-amber-400">
              Tidak Trade
            </strong>
          </span>
        </div>
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-zinc-500
            "
          >
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-zinc-700
                border-t-blue-400
              "
            />

            Membaca data CSV...
          </div>
        </div>
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {!loading && error && (
        <div className="flex h-64 items-center justify-center">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-lg
              border border-red-500/20
              bg-red-500/5
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-red-500/10
              "
            >
              <span className="text-red-400">
                !
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-red-400">
                Gagal membaca CSV
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TABLE
      ======================================================== */}

      {!loading && !error && (
        <div className="overflow-x-auto">

          <table className="min-w-max text-left text-sm">

            {/* ==================================================
                THEAD
            ================================================== */}

            <thead
              className="
                border-b
                border-zinc-800
                bg-zinc-950
              "
            >
              <tr
                className="
                  text-[11px]
                  uppercase
                  tracking-wide
                  text-zinc-500
                "
              >

                <th
                  className="
                    sticky
                    left-0
                    z-30
                    bg-zinc-950
                    px-4
                    py-3
                    text-center
                    font-semibold
                  "
                >
                  ID
                </th>

                <th
                  className="
                    sticky
                    left-[55px]
                    z-30
                    bg-zinc-950
                    px-4
                    py-3
                    text-center
                    font-semibold
                  "
                >
                  Rank
                </th>

                <th
                  className="
                    sticky
                    left-[115px]
                    z-30
                    bg-zinc-950
                    px-4
                    py-3
                    font-semibold
                  "
                >
                  Saham
                </th>

                <th className="px-4 py-3 font-semibold">
                  Date
                </th>

                <th className="px-4 py-3 font-semibold">
                  Harga Sore
                </th>

                <th className="px-4 py-3 font-semibold">
                  Lot
                </th>

                <th className="px-4 py-3 font-semibold">
                  Modal Aktual
                </th>

                <th className="px-4 py-3 font-semibold">
                  Volume Spike
                </th>

                <th className="px-4 py-3 font-semibold">
                  Value
                </th>

                <th className="px-4 py-3 font-semibold">
                  Volume Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Candle Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Trend Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Breakout Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Value Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Extension Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Total Score
                </th>

                <th className="px-4 py-3 font-semibold">
                  Harga 09:30
                </th>

                <th className="px-4 py-3 font-semibold">
                  Return
                </th>

                <th className="px-4 py-3 font-semibold">
                  P&L
                </th>

                <th className="px-4 py-3 font-semibold">
                  Status
                </th>

              </tr>
            </thead>

            {/* ==================================================
                TBODY
            ================================================== */}

            <tbody className="divide-y divide-zinc-800/80">

              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan="20"
                    className="
                      px-6
                      py-16
                      text-center
                      text-sm
                      text-zinc-600
                    "
                  >
                    Tidak ada data forward test.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {

                  // ============================================
                  // RETURN
                  // ============================================

                  const returnValue = calculateReturn(
                    item["Harga Sore"],
                    item["Harga 09:30"],
                  );

                  // ============================================
                  // POSITION
                  // ============================================

                  const position =
                    calculatePosition(
                      item["Harga Sore"],
                    );

                  // ============================================
                  // P&L
                  // ============================================

                  const pnl = calculatePnL(
                    item["Harga Sore"],
                    item["Harga 09:30"],
                    returnValue,
                  );

                  // ============================================
                  // STATUS
                  // ============================================

                  const status =
                    position.lots > 0
                      ? getStatus(returnValue)
                      : item["Harga Sore"]
                        ? "Tidak Trade"
                        : null;

                  return (
                    <tr
                      key={`${item.ID || "row"}-${index}`}
                      className="
                        group
                        transition
                        hover:bg-zinc-800/50
                      "
                    >

                      {/* ID */}

                      <td
                        className="
                          sticky
                          left-0
                          z-20
                          bg-zinc-900
                          px-4
                          py-4
                          text-center
                          text-xs
                          font-medium
                          text-zinc-600
                          group-hover:bg-zinc-800
                        "
                      >
                        {index + 1}
                      </td>

                      {/* RANK */}

                      <td
                        className="
                          sticky
                          left-[55px]
                          z-20
                          bg-zinc-900
                          px-4
                          py-4
                          text-center
                          group-hover:bg-zinc-800
                        "
                      >
                        <span
                          className="
                            inline-flex
                            min-w-[30px]
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-zinc-700
                            bg-zinc-800
                            px-2
                            py-1
                            text-xs
                            font-semibold
                            text-zinc-300
                          "
                        >
                          {item.Rank || "-"}
                        </span>
                      </td>

                      {/* SAHAM */}

                      <td
                        className="
                          sticky
                          left-[115px]
                          z-20
                          bg-zinc-900
                          px-4
                          py-4
                          font-semibold
                          text-white
                          group-hover:bg-zinc-800
                        "
                      >
                        {item.Saham || "-"}
                      </td>

                      {/* DATE */}

                      <td
                        className="
                          whitespace-nowrap
                          px-4
                          py-4
                          text-xs
                          text-zinc-500
                        "
                      >
                        {item.Date || "-"}
                      </td>

                      {/* HARGA SORE */}

                      <td
                        className="
                          px-4
                          py-4
                          font-medium
                          text-zinc-300
                        "
                      >
                        {item["Harga Sore"] || "-"}
                      </td>

                      {/* LOT */}

                      <td
                        className="
                          px-4
                          py-4
                          font-semibold
                          text-blue-400
                        "
                      >
                        {position.lots > 0
                          ? position.lots.toLocaleString("id-ID")
                          : "-"}
                      </td>

                      {/* MODAL AKTUAL */}

                      <td
                        className="
                          px-4
                          py-4
                          font-medium
                          text-zinc-300
                        "
                      >
                        {position.lots > 0
                          ? formatRupiah(
                              position.actualCapital,
                            )
                          : "-"}
                      </td>

                      {/* VOLUME SPIKE */}

                      <td
                        className="
                          px-4
                          py-4
                          font-semibold
                          text-amber-400
                        "
                      >
                        {item["Volume Spike"] || "-"}
                      </td>

                      {/* VALUE */}

                      <td
                        className="
                          px-4
                          py-4
                          font-medium
                          text-cyan-400
                        "
                      >
                        {item.Value || "-"}
                      </td>

                      {/* VOLUME SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Volume Score"],
                        )}`}
                      >
                        {item["Volume Score"] || "-"}
                      </td>

                      {/* CANDLE SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Candle Score"],
                        )}`}
                      >
                        {item["Candle Score"] || "-"}
                      </td>

                      {/* TREND SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Trend Score"],
                        )}`}
                      >
                        {item["Trend Score"] || "-"}
                      </td>

                      {/* BREAKOUT SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Breakout Score"],
                        )}`}
                      >
                        {item["Breakout Score"] || "-"}
                      </td>

                      {/* VALUE SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Value Score"],
                        )}`}
                      >
                        {item["Value Score"] || "-"}
                      </td>

                      {/* EXTENSION SCORE */}

                      <td
                        className={`px-4 py-4 font-semibold ${getScoreColor(
                          item["Extension Score"],
                        )}`}
                      >
                        {item["Extension Score"] || "-"}
                      </td>

                      {/* TOTAL SCORE */}

                      <td className="px-4 py-4">
                        <span
                          className={`
                            inline-flex
                            min-w-[42px]
                            items-center
                            justify-center
                            rounded-md
                            px-2
                            py-1
                            text-xs
                            font-bold
                            ${getTotalScoreStyle(
                              item["Total Score"],
                            )}
                          `}
                        >
                          {item["Total Score"] || "-"}
                        </span>
                      </td>

                      {/* HARGA 09:30 */}

                      <td
                        className="
                          px-4
                          py-4
                          font-semibold
                          text-white
                        "
                      >
                        {item["Harga 09:30"] || "-"}
                      </td>

                      {/* RETURN */}

                      <td
                        className={`
                          px-4
                          py-4
                          text-right
                          font-bold
                          ${
                            position.lots > 0
                              ? getReturnColor(returnValue)
                              : "text-zinc-700"
                          }
                        `}
                      >
                        {position.lots > 0
                          ? formatReturn(returnValue)
                          : "-"}
                      </td>

                      {/* P&L */}

                      <td
                        className={`
                          px-4
                          py-4
                          text-right
                          font-bold
                          ${
                            pnl === null
                              ? "text-zinc-700"
                              : pnl >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                          }
                        `}
                      >
                        {pnl === null
                          ? "-"
                          : `${
                              pnl >= 0 ? "+" : ""
                            }${formatRupiah(
                              Math.abs(pnl),
                            )}`}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        {status === "Tidak Trade" ? (
                          <span
                            className="
                              inline-flex
                              rounded-md
                              border
                              border-amber-500/20
                              bg-amber-500/10
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              text-amber-400
                            "
                          >
                            Tidak Trade
                          </span>
                        ) : status ? (
                          <span
                            className={`
                              inline-flex
                              rounded-md
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-semibold

                              ${
                                status === "Profit"
                                  ? `
                                    border-emerald-500/20
                                    bg-emerald-500/10
                                    text-emerald-400
                                  `
                                  : status === "Loss"
                                    ? `
                                      border-red-500/20
                                      bg-red-500/10
                                      text-red-400
                                    `
                                    : `
                                      border-zinc-700
                                      bg-zinc-800
                                      text-zinc-400
                                    `
                              }
                            `}
                          >
                            {status}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-700">
                            -
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ForwardTestTable;
