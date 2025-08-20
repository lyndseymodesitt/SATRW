import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function ChartRenderer({ chart }) {
  if (!chart || chart.type !== "bar") return null;
  const data = chart.data || [];
  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "8px auto 12px" }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout={chart.layout || "horizontal"}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type={chart.layout === "vertical" ? "number" : "category"} dataKey={chart.layout === "vertical" ? undefined : "channel"} />
          <YAxis type={chart.layout === "vertical" ? "category" : "number"} dataKey={chart.layout === "vertical" ? "channel" : undefined} />
          <Tooltip /><Legend />
          <Bar dataKey="Pre" /><Bar dataKey="Post" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
