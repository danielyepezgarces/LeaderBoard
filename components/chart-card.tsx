"use client"

import { Line, Bar } from "react-chartjs-2"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"

interface ChartCardProps {
  chartData: {
    labels: string[]
    datasets: any[]
  }
  chartType: string
  setChartType: (value: string) => void
  detailedUserData: any[]
}

export function ChartCard({ chartData, chartType, setChartType, detailedUserData }: ChartCardProps) {
  const { msg } = useI18n()

  return (
    <Card className="bg-black/50 border-gray-700 backdrop-blur-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h4 className="text-lg font-medium text-white mb-2 sm:mb-0">{msg("chart.title")}</h4>

        <Select defaultValue={chartType} onValueChange={(value) => setChartType(value)}>
          <SelectTrigger className="w-32 bg-gray-800/70 border-gray-700 text-white">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">{msg("chart.lineChart")}</SelectItem>
            <SelectItem value="bar">{msg("chart.barChart")}</SelectItem>
            <SelectItem value="stacked">{msg("chart.stackedBar")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] flex items-center justify-center bg-white/90 rounded-lg p-4">
        {chartData && chartData.datasets && chartData.datasets.length > 0 ? (
          chartType === "line" ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                  tooltip: {
                    callbacks: {
                      title: (tooltipItems) => tooltipItems[0].label,
                      label: (context) => `${context.dataset.label}: ${context.parsed.y} edits`,
                    },
                  },
                },
              }}
            />
          ) : chartType === "bar" ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                },
              }}
            />
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    stacked: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                  x: {
                    stacked: true,
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  },
                },
              }}
            />
          )
        ) : (
          <div className="text-center text-gray-700">{msg("chart.noData")}</div>
        )}
      </div>
    </Card>
  )
}

