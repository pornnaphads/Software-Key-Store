"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBaht } from "@/features/admin/money";

export type AdminSalesChartProps = {
  data: Array<{ month: string; revenue: number; orders: number }>;
};

const formatBarLabel = (value: any) => {
  const num = Number(value);
  if (num >= 1000) {
    return `฿${(num / 1000).toFixed(0)}K`;
  }
  return `฿${num}`;
};

export function AdminSalesChart({ data }: AdminSalesChartProps) {
  // Custom label renderer to color the last label blue and others dark gray
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    const isLast = index === data.length - 1;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill={isLast ? "#0061ff" : "#1f2937"}
        fontSize={12}
        fontWeight={750}
        textAnchor="middle"
      >
        {formatBarLabel(value)}
      </text>
    );
  };

  return (
    <>
      <div aria-hidden="true" className="admin-sales-chart" style={{ height: "280px" }}>
        <ResponsiveContainer
          height="100%"
          initialDimension={{ width: 600, height: 280 }}
          minWidth={0}
          width="100%"
        >
          <BarChart data={data} margin={{ left: 10, right: 10, top: 25, bottom: 5 }}>
            <CartesianGrid
              stroke="#e8edf5"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100000]}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 550 }}
              tickFormatter={(value) => {
                const val = Number(value);
                return val === 0 ? "0" : `${(val / 1000).toFixed(0)}K`;
              }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 97, 255, 0.04)" }}
              formatter={(value) => [formatBaht(Number(value)), "ยอดขาย"]}
              labelFormatter={(label) => `ปี ${label}`}
            />
            <Bar
              dataKey="revenue"
              maxBarSize={42}
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="revenue"
                content={renderCustomizedLabel}
              />
              {data.map((entry, index) => {
                const isLast = index === data.length - 1;
                return (
                  <Cell
                    fill={isLast ? "#0061ff" : "#adc4ff"}
                    key={`cell-${index}`}
                  />
                );
              })}
            </Bar>
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
