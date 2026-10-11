
import { useMemo, useState } from "react";

import {
  BarChart3,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";


// ============================================================
// CONFIG
// ============================================================

// Modal maksimal yang boleh digunakan untuk SATU trade
const DEFAULT_MAX_TRADE_CAPITAL = 10_000_000;

// 1 lot saham Indonesia = 100 lembar
const LOT_SIZE = 100;


// ============================================================
// HELPER
// ============================================================

function parseNumber(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const text = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/x$/i, "")
    .replace(/b$/i, "");

  const number = Number(text);

  return Number.isNaN(number) ? null : number;
}


// ============================================================
// DATE HELPER
// ============================================================

function getDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


function getDateKey(value) {
  const date = getDateOnly(value);

  if (!date) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(dateKey) {
  if (!dateKey) {
    return "-";
  }

  const [year, month, day] =
    dateKey.split("-");

  return `${day}/${month}/${year}`;
}


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "-";
  }

  return `Rp${Number(value).toLocaleString(
    "id-ID",
    {
      maximumFractionDigits: 0,
    }
  )}`;
}


function formatCompactCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "-";
  }

  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `Rp${(
      value / 1_000_000_000
    ).toFixed(1)} M`;
  }

  if (absolute >= 1_000_000) {
    return `Rp${(
      value / 1_000_000
    ).toFixed(1)} jt`;
  }

  if (absolute >= 1_000) {
    return `Rp${(
      value / 1_000
    ).toFixed(1)} rb`;
  }

  return `Rp${Math.round(value).toLocaleString(
    "id-ID"
  )}`;
}


// ============================================================
// PERCENT
// ============================================================

