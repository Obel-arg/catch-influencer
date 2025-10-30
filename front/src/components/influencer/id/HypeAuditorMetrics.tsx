"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HypeAuditorMetricsProps {
  data: any;
}

export default function HypeAuditorMetrics({ data }: HypeAuditorMetricsProps) {
  const MetricCard = ({
    label,
    value,
    suffix = "",
    icon,
    gradient = "from-blue-500 to-blue-600",
    change,
  }: {
    label: string;
    value: string | number;
    suffix?: string;
    icon?: React.ReactNode;
    gradient?: string;
    change?: { value: number; positive: boolean };
  }) => {
    return (
      <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}
                >
                  {icon}
                </div>
              )}
              <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
            {change && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  change.positive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {change.positive ? "↑" : "↓"} {Math.abs(change.value)}%
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {suffix && (
              <span className="text-lg font-medium text-gray-500">{suffix}</span>
            )}
          </div>
        </div>
        <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
      </div>
    );
  };

  const prices = data.blogger_prices || {};
  const reach = data.blogger_reach || {};
  const erData = data.er_data || {};

  // Prepare chart data for ER history
  const erHistoryData = erData.performance
    ? Object.entries(erData.performance).map(([period, metrics]: any) => ({
        period: period.replace("_", " ").toUpperCase(),
        value: parseFloat(metrics.value?.toFixed(2)) || 0,
        min: parseFloat(metrics.min?.toFixed(2)) || 0,
        max: parseFloat(metrics.max?.toFixed(2)) || 0,
      }))
    : [];

  // Prepare chart data for growth
  const growthData = data.growth_performance
    ? Object.entries(data.growth_performance).map(([period, metrics]: any) => ({
        period: period.replace("_", " ").toUpperCase(),
        value: parseFloat(metrics.value?.toFixed(2)) || 0,
        mark: metrics.mark,
      }))
    : [];

  // Colors for charts
  const chartColors = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  };

  return (
    <div className="mt-6 space-y-8 pb-8">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Seguidores Totales"
          value={(data.followers / 1000).toFixed(1)}
          suffix="K"
          gradient="from-blue-500 to-blue-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Promedio de Likes"
          value={(data.avg_likes / 1000).toFixed(1)}
          suffix="K"
          gradient="from-pink-500 to-rose-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Total de Posts"
          value={data.posts_count?.toLocaleString()}
          gradient="from-purple-500 to-purple-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Engagement Rate"
          value={data.engagement_rate?.toFixed(2)}
          suffix="%"
          gradient="from-green-500 to-emerald-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Engagement Metrics - Compact Cards */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          Métricas de Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Promedio Comentarios
              </span>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.avg_comments?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Siguiendo
              </span>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.followings?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Frecuencia Posts
              </span>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.post_frequency?.toFixed(1)}
              <span className="text-base font-medium text-gray-500 ml-2">
                /mes
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Growth Performance Chart */}
      {growthData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                Rendimiento de Crecimiento
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Crecimiento de seguidores por período
              </p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="period"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [`${value}%`, "Crecimiento"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {growthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value > 0 ? chartColors.success : chartColors.danger
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pricing Information */}
      {Object.keys(prices).length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            Información de Precios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.post_price && (
              <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Precio por Post
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${prices.post_price?.toLocaleString()}
                </p>
              </div>
            )}
            {prices.post_price_from && prices.post_price_to && (
              <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Rango de Precios
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mínimo</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${prices.post_price_from?.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-600 rounded-full"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Máximo</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${prices.post_price_to?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {prices.stories_price && (
              <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Precio por Story
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${prices.stories_price?.toLocaleString()}
                </p>
              </div>
            )}
            {prices.cpm && (
              <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                    CPM
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Costo por Mil
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${prices.cpm?.toFixed(2)}
                </p>
              </div>
            )}
            {prices.cpe && (
              <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                    CPE
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Costo por Engagement
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${prices.cpe?.toFixed(3)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reach Information */}
      {Object.keys(reach).length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            Alcance e Impresiones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reach.reach && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Alcance Estimado
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {(reach.reach / 1000).toFixed(0)}K
                </p>
              </div>
            )}
            {reach.impressions && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Impresiones
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {(reach.impressions / 1000).toFixed(0)}K
                </p>
              </div>
            )}
            {reach.stories_reach && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Alcance Stories
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {(reach.stories_reach / 1000).toFixed(0)}K
                </p>
              </div>
            )}
            {reach.reach_mark && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Calidad de Alcance
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 capitalize">
                  {reach.reach_mark}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yearly Growth - Modern Card */}
      {data.yearly_growth && (
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
            Crecimiento Anual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Crecimiento 12 Meses
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.yearly_growth.value?.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Promedio
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.yearly_growth.avg?.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Evaluación
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gradient-to-r from-green-200 to-green-600 rounded-full"></div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {data.yearly_growth.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Warnings */}
      {data.growth && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {data.growth.title}
              </h4>
              <p className="text-gray-700">{data.growth.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
