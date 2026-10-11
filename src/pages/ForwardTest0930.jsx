import { useEffect, useState } from "react";
import Papa from "papaparse";

import { Clock3, Upload } from "lucide-react";

import ForwardTestCards from "../components/forwardtest/ForwardTestCards";
import ForwardTestTable from "../components/forwardtest/ForwardTestTable";
import ParameterAnalysis from "../components/forwardtest/ParameterAnalysis";
import ForwardTestPerformance from "../components/forwardtest/ForwardTestPerformance";

function ForwardTest0930() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCSV();
  }, []);

  // =========================
  // LOAD CSV
  // =========================

  const loadCSV = () => {
    setLoading(true);
    setError("");

    fetch("/data/SEHEM.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("File CSV tidak ditemukan.");
        }

        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,

          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },

          error: (error) => {
            setError(error.message);
            setLoading(false);
          },
        });
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  // =========================
  // RETURN
  // =========================

  const calculateReturn = (hargaSore, harga0930) => {
    if (!hargaSore || !harga0930) {
      return null;
    }

    const entry = Number(String(hargaSore).replace(/,/g, ""));

    const exit = Number(String(harga0930).replace(/,/g, ""));

    if (!entry || !exit) {
      return null;
    }

    return ((exit - entry) / entry) * 100;
  };

  const formatReturn = (value) => {
    if (value === null) {
      return "-";
    }

    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getReturnColor = (value) => {
    if (value === null) {
      return "text-zinc-600";
    }

    if (value > 0) {
      return "text-emerald-400";
    }

    if (value < 0) {
      return "text-red-400";
    }

    return "text-zinc-400";
  };

  const getStatus = (value) => {
    if (value === null) {
      return null;
    }

    if (value > 0) {
      return "Profit";
    }

    if (value < 0) {
      return "Loss";
    }

    return "Flat";
  };

  // =========================
  // SCORE COLOR
  // =========================

  const getScoreColor = (score) => {
    const value = Number(score);

    if (Number.isNaN(value)) {
      return "text-zinc-500";
    }

    if (value >= 20) {
      return "text-emerald-400";
    }

    if (value >= 10) {
      return "text-amber-400";
    }

    if (value > 0) {
      return "text-zinc-300";
    }

    return "text-zinc-600";
  };

  // =========================
  // TOTAL SCORE STYLE
  // =========================

  const getTotalScoreStyle = (score) => {
    const value = Number(score);

    if (value >= 90) {
      return `
        bg-emerald-500/15
        text-emerald-400
        border
        border-emerald-500/20
      `;
    }

    if (value >= 80) {
      return `
        bg-blue-500/15
        text-blue-400
        border
        border-blue-500/20
      `;
    }

    if (value >= 70) {
      return `
        bg-amber-500/15
        text-amber-400
        border
        border-amber-500/20
      `;
    }

    return `
      bg-zinc-800
      text-zinc-400
      border
      border-zinc-700
    `;
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div
        className="
          flex
          flex-col
          justify-between
          gap-4
          lg:flex-row
          lg:items-center
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <Clock3 size={20} className="text-blue-400" />

            <h1 className="text-2xl font-semibold text-white">
              Forward Test 09:30
            </h1>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            Data forward test sampai update harga pukul 09:30
          </p>
        </div>

        <button
          onClick={loadCSV}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-zinc-950
            transition
            hover:bg-zinc-200
            active:scale-[0.98]
          "
        >
          <Upload size={16} />
          Reload CSV
        </button>
      </div>

      {/* ================= CARDS ================= */}

      <ForwardTestCards data={data} />

      {/* ================= PARAMETER ANALYSIS ================= */}

      <ParameterAnalysis data={data} />

      {/* ========================= PERFORMANCE========================= */}

      <ForwardTestPerformance data={data} />

      {/* ================= FORWARD TEST TABLE ================= */}

      <ForwardTestTable
        data={data}
        loading={loading}
        error={error}
        calculateReturn={calculateReturn}
        formatReturn={formatReturn}
        getReturnColor={getReturnColor}
        getStatus={getStatus}
        getScoreColor={getScoreColor}
        getTotalScoreStyle={getTotalScoreStyle}
      />
    </div>
  );
}

export default ForwardTest0930;
