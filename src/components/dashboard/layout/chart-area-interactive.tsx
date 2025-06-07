"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/@/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/@/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/@/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/@/ui/toggle-group"

interface ChartData {
  date: string;
  revenue?: number;
  plays?: number;
  orders?: number;
  clients?: number;
  [key: string]: any;
}

interface ChartAreaInteractiveProps {
  data?: ChartData[];
  activeMetric?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  plays: {
    label: "Plays",
    color: "hsl(var(--chart-2))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
  clients: {
    label: "Clients",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data = [], activeMetric = 'revenue' }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Use the provided data or fallback to empty array
  const chartData = data.length > 0 ? data : []

  // Format the data for the chart based on the active metric
  const formattedData = chartData.map(item => ({
    date: item.date,
    [activeMetric]: item[activeMetric] || 0
  }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig[activeMetric as keyof typeof chartConfig]?.color || "#8884d8"} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={chartConfig[activeMetric as keyof typeof chartConfig]?.color || "#8884d8"} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              if (activeMetric === 'revenue') {
                return `$${value}`
              }
              return value.toLocaleString()
            }}
          />
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {new Date(data.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {activeMetric === 'revenue' ? `$${data[activeMetric].toFixed(2)}` : data[activeMetric].toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey={activeMetric}
            stroke={chartConfig[activeMetric as keyof typeof chartConfig]?.color || "#8884d8"}
            fillOpacity={1}
            fill={`url(#gradient-${activeMetric})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}