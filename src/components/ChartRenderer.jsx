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

  const data = chart.data || [];
  const series = chart.series || ["Pre", "Post"];
  const isVertical = (chart.layout || "horizontal") === "vertical";

  // High-contrast defaults for dark backgrounds; override via chart.colors
  const palette = chart.colors || ["#60A5FA", "#F59E0B"]; // blue + orange
  const grid = "#334155"; // slate-700
  const axis = "#E5E7EB"; // zinc-200
  const bg = "#0b1220";   // your app background

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
        >
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis
            type={isVertical ? "number" : "category"}
            dataKey={isVertical ? undefined : "channel"}
            stroke={axis}
            tick={{ fill: axis }}
            axisLine={{ stroke: grid }}
            tickLine={{ stroke: grid }}
          />
          <YAxis
            type={isVertical ? "category" : "number"}
            dataKey={isVertical ? "channel" : undefined}
            stroke={axis}
            tick={{ fill: axis }}
            axisLine={{ stroke: grid }}
            tickLine={{ stroke: grid }}
            width={isVertical ? 100 : undefined} // give y-labels room in vertical layout
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