function formatPercent(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "-";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(
    2
  )}%`;
}


// ============================================================
// COMPONENT
// ============================================================

function ForwardTestPerformance({
  data = [],
}) {

  const [period, setPeriod] =
    useState("daily");


  // ==========================================================
  // MODAL MAKSIMAL PER TRADE
  // ==========================================================

  const [
    maxTradeCapital,
    setMaxTradeCapital,
  ] = useState(
    DEFAULT_MAX_TRADE_CAPITAL
  );


  // ==========================================================
  // INPUT MODAL
  // ==========================================================

  const handleCapitalChange = (value) => {

    const numericValue =
      String(value)
        .replace(/\D/g, "");

    if (
      numericValue === ""
    ) {
      setMaxTradeCapital(0);
      return;
    }

    setMaxTradeCapital(
      Number(numericValue)
    );

  };


  // ==========================================================
  // HITUNG RETURN + LOT + MODAL AKTUAL SETIAP SIGNAL
  // ==========================================================

  const signalData = useMemo(() => {

    if (!Array.isArray(data)) {
      return [];
    }

    if (
      !maxTradeCapital ||
      maxTradeCapital <= 0
    ) {
      return [];
    }

    return data
      .map((item) => {

        const hargaSore =
          parseNumber(
            item["Harga Sore"]
          );

        const harga0930 =
          parseNumber(
            item["Harga 09:30"]
          );

        const dateKey =
          getDateKey(
            item["Date"]
          );


        // ----------------------------------------------------
        // VALIDASI DATA
        // ----------------------------------------------------

        if (
          hargaSore === null ||
          harga0930 === null ||
          hargaSore <= 0 ||
          harga0930 <= 0 ||
          !dateKey
        ) {
          return null;
        }


        // ----------------------------------------------------
        // HITUNG RETURN
        // ----------------------------------------------------

        const returnPercent =
          (
            (harga0930 - hargaSore) /
            hargaSore
          ) * 100;


        // ----------------------------------------------------
        // HITUNG HARGA 1 LOT
        // ----------------------------------------------------

        const hargaPerLot =
          hargaSore * LOT_SIZE;


        // ----------------------------------------------------
        // HITUNG JUMLAH LOT MAKSIMAL
        //
        // Contoh:
        //
        // Modal maksimal = 10.000.000
        // Harga = 90.000
        //
        // 1 lot = 9.000.000
        //
        // floor(10.000.000 / 9.000.000)
        // = 1 lot
        // ----------------------------------------------------

        const lots =
          Math.floor(
            maxTradeCapital /
            hargaPerLot
          );


        // ----------------------------------------------------
        // JIKA 1 LOT SAJA MELEBIHI MODAL
        // MAKA TRADE TIDAK DAPAT DILAKUKAN
        // ----------------------------------------------------

        if (lots < 1) {
          return null;
        }


        // ----------------------------------------------------
        // MODAL AKTUAL
        // ----------------------------------------------------

        const positionValue =
          lots *
          hargaPerLot;


        // ----------------------------------------------------
        // HITUNG P&L BERDASARKAN MODAL AKTUAL
        // ----------------------------------------------------

        const pnl =
          positionValue *
          (returnPercent / 100);


        return {

          ...item,

          dateKey,

          hargaSore,

          harga0930,

          returnPercent,

          lots,

          hargaPerLot,

          positionValue,

          pnl,

        };

      })
      .filter(Boolean);

  }, [
    data,
    maxTradeCapital,
  ]);


  // ==========================================================
  // GROUP DATA PER HARI
  // ==========================================================

  const dailyData = useMemo(() => {

    const grouped = {};


    signalData.forEach((item) => {

      if (
        !grouped[item.dateKey]
      ) {

        grouped[item.dateKey] = {
          dateKey:
            item.dateKey,

          signals: [],
        };

      }


      grouped[
        item.dateKey
      ].signals.push(item);

    });


    const dates =
      Object.keys(grouped)
        .sort();


    // Akumulasi P&L dimulai dari 0
    let equity = 0;


    let peakEquity = 0;


    return dates.map(
      (dateKey) => {

        const signals =
          grouped[
            dateKey
          ].signals;


        // ----------------------------------------------------
        // TOTAL P&L HARIAN
        // ----------------------------------------------------

        const pnl =
          signals.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.pnl,
            0
          );


        // ----------------------------------------------------
        // TOTAL MODAL AKTUAL HARIAN
        // ----------------------------------------------------

        const positionValue =
          signals.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.positionValue,
            0
          );


        // ----------------------------------------------------
        // RETURN HARIAN
        // ----------------------------------------------------

        const averageReturn =
          positionValue > 0
            ? (
                pnl /
                positionValue
              ) * 100
            : 0;


        // ----------------------------------------------------
        // PROFIT / LOSS SIGNAL
        // ----------------------------------------------------

        const profit =
          signals.filter(
            (item) =>
              item.returnPercent > 0
          ).length;


        const loss =
          signals.filter(
            (item) =>
              item.returnPercent < 0
          ).length;


        const flat =
          signals.filter(
            (item) =>
              item.returnPercent === 0
          ).length;


        // ----------------------------------------------------
        // EQUITY / AKUMULASI P&L
        // ----------------------------------------------------

        const equityBefore =
          equity;


        equity =
          equity +
          pnl;


        // ----------------------------------------------------
        // DRAW DOWN
        // ----------------------------------------------------

        peakEquity =
          Math.max(
            peakEquity,
            equity
          );


        const drawdown =
          peakEquity > 0
            ? (
                (equity -
                  peakEquity) /
                peakEquity
              ) * 100
            : 0;


        const drawdownValue =
          equity -
          peakEquity;


        return {

          dateKey,

          date:
            formatDate(
              dateKey
            ),

          signalCount:
            signals.length,

          profit,

          loss,

          flat,

          averageReturn,

          pnl,

          equity,

          equityBefore,

          drawdown,

          drawdownValue,

          positionValue,

          totalReturn:
            averageReturn,

        };

      }
    );

  }, [
    signalData,
  ]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {

      if (
        dailyData.length === 0
      ) {

        return {

          maxTradeCapital,

          finalEquity:
            0,

          totalPnl:
            0,

          totalReturn:
            0,

          profitDays:
            0,

          lossDays:
            0,

          flatDays:
            0,

          maxDrawdown:
            0,

          maxDrawdownValue:
            0,

          totalSignals:
            0,

          totalPositionValue:
            0,

        };

      }


      const finalEquity =
        dailyData[
          dailyData.length - 1
        ].equity;


      const totalPnl =
        finalEquity;


      // ------------------------------------------------------
      // TOTAL MODAL YANG DIGUNAKAN
      // ------------------------------------------------------

      const totalPositionValue =
        dailyData.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.positionValue,
          0
        );


      // ------------------------------------------------------
      // RETURN BERDASARKAN TOTAL MODAL YANG DIPAKAI
      // ------------------------------------------------------

      const totalReturn =
        totalPositionValue > 0
          ? (
              totalPnl /
              totalPositionValue
            ) * 100
          : 0;


      const profitDays =
        dailyData.filter(
          (item) =>
            item.pnl > 0
        ).length;


      const lossDays =
        dailyData.filter(
          (item) =>
            item.pnl < 0
        ).length;


      const flatDays =
        dailyData.filter(
          (item) =>
            item.pnl === 0
        ).length;


      const maxDrawdown =
        dailyData.length > 0
          ? Math.min(
              ...dailyData.map(
                (item) =>
                  item.drawdown
              )
            )
          : 0;


      const maxDrawdownValue =
        dailyData.length > 0
          ? Math.min(
              ...dailyData.map(
                (item) =>
                  item.drawdownValue
              )
            )
          : 0;


      const totalSignals =
        dailyData.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.signalCount,
          0
        );


      return {

        maxTradeCapital,

        finalEquity,

        totalPnl,

        totalReturn,

        profitDays,

        lossDays,

        flatDays,

        maxDrawdown,

        maxDrawdownValue,

        totalSignals,

        totalPositionValue,

      };

    }, [
      dailyData,
      maxTradeCapital,
    ]);


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData =
    useMemo(() => {

      if (
        period === "daily"
      ) {
        return dailyData;
      }


      // ------------------------------------------------------
      // WEEKLY
      // ------------------------------------------------------

      if (
        period === "weekly"
      ) {

        const grouped = {};


        dailyData.forEach(
          (item) => {

            const date =
              new Date(
                item.dateKey
              );


            const firstDay =
              new Date(
                date.getFullYear(),
                0,
                1
              );


            const diff =
              Math.floor(
                (
                  date -
                  firstDay
                ) /
                86400000
              );


            const week =
              Math.ceil(
                (
                  diff +
                  firstDay.getDay() +
                  1
                ) / 7
              );


            const key =
              `${date.getFullYear()}-W${week}`;


            if (
              !grouped[key]
            ) {

              grouped[key] = {

                key,

                dateKey:
                  item.dateKey,

                pnl: 0,

                equity:
                  item.equity,

                returnPercent:
                  0,

                signals: 0,

                positionValue:
                  0,

              };

            }


            grouped[key].pnl +=
              item.pnl;


            grouped[key].equity =
              item.equity;


            grouped[key].signals +=
              item.signalCount;


            grouped[key].positionValue +=
              item.positionValue;

          }
        );


        return Object.values(
          grouped
        )
          .sort(
            (a, b) =>
              a.dateKey.localeCompare(
                b.dateKey
              )
          )
          .map(
            (item) => {

              const returnPercent =
                item.positionValue > 0
                  ? (
                      item.pnl /
                      item.positionValue
                    ) * 100
                  : 0;


              return {

                ...item,

                date:
                  item.key,

                averageReturn:
                  returnPercent,

              };

            }
          );

      }


      // ------------------------------------------------------
      // MONTHLY
      // ------------------------------------------------------

      if (
        period === "monthly"
      ) {

        const grouped = {};


        dailyData.forEach(
          (item) => {

            const monthKey =
              item.dateKey.slice(
                0,
                7
              );


            if (
              !grouped[monthKey]
            ) {

              grouped[monthKey] = {

                key:
                  monthKey,

                dateKey:
                  item.dateKey,

                pnl:
                  0,

                equity:
                  item.equity,

                signals:
                  0,

                positionValue:
                  0,

              };

            }


            grouped[
              monthKey
            ].pnl +=
              item.pnl;


            grouped[
              monthKey
            ].equity =
              item.equity;


            grouped[
              monthKey
            ].signals +=
              item.signalCount;


            grouped[
              monthKey
            ].positionValue +=
              item.positionValue;

          }
        );


        return Object.values(
          grouped
        )
          .sort(
            (a, b) =>
              a.dateKey.localeCompare(
                b.dateKey
              )
          )
          .map(
            (item) => {

              const returnPercent =
                item.positionValue > 0
                  ? (
                      item.pnl /
                      item.positionValue
                    ) * 100
                  : 0;


              return {

                ...item,

                date:
                  item.key,

                averageReturn:
                  returnPercent,

              };

            }
          );

      }


      return dailyData;

    }, [
      dailyData,
      period,
    ]);


  // ==========================================================
  // TOOLTIP EQUITY
  // ==========================================================

  const EquityTooltip = ({
    active,
    payload,
  }) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }


    const item =
      payload[0].payload;


    return (

      <div className="
        rounded-lg
        border
        border-zinc-700
        bg-zinc-950
        px-4
        py-3
        shadow-xl
      ">

        <p className="
          mb-2
          text-xs
          font-medium
          text-zinc-400
        ">
          {item.date}
        </p>


        <p className="
          text-sm
          font-semibold
          text-white
        ">
          Akumulasi P&L
        </p>


        <p className="
          text-base
          font-semibold
          text-blue-400
        ">
          {formatCurrency(
            item.equity
          )}
        </p>


        <div className="
          mt-2
          border-t
          border-zinc-800
          pt-2
        ">

          <p className="
            text-xs
            text-zinc-500
          ">
            P&L Hari Ini
          </p>

          <p className={`
            text-sm
            font-medium
            ${
              item.pnl >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          `}>
            {item.pnl >= 0
              ? "+"
              : ""}
            {formatCurrency(
              item.pnl
            )}
          </p>

        </div>


        <div className="
          mt-2
          border-t
          border-zinc-800
          pt-2
        ">

          <p className="
            text-xs
            text-zinc-500
          ">
            Modal Digunakan
          </p>

          <p className="
            text-xs
            font-medium
            text-zinc-300
          ">
            {formatCurrency(
              item.positionValue
            )}
          </p>

        </div>

      </div>

    );

  };


  // ==========================================================
  // TOOLTIP DAILY
  // ==========================================================

  const DailyTooltip = ({
    active,
    payload,
  }) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }


    const item =
      payload[0].payload;


    return (

      <div className="
        rounded-lg
        border
        border-zinc-700
        bg-zinc-950
        px-4
        py-3
        shadow-xl
      ">

        <p className="
          mb-2
          text-xs
          font-medium
          text-zinc-400
        ">
          {item.date}
        </p>


        <p className="
          text-xs
          text-zinc-500
        ">
          Daily P&L
        </p>


        <p className={`
          text-base
          font-semibold
          ${
            item.pnl >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        `}>
          {item.pnl >= 0
            ? "+"
            : ""}
          {formatCurrency(
            item.pnl
          )}
        </p>


        <p className="
          mt-1
          text-xs
          text-zinc-500
        ">
          Return:{" "}
          <span className="
            text-zinc-300
          ">
            {formatPercent(
              item.averageReturn
            )}
          </span>
        </p>


        <p className="
          text-xs
          text-zinc-500
        ">
          Signal:{" "}
          <span className="
            text-zinc-300
          ">
            {item.signalCount}
          </span>
        </p>


        <p className="
          text-xs
          text-zinc-500
        ">
          Modal digunakan:{" "}
          <span className="
            text-zinc-300
          ">
            {formatCurrency(
              item.positionValue
            )}
          </span>
        </p>

      </div>

    );

  };


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !data ||
    data.length === 0 ||
    dailyData.length === 0
  ) {

    return (

      <section className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900/40
        p-6
      ">

        <div className="
          flex
          items-center
          gap-3
        ">

          <Activity
            size={20}
            className="
              text-zinc-500
            "
          />

          <div>

            <h2 className="
              text-lg
              font-semibold
              text-white
            ">
              Performance
            </h2>

            <p className="
              mt-1
              text-sm
              text-zinc-500
            ">
              Belum ada data harga 09:30
              yang dapat dianalisis.
            </p>

          </div>

        </div>

      </section>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section className="
      space-y-4
    ">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div>

        <div className="
          flex
          items-center
          gap-2
        ">

          <BarChart3
            size={20}
            className="
              text-blue-400
            "
          />

          <h2 className="
            text-lg
            font-semibold
            text-white
          ">
            Performance
          </h2>

        </div>

        <p className="
          mt-1
          text-sm
          text-zinc-500
        ">
          Forward test berdasarkan modal
          maksimal untuk setiap trade.
        </p>

      </div>


      {/* ======================================================
          MODAL PER TRADE
      ======================================================= */}

      <div className="
        rounded-xl
        border
        border-blue-900/50
        bg-blue-950/20
        p-4
      ">

        <div className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        ">

          <div>

            <div className="
              flex
              items-center
              gap-2
            ">

              <Wallet
                size={18}
                className="
                  text-blue-400
                "
              />

              <h3 className="
                text-sm
                font-semibold
                text-white
              ">
                Modal Maksimal per Trade
              </h3>

            </div>

            <p className="
              mt-1
              text-xs
              leading-5
              text-zinc-500
            ">
              Maksimal dana yang boleh
              digunakan untuk satu posisi.
              Jumlah saham otomatis dihitung
              dalam kelipatan 1 lot.
            </p>

          </div>


          <div className="
            w-full
            sm:w-[240px]
          ">

            <label className="
              mb-1.5
              block
              text-xs
              text-zinc-500
            ">
              Maksimal Modal / Trade
            </label>

            <div className="
              flex
              items-center
              rounded-lg
              border
              border-zinc-700
              bg-zinc-950
              focus-within:border-blue-500
            ">

              <span className="
                pl-3
                text-sm
                text-zinc-500
              ">
                Rp
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={
                  maxTradeCapital
                    ? Number(
                        maxTradeCapital
                      ).toLocaleString(
                        "id-ID"
                      )
                    : ""
                }
                onChange={(e) =>
                  handleCapitalChange(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  px-2
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                "
              />

            </div>

          </div>

        </div>


        <div className="
          mt-4
          grid
          grid-cols-1
          gap-2
          sm:grid-cols-3
        ">

          <div className="
            rounded-lg
            border
            border-zinc-800
            bg-zinc-950/50
            p-3
          ">

            <p className="
              text-[11px]
              text-zinc-500
            ">
              Modal Maksimal
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-white
            ">
              {formatCurrency(
                maxTradeCapital
              )}
            </p>

          </div>


          <div className="
            rounded-lg
            border
            border-zinc-800
            bg-zinc-950/50
            p-3
          ">

            <p className="
              text-[11px]
              text-zinc-500
            ">
              Aturan Lot
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-white
            ">
              1 lot = 100 saham
            </p>

          </div>


          <div className="
            rounded-lg
            border
            border-zinc-800
            bg-zinc-950/50
            p-3
          ">

            <p className="
              text-[11px]
              text-zinc-500
            ">
              Dasar Perhitungan
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-blue-400
            ">
              Harga Sore × Lot
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-2
        xl:grid-cols-5
      ">

        {/* MODAL PER TRADE */}

        <div className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <span className="
              text-xs
              text-zinc-500
            ">
              Modal / Trade
            </span>

            <Wallet
              size={16}
              className="
                text-zinc-500
              "
            />

          </div>

          <p className="
            mt-2
            text-lg
            font-semibold
            text-white
          ">
            {formatCompactCurrency(
              summary.maxTradeCapital
            )}
          </p>

        </div>


        {/* AKUMULASI P&L */}

        <div className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <span className="
              text-xs
              text-zinc-500
            ">
              Akumulasi P&L
            </span>

            <TrendingUp
              size={16}
              className="
                text-blue-400
              "
            />

          </div>

          <p className={`
            mt-2
            text-lg
            font-semibold
            ${
              summary.totalPnl >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          `}>
            {summary.totalPnl >= 0
              ? "+"
              : ""}
            {formatCompactCurrency(
              summary.totalPnl
            )}
          </p>

        </div>


        {/* PNL */}

        <div className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <span className="
              text-xs
              text-zinc-500
            ">
              Total P&L
            </span>

            {summary.totalPnl >= 0 ? (

              <ArrowUpRight
                size={16}
                className="
                  text-emerald-400
                "
              />

            ) : (

              <ArrowDownRight
                size={16}
                className="
                  text-red-400
                "
              />

            )}

          </div>

          <p className={`
            mt-2
            text-lg
            font-semibold
            ${
              summary.totalPnl >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          `}>
            {summary.totalPnl >= 0
              ? "+"
              : ""}
            {formatCompactCurrency(
              summary.totalPnl
            )}
          </p>

        </div>


        {/* RETURN */}

        <div className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <span className="
              text-xs
              text-zinc-500
            ">
              Return
            </span>

            <Activity
              size={16}
              className="
                text-zinc-500
              "
            />

          </div>

          <p className={`
            mt-2
            text-lg
            font-semibold
            ${
              summary.totalReturn >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          `}>
            {formatPercent(
              summary.totalReturn
            )}
          </p>

        </div>


        {/* MAX DD */}

        <div className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900/60
          p-4
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <span className="
              text-xs
              text-zinc-500
            ">
              Max Drawdown
            </span>

            <ArrowDownRight
              size={16}
              className="
                text-red-400
              "
            />

          </div>

          <p className="
            mt-2
            text-lg
            font-semibold
            text-red-400
          ">
            {summary.maxDrawdown.toFixed(
              2
            )}%
          </p>

        </div>

      </div>


      {/* ======================================================
          EQUITY / P&L CURVE
      ======================================================= */}

      <div className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900/60
        p-5
      ">

        <div className="
          mb-5
          flex
          flex-col
          justify-between
          gap-3
          sm:flex-row
          sm:items-center
        ">

          <div>

            <h3 className="
              text-sm
              font-semibold
              text-white
            ">
              Akumulasi P&L
            </h3>

            <p className="
              mt-1
              text-xs
              text-zinc-500
            ">
              Perkembangan keuntungan atau
              kerugian kumulatif berdasarkan
              modal aktual setiap trade.
            </p>

          </div>


          <div className="
            text-right
          ">

            <p className="
              text-xs
              text-zinc-500
            ">
              P&L Kumulatif
            </p>

            <p className={`
              text-sm
              font-semibold
              ${
                summary.finalEquity >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            `}>
              {summary.finalEquity >= 0
                ? "+"
                : ""}
              {formatCurrency(
                summary.finalEquity
              )}
            </p>

          </div>

        </div>


        <div className="
          h-[320px]
          w-full
        ">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={dailyData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: "#27272a",
                }}
                tickLine={false}
                minTickGap={35}
              />

              <YAxis
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={
                  formatCompactCurrency
                }
                width={75}
              />

              <Tooltip
                content={
                  <EquityTooltip />
                }
              />

              <ReferenceLine
                y={0}
                stroke="#52525b"
                strokeDasharray="5 5"
              />

              <Line
                type="monotone"
                dataKey="equity"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* ======================================================
          DAILY PNL
      ======================================================= */}

      <div className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900/60
        p-5
      ">

        <div className="
          mb-5
          flex
          flex-col
          justify-between
          gap-3
          sm:flex-row
          sm:items-center
        ">

          <div>

            <h3 className="
              text-sm
              font-semibold
              text-white
            ">
              Daily P&L
            </h3>

            <p className="
              mt-1
              text-xs
              text-zinc-500
            ">
              Akumulasi hasil setiap periode
              berdasarkan modal aktual yang
              digunakan.
            </p>

          </div>


          {/* PERIOD FILTER */}

          <div className="
            flex
            rounded-lg
            border
            border-zinc-800
            bg-zinc-950
            p-1
          ">

            {[
              {
                value: "daily",
                label: "Harian",
              },
              {
                value: "weekly",
                label: "Mingguan",
              },
              {
                value: "monthly",
                label: "Bulanan",
              },
            ].map(
              (item) => (

                <button
                  key={item.value}
                  onClick={() =>
                    setPeriod(
                      item.value
                    )
                  }
                  className={`
                    rounded-md
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    transition
                    ${
                      period ===
                      item.value
                        ? `
                          bg-zinc-800
                          text-white
                        `
                        : `
                          text-zinc-500
                          hover:text-zinc-300
                        `
                    }
                  `}
                >
                  {item.label}
                </button>

              )
            )}

          </div>

        </div>


        <div className="
          h-[280px]
          w-full
        ">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: "#27272a",
                }}
                tickLine={false}
                minTickGap={35}
              />

              <YAxis
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={
                  formatCompactCurrency
                }
                width={75}
              />

              <Tooltip
                content={
                  <DailyTooltip />
                }
              />

              <ReferenceLine
                y={0}
                stroke="#52525b"
              />

              <Bar
                dataKey="pnl"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
                fill="#60a5fa"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* DAILY SUMMARY */}

        <div className="
          mt-4
          grid
          grid-cols-3
          gap-3
          border-t
          border-zinc-800
          pt-4
        ">

          <div>

            <p className="
              text-xs
              text-zinc-500
            ">
              Profit Days
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-emerald-400
            ">
              {summary.profitDays}
            </p>

          </div>


          <div>

            <p className="
              text-xs
              text-zinc-500
            ">
              Loss Days
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-red-400
            ">
              {summary.lossDays}
            </p>

          </div>


          <div>

            <p className="
              text-xs
              text-zinc-500
            ">
              Flat Days
            </p>

            <p className="
              mt-1
              text-sm
              font-semibold
              text-zinc-400
            ">
              {summary.flatDays}
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          INFORMATION
      ======================================================= */}

      <div className="
        rounded-lg
        border
        border-zinc-800
        bg-zinc-900/30
        px-4
        py-3
      ">

        <p className="
          text-xs
          leading-5
          text-zinc-500
        ">

          <span className="
            font-medium
            text-zinc-400
          ">
            Cara membaca:
          </span>{" "}

          Modal maksimal per trade saat ini{" "}

          <span className="
            font-medium
            text-zinc-300
          ">
            {formatCurrency(
              maxTradeCapital
            )}
          </span>
          . Sistem menggunakan kelipatan
          1 lot = 100 saham. Jumlah lot
          dihitung dengan membagi modal
          maksimal dengan nilai 1 lot,
          kemudian dibulatkan ke bawah.
          Contohnya jika harga saham
          Rp90.000, maka 1 lot bernilai
          Rp9.000.000 sehingga maksimal
          pembelian adalah 1 lot. P&L
          dihitung berdasarkan modal aktual
          yang benar-benar digunakan pada
          trade tersebut.

        </p>

      </div>

    </section>

  );
}


export default ForwardTestPerformance;
