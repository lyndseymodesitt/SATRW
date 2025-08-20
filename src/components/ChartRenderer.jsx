// src/components/ChartRenderer.jsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

export default function ChartRenderer({ chart }) {
  if (!chart || chart.type !== "bar") return null;

  // ---- Normalize data -------------------------------------------------------
  const raw = Array.isArray(chart.data) ? chart.data : [];

  const toNumber = (v) => {
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[^0-9.+\-eE]/g, "")); // strip junk
    return Number.isFinite(n) ? n : 0;
  };

  const data = raw.map((row) => {
    const out = { ...row };
    for (const [k, v] of Object.entries(out)) {
      if (k !== "channel") out[k] = toNumber(v);
    }
    return out;
  });

  // Infer series keys if not specified
  let series = Array.isArray(chart.series) && chart.series.length
    ? chart.series
    : Array.from(
        new Set(
          data.flatMap((d) => Object.keys(d).filter((k) => k !== "channel"))
        )
      );

  // Keep only keys that actually have numeric values
  series = series.filter((k) => data.some((d) => typeof d[k] === "number"));

  // ---- Visuals --------------------------------------------------------------
  const isVertical = (chart.layout || "horizontal") === "vertical";

  // Default palette: rose / teal (add a couple extras for safety)
  const palette = (chart.colors && chart.colors.length
    ? chart.colors
    : ["#F43F5E", "#06B6D4", "#A78BFA", "#22C55E"] // rose, teal, violet, green
  ).slice();

  const grid = "#334155"; // slate-700
  const axis = "#E5E7EB"; // zinc-200
  const bg = "#0b1220";   // app background

  if (!data.length || !series.length) {
    return (
      <div style={{ textAlign: "center", opacity: 0.7, margin: "8px 0 12px" }}>
        (No chart data)
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "8px auto 12px" }}>
      {chart.title && (
        <div style={{ textAlign: "center", marginBottom: 8, fontWeight: 600 }}>
          {chart.title}
        </div>
      )}
      <ResponsiveContainer width="100%" height={isVertical ? 360 : 320}>
        <BarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          barCategoryGap={12}
          margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis
            type={isVertical ? "number" : "category"}
            dataKey={isVertical ? undefined : "channel"}
            stroke={axis}
            tick={{ fill: axis }}
            axisLine={{ stroke: grid }}
            tickLine={{ stroke: grid }}
            allowDecimals={false}
          />
          <YAxis
            type={isVertical ? "category" : "number"}
            dataKey={isVertical ? "channel" : undefined}
            stroke={axis}
            tick={{ fill: axis }}
            axisLine={{ stroke: grid }}
            tickLine={{ stroke: grid }}
            width={isVertical ? 110 : undefined} // more room for labels
            allowDecimals={false}
          />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{ background: bg, border: `1px solid ${grid}`, color: axis }}
            labelStyle={{ color: axis }}
          />
          <Legend wrapperStyle={{ color: axis }} />
          {series.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              fill={palette[i % palette.length]}
              radius={4}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {chart.note && (
        <div style={{ textAlign: "center", marginTop: 6, opacity: 0.8, fontSize: 13 }}>
          {chart.note}
        </div>
      )}
    </div>
  );
}
