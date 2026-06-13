"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBaht } from "@/features/admin/money";

export type AdminSalesChartProps = {
  data: Array<{ month: string; revenue: number; orders: number }>;
};

const compactBaht = new Intl.NumberFormat("th-TH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function AdminSalesChart({ data }: AdminSalesChartProps) {
  return (
    <>
      <div aria-hidden="true" className="admin-sales-chart">
        <ResponsiveContainer
          height="100%"
          initialDimension={{ width: 900, height: 320 }}
          minWidth={0}
          width="100%"
        >
          <BarChart data={data} margin={{ left: 4, right: 8, top: 12 }}>
            <CartesianGrid
              stroke="#e8edf5"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(value) => compactBaht.format(Number(value))}
              tickLine={false}
              width={52}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 85, 255, 0.06)" }}
              formatter={(value) => [formatBaht(Number(value)), "ยอดขาย"]}
              labelFormatter={(label) => `เดือน ${label}`}
            />
            <Bar
              dataKey="revenue"
              fill="#0055ff"
              maxBarSize={42}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table aria-label="ยอดขายรายเดือน" className="sr-only">
        <thead>
          <tr>
            <th>เดือน</th>
            <th>ยอดขาย</th>
            <th>คำสั่งซื้อ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              <td>{formatBaht(row.revenue)}</td>
              <td>{row.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
